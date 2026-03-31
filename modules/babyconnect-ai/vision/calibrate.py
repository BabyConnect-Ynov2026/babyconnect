"""
vision/calibrate.py
────────────────────
Interactive calibration tool.
Run this ONCE to find the correct HSV range for your ball
and the table boundary fractions.

Controls:
  Trackbars  →  adjust HSV lower/upper bounds
  Mouse drag →  draw table rectangle (right-click to reset)
  P          →  print current config values to copy into config.py
  ESC        →  quit
"""

import logging

import cv2
import numpy as np

from vision.camera import CameraSource
from vision.config import FRAME_W, FRAME_H, CAMERA_URL

log = logging.getLogger("vision.calibrate")
logging.basicConfig(level=logging.INFO)

WIN_SRC  = "Source (original)"
WIN_MASK = "HSV Mask"
WIN_CTRL = "Controls"

# Shared state
_hsv_lo = [0,   0, 200]
_hsv_hi = [180, 60, 255]
_rect   = [None]   # [(x1,y1,x2,y2)] or [None]
_drag   = [False, 0, 0]


def _nothing(_): pass


def _make_controls():
    cv2.namedWindow(WIN_CTRL, cv2.WINDOW_NORMAL)
    for name, val, mx in [
        ("H_lo", _hsv_lo[0], 180),
        ("S_lo", _hsv_lo[1], 255),
        ("V_lo", _hsv_lo[2], 255),
        ("H_hi", _hsv_hi[0], 180),
        ("S_hi", _hsv_hi[1], 255),
        ("V_hi", _hsv_hi[2], 255),
    ]:
        cv2.createTrackbar(name, WIN_CTRL, val, mx, _nothing)
    # dummy image so the window renders
    cv2.imshow(WIN_CTRL, np.zeros((50, 400, 3), dtype=np.uint8))


def _read_controls():
    _hsv_lo[0] = cv2.getTrackbarPos("H_lo", WIN_CTRL)
    _hsv_lo[1] = cv2.getTrackbarPos("S_lo", WIN_CTRL)
    _hsv_lo[2] = cv2.getTrackbarPos("V_lo", WIN_CTRL)
    _hsv_hi[0] = cv2.getTrackbarPos("H_hi", WIN_CTRL)
    _hsv_hi[1] = cv2.getTrackbarPos("S_hi", WIN_CTRL)
    _hsv_hi[2] = cv2.getTrackbarPos("V_hi", WIN_CTRL)


def _mouse_cb(event, x, y, flags, _param):
    if event == cv2.EVENT_RBUTTONDOWN:
        _rect[0] = None
    elif event == cv2.EVENT_LBUTTONDOWN:
        _drag[0], _drag[1], _drag[2] = True, x, y
    elif event == cv2.EVENT_MOUSEMOVE and _drag[0]:
        _rect[0] = (_drag[1], _drag[2], x, y)
    elif event == cv2.EVENT_LBUTTONUP:
        _drag[0] = False
        if _rect[0]:
            x1, y1, x2, y2 = _rect[0]
            _rect[0] = (min(x1,x2), min(y1,y2), max(x1,x2), max(y1,y2))


def _print_config():
    print("\n─── Copy into vision/config.py ─────────────────────────")
    print(f"BALL_HSV_LOWER = ({_hsv_lo[0]}, {_hsv_lo[1]}, {_hsv_lo[2]})")
    print(f"BALL_HSV_UPPER = ({_hsv_hi[0]}, {_hsv_hi[1]}, {_hsv_hi[2]})")
    if _rect[0]:
        x1, y1, x2, y2 = _rect[0]
        print(f"TABLE_LEFT   = {x1/FRAME_W:.3f}")
        print(f"TABLE_RIGHT  = {x2/FRAME_W:.3f}")
        print(f"TABLE_TOP    = {y1/FRAME_H:.3f}")
        print(f"TABLE_BOTTOM = {y2/FRAME_H:.3f}")
    print("────────────────────────────────────────────────────────\n")


def run():
    cv2.namedWindow(WIN_SRC,  cv2.WINDOW_NORMAL)
    cv2.namedWindow(WIN_MASK, cv2.WINDOW_NORMAL)
    cv2.setMouseCallback(WIN_SRC, _mouse_cb)
    _make_controls()

    for frame in CameraSource(CAMERA_URL):
        _read_controls()

        hsv  = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        lo   = np.array(_hsv_lo, dtype=np.uint8)
        hi   = np.array(_hsv_hi, dtype=np.uint8)
        mask = cv2.inRange(hsv, lo, hi)

        # overlay rectangle
        vis = frame.copy()
        if _rect[0]:
            x1, y1, x2, y2 = _rect[0]
            cv2.rectangle(vis, (x1, y1), (x2, y2), (0, 255, 0), 2)

        cv2.imshow(WIN_SRC,  vis)
        cv2.imshow(WIN_MASK, mask)

        key = cv2.waitKey(1) & 0xFF
        if key == 27:
            break
        elif key == ord("p"):
            _print_config()

    cv2.destroyAllWindows()


if __name__ == "__main__":
    run()
