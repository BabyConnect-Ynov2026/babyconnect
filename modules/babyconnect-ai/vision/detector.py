"""Main detector service and orchestration."""

from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass
from typing import Any

import cv2
import numpy as np

from vision.camera import CameraSource
from vision.config import (
    AUTO_START_DETECTION,
    BALL_HSV_LOWER,
    BALL_HSV_UPPER,
    BALL_LOST_FRAMES,
    BALL_MAX_RADIUS,
    BALL_MIN_RADIUS,
    CAMERA_URL,
    FRAME_H,
    FRAME_W,
    OVERLAY_COLOR,
    SHOT_MIN_SPEED_PX,
    SHOW_WINDOW,
    TABLE_BOTTOM,
    TABLE_LEFT,
    TABLE_RIGHT,
    TABLE_TOP,
)
from vision.events import EventType, server as event_server
from vision.goal_detection import GoalDetector

log = logging.getLogger("vision.detector")


def table_rect() -> tuple[int, int, int, int]:
    return (
        int(TABLE_LEFT * FRAME_W),
        int(TABLE_TOP * FRAME_H),
        int(TABLE_RIGHT * FRAME_W),
        int(TABLE_BOTTOM * FRAME_H),
    )


def detect_ball(frame: np.ndarray) -> tuple[int, int, int] | None:
    """Return (cx, cy, radius) for the best ball candidate."""
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    lo = np.array(BALL_HSV_LOWER, dtype=np.uint8)
    hi = np.array(BALL_HSV_UPPER, dtype=np.uint8)
    mask = cv2.inRange(hsv, lo, hi)

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    best: tuple[int, int, int] | None = None
    for contour in contours:
        (cx, cy), radius = cv2.minEnclosingCircle(contour)
        if not (BALL_MIN_RADIUS <= radius <= BALL_MAX_RADIUS):
            continue
        area = cv2.contourArea(contour)
        circle_area = np.pi * radius * radius
        circularity = area / circle_area if circle_area else 0.0
        if circularity <= 0.55:
            continue
        candidate = (int(cx), int(cy), int(radius))
        if best is None or candidate[2] > best[2]:
            best = candidate
    return best


@dataclass
class GameState:
    score_left: int = 0
    score_right: int = 0
    match_active: bool = False
    last_pos: tuple[int, int] | None = None
    frames_no_ball: int = 0
    ball_visible: bool = False
    last_goal_ts: float = 0.0

    def snapshot(self) -> dict[str, Any]:
        return {
            "score_left": self.score_left,
            "score_right": self.score_right,
            "match_active": self.match_active,
            "ball_visible": self.ball_visible,
            "last_pos": self.last_pos,
            "last_goal_ts": self.last_goal_ts,
        }

    def on_match_start(self) -> None:
        self.score_left = 0
        self.score_right = 0
        self.match_active = True
        event_server.emit(EventType.MATCH_START)

    def on_match_end(self) -> None:
        self.match_active = False
        event_server.emit(
            EventType.MATCH_END,
            {"score_left": self.score_left, "score_right": self.score_right},
        )

    def on_goal(self, side: str, confidence: float | None = None) -> None:
        if side == "left":
            self.score_left += 1
        else:
            self.score_right += 1
        self.last_goal_ts = time.time()
        payload = {
            "side": side,
            "score_left": self.score_left,
            "score_right": self.score_right,
        }
        if confidence is not None:
            payload["confidence"] = confidence
        event_server.emit(EventType.GOAL, payload)
        event_server.emit(EventType.SCORE_UPDATE, payload)

    def on_shot(self, speed: float, cx: int, cy: int) -> None:
        event_server.emit(
            EventType.SHOT,
            {"speed_px": round(speed, 1), "pos_x": cx, "pos_y": cy},
        )

    def on_ball_detected(self, cx: int, cy: int) -> None:
        if not self.ball_visible:
            event_server.emit(EventType.BALL_DETECTED, {"pos_x": cx, "pos_y": cy})
        self.ball_visible = True
        self.frames_no_ball = 0

    def on_ball_lost(self) -> None:
        if self.ball_visible:
            event_server.emit(EventType.BALL_LOST)
        self.ball_visible = False

    def update(self, detection: tuple[int, int, int] | None, goal: tuple[str, float] | None) -> None:
        if detection is None:
            self.frames_no_ball += 1
            if self.frames_no_ball >= BALL_LOST_FRAMES:
                self.on_ball_lost()
            self.last_pos = None
            return

        cx, cy, _radius = detection
        self.on_ball_detected(cx, cy)

        if self.last_pos is not None:
            dx = cx - self.last_pos[0]
            dy = cy - self.last_pos[1]
            speed = (dx * dx + dy * dy) ** 0.5
            if speed >= SHOT_MIN_SPEED_PX:
                self.on_shot(speed, cx, cy)

        self.last_pos = (cx, cy)

        if goal is not None:
            side, confidence = goal
            self.on_goal(side, confidence)


