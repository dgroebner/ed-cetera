@echo off
cd /d "%~dp0"

echo [*] Starte ED-Cetera Watcher Tray...
start /min powershell -ExecutionPolicy Bypass -File .\start_watcher.ps1

exit