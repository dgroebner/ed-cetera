# ED-Cetera 🌌

**ED-Cetera** is a lightweight, self-hosted companion and telemetry system for *Elite Dangerous*. It offloads log parsing from your gaming rig to a local Raspberry Pi, serving a gorgeous, sci-fi-themed SVG dashboard straight to your smartphone or tablet. 

Designed for explorers, truckers, and exobiologists who want a clean, immersion-breaking-free HUD companion without sacrificing precious gaming frame rates.

---

## ✨ Features

* **Zero Gaming PC Impact:** A tiny, silent Python watcher tails your local journal files and forwards events instantly.
* **Raspberry Pi Backend:** Centralized state management running smoothly on your local network.
* **Sci-Fi SVG Dashboard:** Responsive, cockpit-style interface featuring live radar sweeps, orbital system maps, and real-time status updates.
* **Exobiology Tracker:** Built-in biome tracking, species counters, and distance helpers (keeping an eye on that crucial 150m rule!).
* **Local & Private:** No external cloud services, no telemetry sharing—everything stays strictly in your home network.

---

## 🛠️ Prerequisites (Windows Watcher)

To run the PC-side watcher, make sure you have:
1. **Python (3.11+)** installed on your system.
2. The `requests` library installed for network communication:
   ```cmd
   pip install requests
   ```
   
---

## 🚀 Quick Start & Setup

### 1. Windows Watcher (Gaming PC)

The watcher runs discreetly in the background and includes a native Windows Taskbar Tray integration.

* Place the files from the watcher/ directory into your local project folder.
* Adjust the RASPI_BACKEND_URL inside watcher.py to match your Raspberry Pi's local IP address.
* Double-click starter.cmd to launch the watcher.
* It will start a background process and place a tray icon in your Windows taskbar.
* To close it, simply right-click the tray icon and select Beenden.

### 2. Raspberry Pi Backend (SSD Storage)

Data Directory: Configured on a SSD e.g. at /mnt/docker-data/ed-cetera to prevent SD card wear.

(Backend setup instructions coming soon)

---

## 📂 Project Structure

```
ed-cetera/
│
├── AGENTS.md        # Guidelines & architectural rules for AI agents
├── README.md        # You are here
├── watcher/         # PC-side log tailer (Python, Tray-Wrapper, Starter)
│   ├── watcher.py
│   ├── start_watcher.ps1
│   └── starter.cmd
└── backend/         # Raspberry Pi server & frontend templates (In Progress)```
```

---

## 🛠️ Architecture

```text
 [ Elite Dangerous PC ] 
        │ (Journal Log Tail)
        ▼
   [ Watcher.py ] ──(HTTP / WS)──► [ Raspberry Pi Backend ] ──► [ Mobile Browser (SVG HUD) ]
```

* /watcher: Runs on your Windows gaming PC, reads Saved Games/Frontier Developments/Elite Dangerous/ logs in real-time.
* /backend: Python-based server running on your Raspberry Pi to process game events and manage the system state.
* /frontend: Clean, scalable SVG graphics and vanilla JavaScript for smooth mobile interaction.

---

## 🚀 Tech Stack

* Language: Python (3.11+) across all components.
* Frontend: SVG, CSS Keyframe Animations, Vanilla JS.
* Protocol: Local REST / WebSockets.

---

## 📜 License

MIT License - Feel free to fork, adapt, and fly safe, Commanders! o7

