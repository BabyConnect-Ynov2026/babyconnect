"""Runtime configuration for the vision service."""

from __future__ import annotations

import os
from pathlib import Path


def _env_str(name: str, default: str) -> str:
    value = os.getenv(name)
    return value.strip() if value and value.strip() else default


def _env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    return int(value) if value not in (None, "") else default


def _env_float(name: str, default: float) -> float:
    value = os.getenv(name)
    return float(value) if value not in (None, "") else default


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value in (None, ""):
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_tuple(name: str, default: tuple[int, int, int]) -> tuple[int, int, int]:
    value = os.getenv(name)
    if value in (None, ""):
        return default
    parts = [part.strip() for part in value.split(",")]
    if len(parts) != 3:
        raise ValueError(f"{name} must contain three comma-separated integers")
    return tuple(int(part) for part in parts)


BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SAMPLE_SOURCE = str(BASE_DIR / "test_640.mp4")

# Camera
CAMERA_URL = _env_str("VISION_SOURCE", "http://10.31.32.237:4747/video")
FRAME_W = _env_int("VISION_FRAME_W", 1280)
FRAME_H = _env_int("VISION_FRAME_H", 720)
FRAME_BYTES = FRAME_W * FRAME_H * 3
TARGET_FPS = _env_int("VISION_TARGET_FPS", 30)
RECONNECT_DELAY = _env_float("VISION_RECONNECT_DELAY", 2.0)
MAX_RETRIES = _env_int("VISION_MAX_RETRIES", 999)

# API
API_HOST = _env_str("VISION_API_HOST", "127.0.0.1")
API_PORT = _env_int("VISION_API_PORT", 5055)
AUTO_START_DETECTION = _env_bool("VISION_AUTO_START", False)

# WebSocket server
WS_HOST = _env_str("VISION_WS_HOST", "0.0.0.0")
WS_PORT = _env_int("VISION_WS_PORT", 8877)

# Table geometry
TABLE_LEFT = _env_float("VISION_TABLE_LEFT", 0.05)
TABLE_RIGHT = _env_float("VISION_TABLE_RIGHT", 0.95)
TABLE_TOP = _env_float("VISION_TABLE_TOP", 0.05)
TABLE_BOTTOM = _env_float("VISION_TABLE_BOTTOM", 0.95)

# Goal zones
GOAL_LEFT_X_MAX = _env_float("VISION_GOAL_LEFT_X_MAX", 0.08)
GOAL_RIGHT_X_MIN = _env_float("VISION_GOAL_RIGHT_X_MIN", 0.92)

# Ball detection
BALL_HSV_LOWER = _env_tuple("VISION_BALL_HSV_LOWER", (0, 0, 200))
BALL_HSV_UPPER = _env_tuple("VISION_BALL_HSV_UPPER", (180, 60, 255))
BALL_MIN_RADIUS = _env_int("VISION_BALL_MIN_RADIUS", 8)
BALL_MAX_RADIUS = _env_int("VISION_BALL_MAX_RADIUS", 30)

# Motion / shot detection
SHOT_MIN_SPEED_PX = _env_float("VISION_SHOT_MIN_SPEED_PX", 25.0)
BALL_LOST_FRAMES = _env_int("VISION_BALL_LOST_FRAMES", 10)

# Goal confirmation
GOAL_CONFIRM_FRAMES = _env_int("VISION_GOAL_CONFIRM_FRAMES", 3)
GOAL_COOLDOWN_S = _env_float("VISION_GOAL_COOLDOWN_S", 3.0)

# Debug overlay
SHOW_WINDOW = _env_bool("VISION_SHOW_WINDOW", False)
OVERLAY_COLOR = (0, 255, 0)
