# ED-Cetera 🌌

**ED-Cetera** is a lightweight, self-hosted companion and telemetry system for *Elite Dangerous*. It offloads log parsing from your gaming rig to a local Raspberry Pi, serving a responsive, sci-fi-themed HUD dashboard and Progressive Web App (PWA) straight to your smartphone, tablet, or secondary screen.

Designed for explorers, truckers, and exobiologists who want a clean, immersion-breaking-free HUD companion without sacrificing precious gaming frame rates.

---

## ✨ Features

* **Zero Gaming PC Impact:** A tiny, silent Python watcher tails your local journal files and forwards events instantly via HTTP POST.
* **Raspberry Pi Backend:** Centralized FastAPI service with persistent SQLite event storage (optimized for attached SSD storage).
* **Sci-Fi HUD & PWA Dashboard:** Responsive cockpit-style interface, installable as a standalone Progressive Web App with offline caching and dynamic asset versioning.
* **Modular Frontend Architecture:** Decoupled event dispatcher with dedicated event handlers for game lifecycle and flight telemetry (`LoadGame`, hyperspace jumps, etc.).
* **HTTPS & SSL Support:** Ready for secure local communication required for modern mobile PWA capabilities.
* **Local & Private:** No external cloud services, no telemetry sharing—everything stays strictly in your home network.

---

## 🛠️ Prerequisites & Setup

### 1. Windows Watcher (Gaming PC)

The watcher runs discreetly in the background and includes a native Windows Taskbar Tray integration.

**Prerequisites:**
1. **Python (3.11+)** installed on your system.
2. Required Python libraries:
   ```cmd
   pip install requests urllib3
   ```

**Setup:**
* Ensure your watcher configuration in `watcher/watcher.py` points to your Raspberry Pi backend URL (e.g. `https://nexus-pi:5000/api/event`).
* Double-click `starter.cmd` (or run `start_watcher.ps1` with PowerShell) to launch the watcher in background mode.
* An icon will appear in your Windows notification/tray area.
* To exit the watcher, right-click the tray icon and select **Beenden** (Exit).

---

### 2. Raspberry Pi Backend (SSD Storage)

The backend runs on a Raspberry Pi, persists all events into an SQLite database on an attached SSD (to prevent SD card wear), and can be configured as a `systemd` service for automatic startup.

**Manual Installation & Setup:**

1. **Clone the repository to your storage location** (e.g., `/mnt/docker-data/ed-cetera`):
   ```bash
   cd /mnt/docker-data
   sudo git clone https://github.com/dgroebner/ed-cetera.git ed-cetera
   sudo chown -R $USER:$USER ed-cetera
   cd ed-cetera
   ```

2. **Set up virtual environment & install dependencies:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install fastapi uvicorn requests
   ```

3. **Configure as a systemd service for auto-start:**

   Create the service file:
   ```bash
   sudo nano /etc/systemd/system/ed-cetera.service
   ```

   Insert the following configuration:
   ```ini
   [Unit]
   Description=ED-Cetera FastAPI Backend
   After=network.target

   [Service]
   User=admin
   WorkingDirectory=/mnt/docker-data/ed-cetera/backend
   ExecStart=/mnt/docker-data/ed-cetera/venv/bin/python3 main.py
   Restart=always
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```

4. **Enable and start the service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable ed-cetera.service
   sudo systemctl start ed-cetera.service
   ```

---

## 📂 Project Structure

```
ed-cetera/
│
├── AGENTS.md               # Guidelines & architectural rules for AI agents
├── README.md               # Project documentation
│
├── watcher/                # Windows PC log tailer & tray wrapper
│   ├── watcher.py          # Journal watcher script (HTTP POST)
│   ├── start_watcher.ps1   # PowerShell tray application & process supervisor
│   └── starter.cmd         # Batch launcher for PowerShell tray runner
│
├── backend/                # Raspberry Pi FastAPI server & database
│   └── main.py             # FastAPI app, SQLite persistence, and static router
│
└── frontend/               # Cockpit HUD web application (PWA)
    ├── index.html          # HUD entry point and dynamic script loader
    ├── manifest.json       # PWA manifest
    ├── sw.js               # Service Worker for PWA lifecycle
    └── static/
        ├── icon-192.png    # PWA icon (192x192)
        ├── icon-512.png    # PWA icon (512x512)
        └── js/
            ├── app.js      # App startup, versioning & event polling loop
            ├── dispatcher.js   # Event dispatcher for journal lines
            ├── uiController.js # HUD rendering & state transition manager
            └── handlers/   # Modular event handlers
                ├── baseHandler.js
                ├── jumpHandler.js
                └── loadGameHandler.js
```

---

## 🛠️ Architecture & Data Flow

```text
 [ Elite Dangerous PC ]
        │ (Journal Log Tail)
        ▼
   [ watcher.py ]
        │
        │ HTTP POST (/api/event)
        ▼
 [ Raspberry Pi Backend (FastAPI) ] ──► [ SQLite on SSD (ed_cetera.db) ]
        │
        │ REST Polling (/api/events/since/{id})
        ▼
 [ Mobile / Tablet Browser (PWA) ] ──► [ Dispatcher & Handlers ] ──► [ UI Controller ]
```

* **Watcher (`/watcher`):** Runs locally on your Windows gaming PC, tails logs in `Saved Games/Frontier Developments/Elite Dangerous/`, and sends new JSON events to the backend without impacting game performance.
* **Backend (`/backend`):** FastAPI application on the Raspberry Pi handling event ingestion, persistent storage in SQLite, static asset serving, and event query endpoints.
* **Frontend (`/frontend`):** Clean, sci-fi HUD rendered via modular vanilla JavaScript, responsive CSS, and SVG styling. Functions as an installable PWA with service worker caching.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves `index.html` cockpit HUD |
| `GET` | `/manifest.json` | Web App Manifest for PWA installation |
| `GET` | `/sw.js` | Service Worker script |
| `POST` | `/api/event` | Ingests journal events from the PC watcher |
| `GET` | `/api/version` | Returns server timestamp for asset cache-busting |
| `GET` | `/api/status` | Returns the latest recorded event and last event ID |
| `GET` | `/api/last_loadgame` | Returns the most recent `LoadGame` event for instant UI hydration |
| `GET` | `/api/events/since/{last_id}` | Returns all journal events recorded after the specified event ID |

---

## 🚀 Tech Stack

* **Watcher:** Python 3.11+, PowerShell (.NET Windows Forms / System.Drawing).
* **Backend:** Python 3.11+, FastAPI, Uvicorn, SQLite.
* **Frontend:** Vanilla JavaScript (ES6+), Modern CSS, Responsive SVG, Service Worker / PWA.
* **Protocol:** Local REST API over HTTPS / HTTP.

---

## 📜 License

MIT License - Feel free to fork, adapt, and fly safe, Commanders! o7

