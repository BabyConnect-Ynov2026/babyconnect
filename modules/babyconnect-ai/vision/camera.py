"""
vision/camera.py
─────────────────
Reads raw BGR24 frames from the DroidCam MJPEG HTTP stream via ffmpeg.
Auto-reconnects on failure.
"""

import logging
import subprocess
import threading
import time
from shutil import which

import numpy as np

from vision.config import (
    CAMERA_URL, FRAME_W, FRAME_H, FRAME_BYTES,
    RECONNECT_DELAY, MAX_RETRIES,
)

log = logging.getLogger("vision.camera")


def _ffmpeg_exe() -> str:
    p = which("ffmpeg")
    if not p:
        raise FileNotFoundError("ffmpeg not found in PATH")
    return p


def _build_cmd(url: str) -> list[str]:
    return [
        _ffmpeg_exe(),
        "-hide_banner",
        "-loglevel",  "warning",
        "-fflags",    "nobuffer",
        "-flags",     "low_delay",
        "-i",          url,
        "-an",
        "-vf",        f"scale={FRAME_W}:{FRAME_H},format=bgr24",
        "-pix_fmt",   "bgr24",
        "-f",         "rawvideo",
        "-",
    ]


def _drain_stderr(proc: subprocess.Popen, stop: threading.Event):
    """Read ffmpeg stderr in background to prevent pipe deadlock."""
    try:
        for raw_line in proc.stderr:
            if stop.is_set():
                break
            line = raw_line.decode(errors="ignore").rstrip()
            if line:
                log.warning("[ffmpeg] %s", line)
    except Exception:
        pass


class CameraSource:
    """
    Iterator that yields (np.ndarray BGR frames, shape HxWx3).

    for frame in CameraSource():
        process(frame)
    """

    def __init__(self, url: str = CAMERA_URL):
        self.url      = url
        self._proc    = None
        self._stop_ev = threading.Event()

    # ── public ────────────────────────────────────────────────────────────────

    def __iter__(self):
        attempts = 0
        while attempts < MAX_RETRIES:
            attempts += 1
            log.info("Connecting to %s  (attempt %d)", self.url, attempts)

            self._proc = self._open()
            if self._proc is None:
                time.sleep(RECONNECT_DELAY)
                continue

            # Give ffmpeg a moment to connect
            time.sleep(1.0)

            if self._proc.poll() is not None:
                log.warning("ffmpeg exited immediately — retrying in %.1fs", RECONNECT_DELAY)
                self._kill()
                time.sleep(RECONNECT_DELAY)
                continue

            log.info("Stream open — reading frames")
            attempts = 0   # reset: connection succeeded

            for frame in self._read_frames():
                yield frame

            log.warning("Stream ended — reconnecting in %.1fs", RECONNECT_DELAY)
            self._kill()
            time.sleep(RECONNECT_DELAY)

        log.error("Max retries reached — giving up")

    def stop(self):
        self._stop_ev.set()
        self._kill()

    # ── private ───────────────────────────────────────────────────────────────

    def _open(self) -> subprocess.Popen | None:
        cmd = _build_cmd(self.url)
        log.debug("cmd: %s", " ".join(cmd))
        try:
            proc = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                bufsize=10 ** 8,
            )
            stop_ev = threading.Event()
            t = threading.Thread(target=_drain_stderr, args=(proc, stop_ev), daemon=True)
            t.start()
            proc._stderr_stop = stop_ev   # type: ignore[attr-defined]
            return proc
        except Exception as e:
            log.error("Failed to launch ffmpeg: %s", e)
            return None

    def _read_frames(self):
        assert self._proc is not None
        while not self._stop_ev.is_set():
            if self._proc.poll() is not None:
                break
            raw = self._proc.stdout.read(FRAME_BYTES)
            if len(raw) != FRAME_BYTES:
                log.warning("Incomplete frame (%d bytes)", len(raw))
                break
            frame = np.frombuffer(raw, dtype=np.uint8).reshape((FRAME_H, FRAME_W, 3)).copy()
            yield frame

    def _kill(self):
        if self._proc is None:
            return
        try:
            ev = getattr(self._proc, "_stderr_stop", None)
            if ev:
                ev.set()
            self._proc.terminate()
            self._proc.wait(timeout=2)
        except Exception:
            try:
                self._proc.kill()
            except Exception:
                pass
        self._proc = None
