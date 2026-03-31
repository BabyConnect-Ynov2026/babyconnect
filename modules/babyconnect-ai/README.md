# babyconnect-ai

Service Python de vision pour babyfoot avec :
- ingestion video via `ffmpeg`
- detection de balle et de buts
- diffusion d'evenements en WebSocket
- API HTTP Flask pour piloter le service

## Structure

```text
babyconnect-ai/
|- vision/
|  |- api.py
|  |- calibrate.py
|  |- camera.py
|  |- config.py
|  |- detector.py
|  |- events.py
|  `- goal_detection.py
|- api.py
|- detector.py
|- main.py
`- requirements.txt
```

## Installation

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
ffmpeg -version
```

## Demarrage

```powershell
# API HTTP
python api.py

# Detecteur
python main.py

# Detecteur sans fenetre OpenCV
python main.py --no-window

# Calibration
python main.py --calibrate
```

## Variables d'environnement

- `VISION_SOURCE` : URL DroidCam ou chemin vers une video locale
- `VISION_API_HOST` / `VISION_API_PORT` : bind HTTP
- `VISION_WS_HOST` / `VISION_WS_PORT` : bind WebSocket
- `VISION_SHOW_WINDOW=1` : active la fenetre OpenCV
- `VISION_AUTO_START=1` : demarre la detection au boot de l'API

## API HTTP

- `GET /health`
- `GET /status`
- `GET /events/recent`
- `POST /start`
- `POST /stop`
- `POST /match/start`
- `POST /match/end`

Exemple de demarrage avec une video locale :

```powershell
$env:VISION_SOURCE = ".\test_640.mp4"
python api.py
Invoke-RestMethod -Method Post http://127.0.0.1:5000/start
```

## Evenements WebSocket

Le serveur publie des messages JSON sur `ws://<host>:<port>` avec les types :
- `match.start`
- `match.end`
- `goal`
- `score.update`
- `shot`
- `ball.detected`
- `ball.lost`
- `detector.started`
- `detector.stopped`
- `detector.error`
