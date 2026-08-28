from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
import sqlite3
import json
from datetime import datetime
import os

app = FastAPI(title="ED-Cetera Backend", version="1.0")

# Pfad zur SQLite-Datenbank direkt auf der SSD
DB_PATH = "/mnt/docker-data/ed-cetera/ed_cetera.db"
# Pfad zum Frontend-Ordner (relativ zur main.py im backend-Ordner)
FRONTEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

def init_db():
    """Initialisiert die SQLite-Datenbank und Tabellen auf der SSD."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
                   CREATE TABLE IF NOT EXISTS events (
                                                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         timestamp TEXT,
                                                         event_type TEXT,
                                                         raw_data TEXT
                   )
                   """)
    conn.commit()
    conn.close()

# Datenbank beim Start initialisieren
init_db()

# Root-Route liefert die Hauptseite aus
@app.get("/")
async def read_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

# Spezielle Routen für PWA-Dateien im Root-Scope (wichtig für den Service-Worker-Scope!)
@app.get("/manifest.json")
async def read_manifest():
    return FileResponse(os.path.join(FRONTEND_DIR, "manifest.json"))

@app.get("/sw.js")
async def read_sw():
    return FileResponse(os.path.join(FRONTEND_DIR, "sw.js"), media_type="application/javascript")

class GameEvent(BaseModel):
    event: str
    timestamp: Optional[str] = None
    data: Optional[dict] = None

@app.post("/api/event")
async def receive_event(payload: dict):
    """Nimmt Events vom PC-Watcher entgegen und speichert sie auf der SSD."""
    try:
        event_type = payload.get("event", "Unknown")
        timestamp = payload.get("timestamp", datetime.utcnow().isoformat())

        # In SQLite wegschreiben
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO events (timestamp, event_type, raw_data) VALUES (?, ?, ?)",
            (timestamp, event_type, json.dumps(payload))
        )
        conn.commit()
        conn.close()

        print(f"[*] Event empfangen & gespeichert: {event_type}")
        return {"status": "success", "event": event_type}

    except Exception as e:
        print(f"[!] Fehler beim Speichern: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/status")
async def get_status():
    """Gibt den letzten bekannten Status zurück (für das Dashboard)."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, event_type, raw_data FROM events ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if not row:
        return {"status": "No events recorded yet"}

    return {
        "last_timestamp": row[0],
        "last_event": row[1],
        "data": json.loads(row[2])
    }

if __name__ == "__main__":
    import uvicorn

    # Absoluten Pfad zum Projekt-Root und den Zertifikaten ermitteln
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    KEY_FILE = os.path.join(BASE_DIR, "certs", "key.pem")
    CERT_FILE = os.path.join(BASE_DIR, "certs", "cert.pem")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5000,
        reload=True,
        ssl_keyfile=KEY_FILE,
        ssl_certfile=CERT_FILE
    )