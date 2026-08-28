class UIController {
    constructor() {
        this.appContainer = document.getElementById('app') || document.body;

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
            if (data.commanderName) this.shipState.commander = data.commanderName;
            if (data.shipType) this.shipState.shipType = data.shipType;
            if (data.shipName) this.shipState.shipName = data.shipName;
            if (data.credits !== undefined) this.shipState.credits = Number(data.credits).toLocaleString() + " CR";

            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = `
                    <div class="hud-card">
                        <h2 class="card-title">${this.shipState.shipName}</h2>
                        <div class="hud-row">CMDR: <span>${this.shipState.commander}</span></div>
                        <div class="hud-row">Ship Type: <span>${this.shipState.shipType}</span></div>
                        <div class="hud-row">Credits: <span>${this.shipState.credits}</span></div>
                        <div class="status-badge">STATUS: ONLINE</div>
                    </div>
                `;
            }
        }
    }
}