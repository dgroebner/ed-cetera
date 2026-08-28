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

## 🚀 Tech Stack

* Language: Python (3.11+) across all components.
* Frontend: SVG, CSS Keyframe Animations, Vanilla JS.
* Protocol: Local REST / WebSockets.

## 📂 Project Structure

```
ed-cetera/
│
├── AGENTS.md        # Guidelines & architectural rules for AI agents
├── README.md        # You are here
├── watcher/         # PC-side log tailer
└── backend/         # Raspberry Pi server & frontend templates
```

## 📜 License

MIT License - Feel free to fork, adapt, and fly safe, Commanders! o7

