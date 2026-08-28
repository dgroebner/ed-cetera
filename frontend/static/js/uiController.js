class UIController {
    constructor() {
        this.appContainer = document.getElementById('app') || document.body;

        // Das UI-Gedächtnis für den Status
        this.shipState = {
            commander: "Warte auf Daten...",
            shipType: "STANDBY",
            shipName: "Unbenannt",
            credits: "--- CR"
        };
    }

    transitionTo(stateName, data) {
        if (!data) return;

        if (stateName === 'IN_SHIP') {
            // Hier greifen wir exakt auf die Keys zu, die der Dispatcher in 'commanderData' geliefert hat:
            if (data.commanderName) this.shipState.commander = data.commanderName;
            if (data.shipType) this.shipState.shipType = data.shipType;
            if (data.shipName) this.shipState.shipName = data.shipName;
            if (data.credits !== undefined) this.shipState.credits = Number(data.credits).toLocaleString() + " CR";

            // UI rendern
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                    <div class="hud-container">
                        <h1>${this.shipState.shipName}</h1>
                        <p>CMDR: <span id="cmdr-name">${this.shipState.commander}</span></p>
                        <p>Ship Type: <span id="ship-type">${this.shipState.shipType}</span></p>
                        <p>Credits: <span id="credits-display">${this.shipState.credits}</span></p>
                        <div class="status-badge">STATUS: ONLINE</div>
                    </div>
                `;
            }
        }
    }
}