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
                    <div class="hud-card" style="display: flex; flex-direction: column; height: 90vh; box-sizing: border-box;">
                        <h2 class="card-title" style="margin-bottom: 5px;">SYSTEM: ${this.stateData.currentSystemData.name || this.stateData.starSystem}</h2>
                        <div class="hud-row" style="font-size: 0.9rem;">Gescannte Körper: <span id="body-count-text" style="color: #00ffff; font-weight: bold;">0 / ${this.stateData.currentSystemData.bodyCount || '?'}</span></div>
                        
                        <!-- SVG System Map Container -->
                        <div style="height: 220px; min-height: 220px; position: relative; margin-top: 8px; background: rgba(0, 5, 10, 0.85); border: 1px solid rgba(0,255,255,0.3); border-radius: 6px; overflow: hidden;">
                            <svg id="system-svg-map" viewBox="0 0 400 400" width="100%" height="100%" style="display: block;">
                                <!-- Holographische Hintergrund-Kreise -->
                                <circle cx="200" cy="200" r="70" fill="none" stroke="rgba(0,255,255,0.07)" stroke-dasharray="2,2"/>
                                <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(0,255,255,0.07)" stroke-dasharray="2,2"/>
                                <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(0,255,255,0.07)" stroke-dasharray="2,2"/>
                                <line x1="200" y1="0" x2="200" y2="400" stroke="rgba(0,255,255,0.03)" />
                                <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(0,255,255,0.03)" />

                                <!-- Zentralstern -->
                                <g id="svg-star-group">
                                    <circle cx="200" cy="200" r="14" fill="#ffaa00" filter="drop-shadow(0 0 8px #ffaa00)" />
                                </g>

                                <!-- Planeten und Monde -->
                                <g id="svg-bodies-group"></g>
                            </svg>
                        </div>

                        <!-- Body-List direkt darunter -->
                        <div style="margin-top: 10px; font-weight: bold; font-size: 0.85rem; color: #a0a0ff; border-bottom: 1px solid rgba(0,255,255,0.2); padding-bottom: 3px;">
                            Erfasste Himmelskörper:
                        </div>
                        <div id="body-list-container" style="margin-top: 5px; overflow-y: auto; flex-grow: 1; max-height: calc(100vh - 400px); padding-right: 4px;">
                            <!-- Dynamische Liste wird hier reingeklopft -->
                        </div>

                        <div class="status-badge" style="margin-top: 8px;">STATUS: LIVE ORBITAL MAPPING</div>
                    </div>
                `;
                this.renderSvgMap();
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
                type: scanEvent.PlanetClass || scanEvent.StarType || 'Unbekannt',
                distance: scanEvent.DistanceFromArrivalLS || 0,
                landable: scanEvent.Landable || false
            };

            this.stateData.currentSystemData.bodies.set(bodyId, bodyData);

            // Wenn die System-Map offen ist, direkt live neuzeichnen
            if (this.stateData.status === 'SYSTEM_MAP') {
                this.renderSvgMap();
            }
        }
    }

    renderSvgMap() {
        const bodiesGroup = document.getElementById('svg-bodies-group');
        const bodyListContainer = document.getElementById('body-list-container');
        const countText = document.getElementById('body-count-text');

        const totalBodiesFound = this.stateData.currentSystemData.bodies.size;
        const totalExpected = this.stateData.currentSystemData.bodyCount || '?';

        if (countText) {
            countText.innerText = `${totalBodiesFound} / ${totalExpected}`;
        }

        if (!bodiesGroup && !bodyListContainer) return;

        let svgContent = '';
        let listContent = '';
        let index = 0;

        this.stateData.currentSystemData.bodies.forEach((body) => {
            const isStar = (body.distance === 0);

            // 1. SVG-Elemente generieren (nur für Objekte ungleich Hauptstern im Zentrum)
            if (!isStar) {
                index++;
                const angle = (index / Math.max(totalBodiesFound, 8)) * 2 * Math.PI;
                const radius = Math.min(35 + Math.log(body.distance + 1) * 28, 175);

                const x = 200 + radius * Math.cos(angle);
                const y = 200 + radius * Math.sin(angle);

                let color = "#00ffff";
                if (body.type.includes("Gas giant")) color = "#ff8800";
                if (body.landable) color = "#00ff66";

                const shortName = body.name.split(' ').pop();

                svgContent += `
                    <g class="svg-body-node">
                        <circle cx="200" cy="200" r="${radius}" fill="none" stroke="rgba(0,255,255,0.12)" stroke-width="1" stroke-dasharray="2,2" />
                        <circle cx="${x}" cy="${y}" r="${body.landable ? 5 : 3.5}" fill="${color}" filter="drop-shadow(0 0 5px ${color})" />
                        <text x="${x + 8}" y="${y + 3}" fill="#a0f0ff" font-size="8" font-family="monospace">${shortName}</text>
                    </g>
                `;
            }

            // 2. Listeneintrag für die Body-List generieren
            let badgeColor = "#00ffff";
            if (body.landable) badgeColor = "#00ff66";

            listContent += `
                <div class="hud-row" style="font-size: 0.8rem; border-bottom: 1px solid rgba(0,255,255,0.1); padding: 5px 2px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="color: #fff; font-weight: bold;">${body.name}</span>
                        ${body.landable ? '<span style="color: #00ff66; font-size: 0.7rem; margin-left: 6px; border: 1px solid #00ff66; padding: 1px 3px; border-radius: 3px;">LANDABLE</span>' : ''}
                    </div>
                    <div style="text-align: right; color: ${badgeColor};">
                        <span>${body.type}</span><br>
                        <span style="color: #88a0a8; font-size: 0.75rem;">${body.distance.toFixed(1)} LS</span>
                    </div>
                </div>
            `;
        });

        if (bodiesGroup) bodiesGroup.innerHTML = svgContent;
        if (bodyListContainer) bodyListContainer.innerHTML = listContent || '<div style="color: #666; font-size: 0.8rem; padding: 5px;">Warte auf Scans...</div>';
    }
}