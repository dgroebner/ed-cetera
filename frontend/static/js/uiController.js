class UIController {
    constructor() {
        this.appContainer = document.getElementById('app') || document.body;
    }

    render(viewTemplate) {
        // Tauscht bei Bedarf den Hauptinhalt komplett aus
        this.appContainer.innerHTML = viewTemplate;
    }

    transitionTo(state, data) {
        if (!data) return;

        switch (state) {
            case 'IN_SHIP':
                // Fallbacks für Schiffsbezeichnungen und Credits absichern
                const shipTitle = data.Ship_Localised || data.Ship || "Unbekanntes Schiff";
                const cmdrName = data.Commander || "Unbekannter CMDR";
                const shipName = data.ShipName || "Unbenannt";
                const credits = data.Credits !== undefined ? Number(data.Credits).toLocaleString() + " CR" : "--- CR";

                const app = document.getElementById('app');
                if (app) {
                    app.innerHTML = `
                    <div class="hud-container">
                        <h1>${shipTitle}</h1>
                        <p>CMDR: <span id="cmdr-name">${cmdrName}</span></p>
                        <p>Ship Name: <span id="ship-name">${shipName}</span></p>
                        <p>Credits: <span id="credits-display">${credits}</span></p>
                        <div class="status-badge">STATUS: ONLINE</div>
                    </div>
                `;
                }
                break;
            default:
                console.warn(`Unbekannter UI-State: ${state}`);
        }
    }
}