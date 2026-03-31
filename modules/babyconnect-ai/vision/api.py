"""Flask API for the vision service."""

from __future__ import annotations

from flask import Flask, jsonify, request

from vision.config import API_HOST, API_PORT, AUTO_START_DETECTION
from vision.detector import service
from vision.events import server as event_server

app = Flask(__name__)
_bootstrapped = False


def bootstrap() -> None:
    global _bootstrapped
    if _bootstrapped:
        return
    event_server.start_background()
    if AUTO_START_DETECTION:
        service.start()
    _bootstrapped = True


@app.get("/")
def index():
    return jsonify(
        {
            "name": "babyconnect-ai vision API",
            "status_url": "/status",
            "health_url": "/health",
            "recent_events_url": "/events/recent",
            "actions": {
                "start_detector": {"method": "POST", "path": "/start"},
                "stop_detector": {"method": "POST", "path": "/stop"},
                "start_match": {"method": "POST", "path": "/match/start"},
                "end_match": {"method": "POST", "path": "/match/end"},
            },
        }
    )


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/config")
def config():
    return jsonify({"api_host": API_HOST, "api_port": API_PORT})


@app.get("/status")
def status():
    return jsonify({"detector": service.status(), "events": event_server.status()})


@app.get("/events/recent")
def recent_events():
    return jsonify({"events": event_server.recent_events()})


@app.post("/start")
def start():
    body = request.get_json(silent=True) or {}
    started = service.start(body.get("source_url"))
    return jsonify({"started": started, "status": service.status()})


@app.post("/stop")
def stop():
    stopped = service.stop()
    return jsonify({"stopped": stopped, "status": service.status()})


@app.post("/match/start")
def start_match():
    service.start_match()
    return jsonify({"status": service.status()})


@app.post("/match/end")
def end_match():
    service.end_match()
    return jsonify({"status": service.status()})


def main() -> None:
    bootstrap()
    app.run(host=API_HOST, port=API_PORT, debug=False)
