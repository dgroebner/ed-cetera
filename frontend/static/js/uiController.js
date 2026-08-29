class UIController {
    constructor() {
        this.stateData = {
            commander: "Warte auf Daten...",
            shipType: "STANDBY",
            shipName: "Unbenannt",
            credits: "--- CR",
            // Erweiterung für Positions- und Systemdaten
            starSystem: "Unbekannt",
            body: "---",
            coordinates: {lat: null, lon: null},
            status: "STANDBY",

            currentSystemData: {
                name: null,
                bodyCount: 0,
                bodies: new Map()
            }
        };
    }

    transitionTo(stateName, data = {}) {
        // Allgemeine Schiffs- und Commander-Daten aktualisieren
        if (data.commanderName) this.stateData.commander = data.commanderName;
        if (data.shipType) this.stateData.shipType = data.shipType;
        if (data.shipName) this.stateData.shipName = data.shipName;
        if (data.credits !== undefined) this.stateData.credits = Number(data.credits).toLocaleString() + " CR";

        // Positions- und Systemdaten aus Events (z. B. FSDJump, Location) übernehmen
        if (data.StarSystem) this.stateData.starSystem = data.StarSystem;
        if (data.Body) this.stateData.body = data.Body;
        if (data.Latitude !== undefined && data.Longitude !== undefined) {
            this.stateData.coordinates = {lat: data.Latitude, lon: data.Longitude};
        }

        this.stateData.status = stateName;

        const app = document.getElementById('app');
        if (!app) return;

        // Je nach Zustand das passende Layout rendern
        switch (stateName) {
            case 'IN_SHIP':
            case 'MAIN_MENU':
                app.innerHTML = `
                    <div class="hud-card">
                        <h2 class="card-title">${this.stateData.shipName}</h2>
                        <div class="hud-row">CMDR: <span>${this.stateData.commander}</span></div>
                        <div class="hud-row">Ship Type: <span>${this.stateData.shipType}</span></div>
                        <div class="hud-row">System: <span>${this.stateData.starSystem}</span></div>
                        <div class="hud-row">Credits: <span>${this.stateData.credits}</span></div>
                        <div class="status-badge">STATUS: ONLINE</div>
                    </div>
                `;
                break;

            case 'HYPERSPACE':
                app.innerHTML = `
                    <div class="hud-card">
                        <h2 class="card-title">HYPERSPACE</h2>
                        <div class="hud-row">Target System: <span>${this.stateData.starSystem}</span></div>
                        <div class="hud-row">Status: <span>FSD Engaged</span></div>
                        <div class="status-badge" style="border-color: #00ffff; color: #00ffff;">STATUS: JUMPING</div>
                    </div>
                `;
                break;

            case 'PLANET_SURFACE':
                app.innerHTML = `
                    <div class="hud-card">
                        <h2 class="card-title">SURFACE / TOUCHDOWN</h2>
                        <div class="hud-row">Body: <span>${this.stateData.body}</span></div>
                        <div class="hud-row">Lat: <span>${this.stateData.coordinates.lat ?? '---'}</span></div>
                        <div class="hud-row">Lon: <span>${this.stateData.coordinates.lon ?? '---'}</span></div>
                        <div class="status-badge">STATUS: LANDED</div>
                    </div>
                `;
                break;

            case 'SYSTEM_MAP':
                app.innerHTML = `
                    <div class="hud-card" style="max-height: 85vh; display: flex; flex-direction: column;">
                        <h2 class="card-title">SYSTEM: ${this.stateData.currentSystemData.name || this.stateData.starSystem}</h2>
                        <div class="hud-row">Ziel-Körper gesamt: <span id="body-count">${this.stateData.currentSystemData.bodyCount || 'Unbekannt'}</span></div>
                        
                        <div style="margin-top: 10px; font-weight: bold; color: #a0a0ff; border-bottom: 1px solid #555; padding-bottom: 4px;">
                            Live-Scans im System:
                        </div>
                        
                        <div id="body-list-container" style="margin-top: 5px; overflow-y: auto; flex-grow: 1; max-height: 50vh;">
                            <!-- Hier werden die Körper live reingeklopft -->
                        </div>
                        
                        <div class="status-badge" style="margin-top: 10px;">STATUS: LIVE SYSTEM SCAN</div>
                    </div>
                `;
                // Direkt befüllen, falls schon Daten da sind
                this.renderLiveBodyList();
                break;

            case 'LOADING':
            default:
                app.innerHTML = `
                    <div class="hud-card">
                        <h2 class="card-title">STANDBY</h2>
                        <div class="hud-row">CMDR: <span>Warte auf Daten...</span></div>
                        <div class="status-badge">STATUS: INITIALIZING</div>
                    </div>
                `;
                break;
        }
    }

    updateBodyScan(scanEvent) {
        const bodyId = scanEvent.BodyID;
        if (bodyId !== undefined) {
            const bodyData = {
                name: scanEvent.BodyName,
                type: scanEvent.PlanetClass || scanEvent.StarType || 'Asteroids',
                distance: scanEvent.DistanceFromArrivalLS || 0,
                landable: scanEvent.Landable || false,
                atmosphere: scanEvent.AtmosphereType || 'Keine',
                materials: scanEvent.Materials || []
            };

            // In die Map einfügen
            this.stateData.currentSystemData.bodies.set(bodyId, bodyData);

            // Wenn wir gerade im System-State sind, direkt live das DOM aktualisieren!
            if (this.stateData.status === 'SYSTEM_MAP') {
                this.renderLiveBodyList();
            }
        }
    }

    renderLiveBodyList() {
        const container = document.getElementById('body-list-container');
        if (!container) return;

        let bodiesHtml = '';
        // Sortiere oder iteriere über alle gescannten Körper
        this.stateData.currentSystemData.bodies.forEach((body) => {
            bodiesHtml += `
                <div class="hud-row" style="font-size: 0.85rem; border-bottom: 1px solid rgba(0,255,255,0.2); padding: 6px 0; display: flex; justify-content: space-between;">
                    <span style="color: #fff; font-weight: bold;">${body.name}</span>
                    <span style="color: #00ffff;">${body.type} (${body.distance.toFixed(1)} LS)</span>
                </div>
            `;
        });

        container.innerHTML = bodiesHtml;
    }
}