class UIController {
    constructor() {
        this.appContainer = document.getElementById('app') || document.body;

        // Hier merkt sich das UI die aktuellen Schiffsdaten über Events hinweg
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
            // 1. State aktualisieren, ABER NUR, wenn das Event diese Daten auch mitliefert
            if (data.Commander) this.shipState.commander = data.Commander;
            if (data.Ship_Localised || data.Ship) this.shipState.shipType = data.Ship_Localised || data.Ship;
            if (data.ShipName) this.shipState.shipName = data.ShipName;
            if (data.Credits !== undefined) this.shipState.credits = Number(data.Credits).toLocaleString() + " CR";

            // 2. UI mit dem gespeicherten State rendern (nicht mehr direkt mit 'data')
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                    <div class="hud-container">
                        <h1>${this.shipState.shipType}</h1>
                        <p>CMDR: <span id="cmdr-name">${this.shipState.commander}</span></p>
                        <p>Ship Name: <span id="ship-name">${this.shipState.shipName}</span></p>
                        <p>Credits: <span id="credits-display">${this.shipState.credits}</span></p>
                        <div class="status-badge">STATUS: ONLINE</div>
                    </div>
                `;
            }
        }
    }
}