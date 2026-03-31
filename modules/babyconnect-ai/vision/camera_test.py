import subprocess
import time
import threading
from shutil import which

import cv2
import numpy as np

URL = "http://10.31.32.237:4747/video"
WIDTH = 1280
HEIGHT = 720
FRAME_BYTES = WIDTH * HEIGHT * 3
MAX_RETRIES = 10
RETRY_DELAY = 2.0


def ffmpeg_path():
    p = which("ffmpeg")
    if not p:
        raise FileNotFoundError("ffmpeg not found in PATH")
    return p


def drain_stderr(proc, label="ffmpeg"):
    """Read stderr in a background thread to avoid pipe deadlock."""
    def _drain():
        try:
            for line in proc.stderr:
                txt = line.decode(errors="ignore").rstrip()
                if txt:
                    print(f"[{label}] {txt}")
        except Exception:
            pass
    t = threading.Thread(target=_drain, daemon=True)
    t.start()
    return t


def open_ffmpeg_http(url):
    exe = ffmpeg_path()
    cmd = [
        exe,
        "-hide_banner",
        "-loglevel", "warning",   # warning shows connection errors but not spam
        "-fflags", "nobuffer",
        "-flags", "low_delay",
        "-i", url,
        "-an",
        "-vf", f"scale={WIDTH}:{HEIGHT},format=bgr24",
        "-pix_fmt", "bgr24",
        "-f", "rawvideo",
        "-",
    ]
    print("FFmpeg cmd:", " ".join(cmd))
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        bufsize=10 ** 8,
    )
    drain_stderr(proc)
    return proc


def cleanup(proc):
    if proc is not None:
        try:
            proc.terminate()
            proc.wait(timeout=2)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
    cv2.destroyAllWindows()


def run():
    win = "Camera Debug"
    cv2.namedWindow(win, cv2.WINDOW_NORMAL)

    start = time.time()
    frame_count = 0
    attempt = 0

    while attempt < MAX_RETRIES:
        attempt += 1
        print(f"Connecting… attempt {attempt}/{MAX_RETRIES}")

        proc = open_ffmpeg_http(URL)

        # Give ffmpeg time to connect and buffer the first frame
        time.sleep(1.5)

        if proc.poll() is not None:
            print(f"ffmpeg exited immediately — DroidCam not reachable, retrying in {RETRY_DELAY}s")
            cleanup(proc)
            time.sleep(RETRY_DELAY)
            continue

        # --- Streaming loop ---
        try:
            while True:
                if proc.poll() is not None:
                    print("ffmpeg stopped — will reconnect")
                    break

                raw = proc.stdout.read(FRAME_BYTES)
                if len(raw) != FRAME_BYTES:
                    print(f"Incomplete frame ({len(raw)} bytes) — will reconnect")
                    break

                frame = (
                    np.frombuffer(raw, dtype=np.uint8)
                    .reshape((HEIGHT, WIDTH, 3))
                    .copy()
                )

                frame_count += 1
                elapsed = time.time() - start
                fps = frame_count / elapsed if elapsed > 0 else 0.0

                cv2.putText(
                    frame,
                    f"HTTP {WIDTH}x{HEIGHT}  FPS {fps:.1f}",
                    (10, 28),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (255, 255, 255),
                    2,
                )
                cv2.imshow(win, frame)

                if cv2.waitKey(1) & 0xFF == 27:
                    cleanup(proc)
                    return   # ESC → clean exit

                attempt = 0  # reset retry counter while stream is healthy

        except KeyboardInterrupt:
            cleanup(proc)
            return

        finally:
            cleanup(proc)

        print(f"Reconnecting in {RETRY_DELAY}s…")
        time.sleep(RETRY_DELAY)

    print(f"Gave up after {MAX_RETRIES} attempts.")
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run()