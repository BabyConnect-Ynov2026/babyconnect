"""
vision/goal_detection.py
─────────────────────────
Module de détection de but autonome et réutilisable.

Stratégie en 3 couches (toutes doivent valider pour confirmer un but) :

  1. ZONE   – la balle est détectée dans la zone de but
  2. FLOW   – le flux optique confirme un mouvement vers l'intérieur du but
              (la balle ne rebondit pas simplement contre le poteau)
  3. CROSS  – la balle a effectivement franchi la ligne de but
              (tracking de la trajectoire sur N frames)

Usage depuis detector.py :
    from vision.goal_detection import GoalDetector
    gd = GoalDetector()

    # dans la boucle frame :
    result = gd.update(frame, ball_pos)   # ball_pos = (cx, cy) ou None
    if result:
        side, confidence = result   # side = "left" | "right"
"""

import logging
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Deque, Optional, Tuple

import cv2
import numpy as np

from vision.config import (
    FRAME_W, FRAME_H,
    GOAL_LEFT_X_MAX, GOAL_RIGHT_X_MIN,
    TABLE_TOP, TABLE_BOTTOM,
    GOAL_CONFIRM_FRAMES,
    GOAL_COOLDOWN_S,
)

log = logging.getLogger("vision.goal_detection")

# ── Paramètres internes ───────────────────────────────────────────────────────

# Nombre de frames de trajectoire conservées pour détecter le franchissement
TRAJECTORY_LEN = 20

# Seuil de magnitude du flux optique pour valider le mouvement vers le but
FLOW_MAG_THRESHOLD = 2.0

# Fenêtre (px) autour du point de la balle pour calculer le flux optique
FLOW_PATCH = 40

# Nombre minimal de pixels avec flux entrant pour valider (robustesse au bruit)
FLOW_MIN_PIXELS = 30

# Confiance minimale (0.0–1.0) requise pour émettre un but
CONFIDENCE_THRESHOLD = 0.6


# ── Types internes ────────────────────────────────────────────────────────────

@dataclass
class GoalCandidate:
    side:          str              # "left" | "right"
    frames_in:     int  = 0        # frames consécutives dans la zone
    crossed:       bool = False    # franchissement de ligne confirmé
    flow_score:    float = 0.0     # score flux optique moyen
    first_ts:      float = field(default_factory=time.time)


# ── Utilitaires géométrie ─────────────────────────────────────────────────────

def _goal_lines_px() -> Tuple[int, int]:
    """Retourne (x_ligne_gauche, x_ligne_droite) en pixels."""
    return int(GOAL_LEFT_X_MAX * FRAME_W), int(GOAL_RIGHT_X_MIN * FRAME_W)


def _table_y_bounds() -> Tuple[int, int]:
    return int(TABLE_TOP * FRAME_H), int(TABLE_BOTTOM * FRAME_H)


def _in_goal_zone(cx: int, cy: int) -> Optional[str]:
    """Retourne 'left', 'right' ou None."""
    gl, gr = _goal_lines_px()
    y0, y1 = _table_y_bounds()
    if not (y0 <= cy <= y1):
        return None
    if cx < gl:
        return "left"
    if cx > gr:
        return "right"
    return None


# ── Flux optique ──────────────────────────────────────────────────────────────

def _compute_flow_score(
    prev_gray: np.ndarray,
    curr_gray: np.ndarray,
    cx: int,
    cy: int,
    side: str,
) -> float:
    """
    Calcule un score (0–1) indiquant que le mouvement optique
    dans le patch autour de la balle va bien VERS l'intérieur du but.

    Pour le but GAUCHE  → le flux doit aller vers la gauche  (dx < 0)
    Pour le but DROIT   → le flux doit aller vers la droite  (dx > 0)
    """
    h, w = prev_gray.shape
    x1 = max(0, cx - FLOW_PATCH)
    x2 = min(w, cx + FLOW_PATCH)
    y1 = max(0, cy - FLOW_PATCH)
    y2 = min(h, cy + FLOW_PATCH)

    patch_prev = prev_gray[y1:y2, x1:x2]
    patch_curr = curr_gray[y1:y2, x1:x2]

    if patch_prev.size == 0 or patch_curr.size == 0:
        return 0.0

    flow = cv2.calcOpticalFlowFarneback(
        patch_prev, patch_curr,
        None,
        pyr_scale=0.5,
        levels=2,
        winsize=15,
        iterations=3,
        poly_n=5,
        poly_sigma=1.1,
        flags=0,
    )

    fx = flow[..., 0]   # composante horizontale
    mag = np.sqrt(fx ** 2 + flow[..., 1] ** 2)

    # Pixels avec magnitude suffisante
    active = mag > FLOW_MAG_THRESHOLD
    n_active = int(active.sum())
    if n_active < FLOW_MIN_PIXELS:
        return 0.0

    # Fraction du flux actif allant dans la bonne direction
    if side == "left":
        going_in = (fx[active] < 0).sum()
    else:
        going_in = (fx[active] > 0).sum()

    return float(going_in) / float(n_active)


# ── Détection de franchissement de ligne ──────────────────────────────────────

def _has_crossed_line(
    trajectory: Deque[Tuple[int, int]],
    side: str,
) -> bool:
    """
    Vérifie que la trajectoire récente a effectivement franchi
    la ligne de but (transition de l'extérieur vers l'intérieur).
    """
    if len(trajectory) < 3:
        return False

    gl, gr = _goal_lines_px()
    pts = list(trajectory)

    if side == "left":
        # On cherche un point AVANT la ligne suivi d'un point APRÈS
        for i in range(len(pts) - 1):
            if pts[i][0] >= gl and pts[i + 1][0] < gl:
                return True
    else:
        for i in range(len(pts) - 1):
            if pts[i][0] <= gr and pts[i + 1][0] > gr:
                return True

    return False


