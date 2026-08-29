# ED-Cetera - Agent Guidelines & Architecture

## Project Overview
**ED-Cetera** is a lightweight, local telemetry and companion system for *Elite Dangerous*. It offloads journal log parsing and state management from the gaming PC to a Raspberry Pi server, rendering a responsive, sci-fi-themed HUD dashboard and Progressive Web App (PWA) on mobile devices and tablets.

## Tech Stack
* **Watcher (PC):** Python (3.11+) log tailer with PowerShell Windows Taskbar Tray integration (`start_watcher.ps1` / `starter.cmd`).
* **Backend (Raspberry Pi):** Python (3.11+) using FastAPI and Uvicorn with SQLite persistence on local SSD storage, supporting HTTPS/SSL.
* **Frontend:** Vanilla JavaScript (ES6+), CSS animations, responsive SVG/HUD components, and Progressive Web App (PWA) support (Service Worker & Web App Manifest).
* **Communication:** REST / HTTP-POST (`/api/event`) from PC Watcher to Backend, REST polling (`/api/events/since/{last_id}`) and dynamic cache-busting versioning (`/api/version`) between Client and Backend.

## Repository Structure
* `/watcher` - Windows PC client files:
  * `watcher.py` - Lightweight log tailer monitoring Elite Dangerous journal files in real-time and forwarding events via HTTP POST.
  * `start_watcher.ps1` - PowerShell script creating a background process and system tray icon with an exit context menu.
  * `starter.cmd` - Batch launcher for the PowerShell tray runner.
* `/backend` - Raspberry Pi server:
  * `main.py` - FastAPI application providing event ingestion (`/api/event`), event querying (`/api/events/since/{last_id}`), initial state hydration (`/api/last_loadgame`, `/api/status`), version info (`/api/version`), SQLite database management (`ed_cetera.db`), and frontend/static asset serving.
* `/frontend` - Web application and PWA assets:
  * `index.html` - Cockpit HUD shell and script bootstrap with version-aware loader.
  * `manifest.json` - PWA web app manifest.
  * `sw.js` - Service worker for PWA lifecycle and caching.
  * `static/js/app.js` - Client orchestrator for dynamic versioned script loading, UI/dispatcher initialization, and event polling.
  * `static/js/dispatcher.js` - `EliteJournalDispatcher` registering and delegating journal events to specialized handlers.
  * `static/js/uiController.js` - `UIController` managing HUD views, state transitions, and UI rendering.
  * `static/js/handlers/` - Modular event handlers (e.g., `loadGameHandler.js`, `jumpHandler.js`, `baseHandler.js`).
  * `static/` - Icon assets (`icon-192.png`, `icon-512.png`).

## Core Rules & Conventions
1. **Low Resource Usage:** The PC watcher must run with minimal CPU and memory impact to avoid any frame drops in Elite Dangerous.
2. **Robust Journal Parsing:** Handle missing fields, game restarts, and log rotations gracefully. Elite Dangerous journal filenames follow the format: `Journal.YYYY-MM-DDTHHMMSS.01.log`.
3. **No External Cloud Dependency:** Everything runs locally within the home network (PC -> Raspi -> Mobile/Browser).
4. **Modular Architecture:**
   * Backend endpoints remain stateless where possible and leverage SQLite for persistence.
   * Frontend journal events are handled via modular handler classes registered with the `EliteJournalDispatcher`.
5. **Code Style & Quality:** Follow PEP 8 for Python code. Use clean, modular ES6+ JavaScript. Keep modules decoupled and properly documented in English.