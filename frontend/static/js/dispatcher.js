class EliteJournalDispatcher {
    constructor(uiController) {
        this.ui = uiController;
        this.handlers = new Map();
    }

    // Handler für bestimmte Events registrieren
    registerHandler(eventType, handler) {
        this.handlers.set(eventType, handler);
    }

    handleLine(rawLine) {
        try {
            const event = typeof rawLine === 'string' ? JSON.parse(rawLine) : rawLine;
            const handler = this.handlers.get(event.event);

            if (handler) {
                handler.handle(event, this.ui);
            } else {
                // Unbehandelte Events stillschweigend ignorieren
                // console.debug(`Kein Handler für Event: ${event.event}`);
            }
        } catch (error) {
            console.error("Fehler beim Parsen der Journal-Zeile:", error);
        }
    }
}