def draw_overlay(frame: np.ndarray, detection: tuple[int, int, int] | None, state: GameState) -> None:
    x1, y1, x2, y2 = table_rect()
    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 200, 0), 1)

    if detection is not None:
        cx, cy, radius = detection
        cv2.circle(frame, (cx, cy), radius, (0, 255, 255), 2)
        cv2.circle(frame, (cx, cy), 3, (0, 255, 255), -1)

    score_text = f"{state.score_left} : {state.score_right}"
    cv2.putText(
        frame,
        score_text,
        (FRAME_W // 2 - 60, 40),
        cv2.FONT_HERSHEY_DUPLEX,
        1.2,
        (255, 255, 255),
        2,
    )
    status = "MATCH ON" if state.match_active else "MATCH OFF"
    cv2.putText(
        frame,
        status,
        (10, FRAME_H - 12),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        OVERLAY_COLOR,
        1,
    )


class DetectorService:
    """Run the detector loop in a background thread."""

    def __init__(self, source_url: str | None = None) -> None:
        self._source_url = source_url or CAMERA_URL
        self._state = GameState()
        self._state_lock = threading.Lock()
        self._thread: threading.Thread | None = None
        self._stop_event = threading.Event()
        self._goal_detector = GoalDetector()
        self._last_error: str | None = None

    def start(self, source_url: str | None = None) -> bool:
        if self.is_running:
            return False
        if source_url:
            self._source_url = source_url
        self._last_error = None
        self._stop_event.clear()
        event_server.start_background()
        self._thread = threading.Thread(target=self._run, daemon=True, name="vision-detector")
        self._thread.start()
        return True

    def stop(self) -> bool:
        if not self.is_running:
            return False
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5.0)
        return True

    @property
    def is_running(self) -> bool:
        return self._thread is not None and self._thread.is_alive()

    def start_match(self) -> None:
        with self._state_lock:
            self._state.on_match_start()
            self._goal_detector.reset()

    def end_match(self) -> None:
        with self._state_lock:
            self._state.on_match_end()

    def status(self) -> dict[str, Any]:
        with self._state_lock:
            state = self._state.snapshot()
        return {
            "running": self.is_running,
            "source_url": self._source_url,
            "last_error": self._last_error,
            "state": state,
        }

    def _run(self) -> None:
        source = CameraSource(self._source_url)
        event_server.emit(EventType.DETECTOR_STARTED, {"source_url": self._source_url})
        window_name = "babyconnect vision"

        try:
            if SHOW_WINDOW:
                cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)

            for frame in source:
                if self._stop_event.is_set():
                    break
                detection = detect_ball(frame)
                ball_pos = None if detection is None else (detection[0], detection[1])
                goal = self._goal_detector.update(frame, ball_pos)
                with self._state_lock:
                    self._state.update(detection, goal)
                    if SHOW_WINDOW:
                        draw_overlay(frame, detection, self._state)
                        self._goal_detector.draw_debug(frame)

                if SHOW_WINDOW:
                    cv2.imshow(window_name, frame)
                    if cv2.waitKey(1) & 0xFF == 27:
                        self._stop_event.set()
                        break
        except Exception as exc:
            self._last_error = str(exc)
            log.exception("Detector loop failed")
            event_server.emit(EventType.DETECTOR_ERROR, {"error": self._last_error})
        finally:
            source.stop()
            if SHOW_WINDOW:
                cv2.destroyAllWindows()
            event_server.emit(EventType.DETECTOR_STOPPED, {"source_url": self._source_url})


service = DetectorService()


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-7s %(name)s %(message)s",
    )
    event_server.start_background()
    if AUTO_START_DETECTION:
        service.start()
    else:
        log.info("Detector service initialized. Set VISION_AUTO_START=1 to auto-start detection.")

    try:
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        service.stop()
