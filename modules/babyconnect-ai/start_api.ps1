$env:VISION_SOURCE = "http://10.31.32.237:4747/video"
$env:VISION_API_PORT = "5055"
$env:VISION_WS_PORT = "8877"

& "$PSScriptRoot\venv\Scripts\python.exe" "$PSScriptRoot\api.py"
