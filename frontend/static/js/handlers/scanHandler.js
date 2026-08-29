class ScanHandler {
    handle(event, uiController) {
        // Fügt den gescannten Körper dem State hinzu
        if (uiController && typeof uiController.updateBodyScan === 'function') {
            uiController.updateBodyScan(event);
        }

        // Optional: Konsole loggen zur Kontrolle
        console.log(`[Scan] Körper erfasst: ${event.BodyName} (${event.ScanType})`);
    }
}