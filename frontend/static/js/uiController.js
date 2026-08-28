class UIController {
    constructor() {
        this.appContainer = document.getElementById('app') || document.body;
    }

    render(viewTemplate) {
        // Tauscht bei Bedarf den Hauptinhalt komplett aus
        this.appContainer.innerHTML = viewTemplate;
    }

    transitionTo(state, data) {
        switch (state) {
            case 'STANDBY':
                this.render(`
                    <div class="hud-container">
                        <div class="radar-spinner"></div>
                        <h1>Waiting for Flight Data</h1>
                        <p>Launch Elite Dangerous to establish telemetry link.</p>
                        <div class="status-badge">STATUS: STANDBY</div>
                    </div>
                `);
                break;

            case 'IN_SHIP':
                // Hier wird das Cockpit-Layout geladen – erst JETZT existieren die IDs im DOM!
                this.render(`
                    <div class="cockpit-hud">
                        <h1>${data.Ship_Localised || data.Ship}</h1>
                        <p>CMDR: <span id="cmdr-name">${data.Commander}</span></p>
                        <p>Ship Name: <span id="ship-name">${data.ShipName || 'Unbenannt'}</span></p>
                        <p>Credits: <span id="credits-display">${Number(data.Credits).toLocaleString()} CR</span></p>
                    </div>
                `);
                break;

            default:
                console.warn(`Unbekannter UI-State: ${state}`);
        }
    }
}