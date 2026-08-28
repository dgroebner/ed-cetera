class UIController {
    transitionTo(state, data) {
        switch (state) {
            case 'IN_SHIP':
                console.log(`[UI] Schiff geladen: ${data.shipType} ("${data.shipName}")`);

                // DOM-Elemente aktualisieren
                document.getElementById('cmdr-name').innerText = data.commanderName;
                document.getElementById('ship-name').innerText = data.shipName;
                document.getElementById('ship-type').innerText = data.shipType;
                document.getElementById('credits-display').innerText = data.credits.toLocaleString() + " CR";

                // Ansicht umschalten (z. B. Ladebildschirm ausblenden, Schiffs-Dashboard anzeigen)
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('ship-dashboard').style.display = 'block';
                break;

            default:
                console.warn(`Unbekannter UI-State: ${state}`);
        }
    }
}