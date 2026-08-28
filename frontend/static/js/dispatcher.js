class EliteJournalDispatcher {
    constructor(uiController) {
        this.ui = uiController;
    }

    /**
     * Verarbeitet eine eingehende Journal-Zeile (JSON-String oder bereits geparstes Objekt)
     */
    handleLine(rawLine) {
        try {
            const event = typeof rawLine === 'string' ? JSON.parse(rawLine) : rawLine;

            switch (event.event) {
                case 'LoadGame':
                    this.handleLoadGame(event);
                    break;

                // Weitere Events können hier modular ergänzt werden
                default:
                    // Unbehandelte Events ignorieren
                    break;
            }
        } catch (error) {
            console.error("Fehler beim Parsen der Journal-Zeile:", error);
        }
    }

    /**
     * Verarbeitet das LoadGame-Event und schaltet das Frontend um
     */
    handleLoadGame(event) {
        const commanderData = {
            commanderName: event.Commander,
            shipType: event.Ship_Localised, // Interne ID (z. B. "Anaconda", "Explorconda")
            shipName: event.ShipName || event.Commander, // Selbstvergebener Schiffsname oder Commander-Name als Fallback
            shipIdent: event.ShipIdent, // Kennung (z. B. "KAI-01")
            fuelLevel: event.FuelLevel,
            fuelCapacity: event.FuelCapacity,
            gameMode: event.GameMode, // z. B. "Open", "Solo", "PrivateGroup"
            credits: event.Credits
        };

        // UI-State auf Hauptansicht/Schiff umschalten
        this.ui.transitionTo('IN_SHIP', commanderData);
    }
}