# ── Classe principale ─────────────────────────────────────────────────────────

class GoalDetector:
    """
    Détecteur de but autonome.

    Appelé à chaque frame via .update(frame, ball_pos).
    Retourne (side, confidence) si un but est confirmé, sinon None.
    """

    def __init__(self):
        self._prev_gray:  Optional[np.ndarray]  = None
        self._trajectory: Deque[Tuple[int, int]] = deque(maxlen=TRAJECTORY_LEN)
        self._candidate:  Optional[GoalCandidate] = None
        self._last_goal_ts: float = 0.0

    # ── API publique ──────────────────────────────────────────────────────────

    def update(
        self,
        frame: np.ndarray,
        ball_pos: Optional[Tuple[int, int]],
    ) -> Optional[Tuple[str, float]]:
        """
        Appeler une fois par frame.

        Parameters
        ----------
        frame    : image BGR courante (H×W×3)
        ball_pos : (cx, cy) centre de la balle, ou None si non détectée

        Returns
        -------
        (side, confidence)  si but confirmé
        None                sinon
        """
        curr_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        result = self._process(curr_gray, ball_pos)
        self._prev_gray = curr_gray
        return result

    def draw_debug(self, frame: np.ndarray) -> np.ndarray:
        """
        Dessine les lignes de but et les infos de debug sur frame (in-place).
        Retourne frame.
        """
        gl, gr   = _goal_lines_px()
        y0, y1   = _table_y_bounds()

        # Lignes de but
        cv2.line(frame, (gl, y0), (gl, y1), (0, 0, 255), 2)
        cv2.line(frame, (gr, y0), (gr, y1), (0, 0, 255), 2)

        # Zones de but (transparence simulée)
        overlay = frame.copy()
        cv2.rectangle(overlay, (0, y0),  (gl, y1), (0, 0, 180), -1)
        cv2.rectangle(overlay, (gr, y0), (FRAME_W, y1), (0, 0, 180), -1)
        cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame)

        # Trajectoire
        pts = list(self._trajectory)
        for i in range(1, len(pts)):
            cv2.line(frame, pts[i - 1], pts[i], (255, 165, 0), 2)

        # Candidat en cours
        if self._candidate:
            c = self._candidate
            txt = (f"{c.side.upper()}  frames={c.frames_in}"
                   f"  flow={c.flow_score:.2f}"
                   f"  cross={'Y' if c.crossed else 'N'}")
            cv2.putText(frame, txt, (10, FRAME_H - 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 200, 255), 1)

        return frame

    def reset(self):
        """Remet à zéro l'état interne (appelé au début d'un match)."""
        self._prev_gray  = None
        self._trajectory.clear()
        self._candidate  = None
        self._last_goal_ts = 0.0

    # ── Logique interne ───────────────────────────────────────────────────────

    def _process(
        self,
        curr_gray: np.ndarray,
        ball_pos: Optional[Tuple[int, int]],
    ) -> Optional[Tuple[str, float]]:

        # Mise à jour trajectoire
        if ball_pos is not None:
            self._trajectory.append(ball_pos)

        # Cooldown inter-buts
        if time.time() - self._last_goal_ts < GOAL_COOLDOWN_S:
            return None

        if ball_pos is None:
            # Balle perdue → on annule le candidat (sauf si crossing déjà validé)
            if self._candidate and not self._candidate.crossed:
                self._candidate = None
            return None

        cx, cy = ball_pos
        zone = _in_goal_zone(cx, cy)

        # ── Pas dans une zone de but ──────────────────────────────────────────
        if zone is None:
            self._candidate = None
            return None

        # ── Initialisation ou changement de côté ──────────────────────────────
        if self._candidate is None or self._candidate.side != zone:
            self._candidate = GoalCandidate(side=zone)

        c = self._candidate

        # ── Couche 1 : accumulation de frames dans la zone ────────────────────
        c.frames_in += 1

        # ── Couche 2 : flux optique ───────────────────────────────────────────
        if self._prev_gray is not None:
            flow_s = _compute_flow_score(self._prev_gray, curr_gray, cx, cy, zone)
            # Moyenne mobile exponentielle
            c.flow_score = 0.6 * flow_s + 0.4 * c.flow_score

        # ── Couche 3 : franchissement de ligne ───────────────────────────────
        if not c.crossed:
            c.crossed = _has_crossed_line(self._trajectory, zone)

        # ── Calcul de la confiance globale ────────────────────────────────────
        frame_score = min(1.0, c.frames_in / GOAL_CONFIRM_FRAMES)
        cross_score = 1.0 if c.crossed else 0.0
        flow_score  = min(1.0, c.flow_score)

        # Pondération : franchissement > frames > flux
        confidence = (
            0.45 * cross_score +
            0.35 * frame_score +
            0.20 * flow_score
        )

        log.debug(
            "GoalCandidate %s | frames=%d cross=%s flow=%.2f → conf=%.2f",
            zone, c.frames_in, c.crossed, c.flow_score, confidence,
        )

        # ── Confirmation ──────────────────────────────────────────────────────
        if (
            c.frames_in >= GOAL_CONFIRM_FRAMES
            and confidence >= CONFIDENCE_THRESHOLD
        ):
            self._last_goal_ts = time.time()
            side = c.side
            self._candidate = None
            self._trajectory.clear()
            log.info("GOAL confirmed  side=%s  confidence=%.2f", side, confidence)
            return side, round(confidence, 3)

        return None
