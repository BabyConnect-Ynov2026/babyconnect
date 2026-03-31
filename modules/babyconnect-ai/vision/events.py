"""Thread-safe WebSocket event broadcaster."""

from __future__ import annotations

import asyncio
import json
import logging
import threading
import time
from collections import deque
from enum import Enum
from typing import Any

from websockets.asyncio.server import ServerConnection, serve

from vision.config import WS_HOST, WS_PORT

log = logging.getLogger("vision.events")


class EventType(str, Enum):
    MATCH_START = "match.start"
    MATCH_END = "match.end"
    GOAL = "goal"
    SCORE_UPDATE = "score.update"
    SHOT = "shot"
    BALL_DETECTED = "ball.detected"
    BALL_LOST = "ball.lost"
    DETECTOR_STARTED = "detector.started"
    DETECTOR_STOPPED = "detector.stopped"
    DETECTOR_ERROR = "detector.error"


class EventServer:
    def __init__(self) -> None:
        self._clients: set[ServerConnection] = set()
        self._history: deque[dict[str, Any]] = deque(maxlen=100)
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._started = threading.Event()
        self._last_error: str | None = None

    async def _handler(self, websocket: ServerConnection) -> None:
        self._clients.add(websocket)
        try:
            await websocket.send(json.dumps({"type": "server.ready", "payload": {}}))
            async for _message in websocket:
                pass
        finally:
            self._clients.discard(websocket)

    async def _broadcast(self, message: str) -> None:
        stale: list[ServerConnection] = []
        for client in tuple(self._clients):
            try:
                await client.send(message)
            except Exception:
                stale.append(client)
        for client in stale:
            self._clients.discard(client)

    async def serve_forever(self) -> None:
        self._loop = asyncio.get_running_loop()
        self._started.set()
        async with serve(self._handler, WS_HOST, WS_PORT):
            log.info("WebSocket server listening on %s:%s", WS_HOST, WS_PORT)
            await asyncio.Future()

    def start_background(self) -> None:
        if self._thread and self._thread.is_alive():
            return

        def _run() -> None:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                loop.run_until_complete(self.serve_forever())
            except Exception as exc:
                self._last_error = str(exc)
                log.exception("WebSocket server failed to start")
            finally:
                loop.close()
                self._loop = None

        self._started.clear()
        self._last_error = None
        self._thread = threading.Thread(target=_run, daemon=True, name="vision-events")
        self._thread.start()
        self._started.wait(timeout=2.0)

    def emit(self, event_type: EventType, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        event = {
            "type": event_type.value,
            "payload": payload or {},
            "timestamp": time.time(),
        }
        self._history.append(event)
        message = json.dumps(event)
        if self._loop and self._loop.is_running():
            asyncio.run_coroutine_threadsafe(self._broadcast(message), self._loop)
        return event

    def status(self) -> dict[str, Any]:
        return {
            "host": WS_HOST,
            "port": WS_PORT,
            "started": self._thread is not None and self._thread.is_alive(),
            "clients": len(self._clients),
            "history_size": len(self._history),
            "last_error": self._last_error,
        }

    def recent_events(self) -> list[dict[str, Any]]:
        return list(self._history)


server = EventServer()
