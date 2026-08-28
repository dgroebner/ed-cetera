# ED-Cetera - Agent Guidelines & Architecture

## Project Overview
**ED-Cetera** is a lightweight, local telemetry and companion system for Elite Dangerous. It offloads journal parsing and state management from the gaming PC to a Raspberry Pi, rendering a responsive, scifi-themed SVG dashboard on mobile devices.

## Tech Stack
* **Language:** Python (3.11+) across all components (Watcher & Backend).
* **Frontend:** Responsive SVG, modern CSS (animations), and vanilla JavaScript.
* **Communication:** HTTP-POST / WebSockets between PC Watcher, Raspi Backend, and Client.

## Repository Structure
* `/watcher` - Local log-tailing script running on the gaming PC to parse Elite Dangerous journal files in real-time.
* `/backend` - Server application running on the Raspberry Pi to aggregate state and serve the frontend.
* `/frontend` - SVG templates, styles, and client-side interaction scripts.

## Core Rules & Conventions
1. **Low Resource Usage:** The PC watcher must run with minimal CPU and memory impact to avoid any frame drops in Elite Dangerous.
2. **Robust Journal Parsing:** Handle missing fields, game restarts, and log rotations gracefully. Elite Dangerous journal filenames follow the format: `Journal.YYYY-MM-DDTHHMMSS.01.log`.
3. **No External Cloud Dependency:** Everything runs locally within the home network (PC -> Raspi -> Mobile).
4. **Code Style:** Follow PEP 8 for Python code. Keep modules decoupled and thoroughly commented.