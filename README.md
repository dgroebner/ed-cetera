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