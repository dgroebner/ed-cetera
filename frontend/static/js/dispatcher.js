class EliteJournalDispatcher {
    constructor(uiController) {
        this.ui = uiController;
        this.handlers = new Map();
    }

    // Methode zum Registrieren von Event-Handlern (Fehlte bisher)
    registerHandler(eventType, handler) {
        this.handlers.set(eventType, handler);
    }

    handleLine(rawLine) {
        try {
            const event = typeof rawLine === 'string' ? JSON.parse(rawLine) : rawLine;
            const handler = this.handlers.get(event.event);

            if (handler && typeof handler.handle === 'function') {
                handler.handle(event, this.ui);
            } else {
                // Fallback oder Standard-Verhalten, falls kein spezifischer Handler registriert ist
                // Hier könnte man z.B. universell auf bestimmte Events im UIController reagieren
                this.handleDefault(event);
            }
        } catch (error) {
            console.error("Fehler beim Parsen der Journal-Zeile:", error);
        }
    }

    handleDefault(event) {
        // Optional: Zentrale Fallback-Logik für Events ohne eigenen Handler
        // Z.B. automatisches Erkennen von LoadGame, FSDJump etc., falls gewünscht
        switch (event.event) {
            case 'LoadGame':
                this.ui.transitionTo('IN_SHIP', {
                    commanderName: event.Commander,
                    shipType: event.Ship,
                    shipName: event.ShipName,
                    credits: event.Credits
                });
                break;
            case 'FSDJump':
            case 'Location':
                this.ui.transitionTo('IN_SHIP', {
                    StarSystem: event.StarSystem,
                    Body: event.Body,
                    Latitude: event.Latitude,
                    Longitude: event.Longitude
                });
                break;
            case 'Touchdown':
                this.ui.transitionTo('PLANET_SURFACE', {
                    Body: event.Body,
                    Latitude: event.Latitude,
                    Longitude: event.Longitude
                });
                break;
            default:
                // Unwichtige Events ignorieren
                break;
        }
    }
}