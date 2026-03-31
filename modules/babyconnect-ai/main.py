"""
main.py
────────
Point d'entrée de babyconnect-ai.

Lance en parallèle :
  • Le serveur WebSocket (vision/events.py)  → asyncio dans un thread dédié
  • La boucle de détection vidéo             → thread principal (GUI OpenCV)

Usage :
    python main.py
    python main.py --no-window    # mode headless / production
    python main.py --calibrate    # outil de calibration HSV + table
"""

import argparse
import logging
import sys

log = logging.getLogger("babyconnect")


def parse_args():
    p = argparse.ArgumentParser(description="babyconnect-ai — détection babyfoot")
    p.add_argument("--no-window",  action="store_true",  help="Mode headless (pas d'affichage OpenCV)")
    p.add_argument("--calibrate",  action="store_true",  help="Lance l'outil de calibration")
    p.add_argument("--log-level",  default="INFO",
                   choices=["DEBUG", "INFO", "WARNING", "ERROR"],
                   help="Niveau de log (défaut : INFO)")
    return p.parse_args()


def main():
    args = parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s  %(levelname)-7s  %(name)s  %(message)s",
        stream=sys.stdout,
    )

    # Mode calibration
    if args.calibrate:
        log.info("Lancement de l'outil de calibration")
        from vision.calibrate import run
        run()
        return

    # Mode headless : désactive la fenêtre OpenCV
    if args.no_window:
        import vision.config as cfg
        cfg.SHOW_WINDOW = False
        log.info("Mode headless — pas d'affichage vidéo")

    # Lancement du module de détection (inclut le serveur WebSocket)
    log.info("Démarrage de babyconnect-ai")
    from vision.detector import main as run_detector
    run_detector()


if __name__ == "__main__":
    main()
