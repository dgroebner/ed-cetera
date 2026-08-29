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
        window.uiController = this;
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
                    <div class="hud-card" style="display: flex; flex-direction: column; height: 94vh; box-sizing: border-box; padding: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,255,255,0.3); padding-bottom: 4px;">
                            <h2 class="card-title" style="margin: 0; font-size: 1.1rem; color: #ffaa00;">SYSTEM: ${this.stateData.currentSystemData.name || this.stateData.starSystem}</h2>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="font-size: 0.85rem; color: #a0f0ff;">Körper: <span id="body-count-text" style="color: #00ffff; font-weight: bold;">0 / ${this.stateData.currentSystemData.bodyCount || '?'}</span></div>
                                <!-- Reset Zoom Button -->
                                <button id="reset-zoom-btn" style="background: rgba(0,255,255,0.1); border: 1px solid rgba(0,255,255,0.4); color: #00ffff; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; cursor: pointer;">RESET ZOOM</button>
                            </div>
                        </div>
                        
                        <!-- Zoom-able SVG System Map -->
                        <div style="height: 240px; min-height: 240px; position: relative; margin-top: 6px; background: #02060a; border: 1px solid rgba(0,255,255,0.4); border-radius: 4px; overflow: hidden; touch-action: none;">
                            <svg id="system-svg-map" viewBox="0 0 900 300" width="100%" height="100%" style="display: block; cursor: grab;">
                                <defs>
                                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,255,255,0.04)" stroke-width="1"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />

                                <g id="zoom-container">
                                    <line x1="0" y1="120" x2="2000" y2="120" stroke="rgba(0,255,255,0.2)" stroke-dasharray="4,4" />
                                    
                                    <g id="svg-star-group">
                                        <circle cx="60" cy="120" r="24" fill="#ffaa00" filter="drop-shadow(0 0 12px #ffaa00)" />
                                        <text x="60" y="158" fill="#ffaa00" font-size="11" text-anchor="middle" font-family="monospace" font-weight="bold">${this.stateData.currentSystemData.name || 'Primary Star'}</text>
                                    </g>

                                    <g id="svg-bodies-group"></g>
                                </g>
                            </svg>
                            <div style="position: absolute; bottom: 4px; right: 8px; font-size: 0.65rem; color: rgba(0,255,255,0.5); pointer-events: none;">
                                [Pinch / Scroll zoomen · Ziehen verschieben]
                            </div>
                        </div>

                        <!-- Info-Box für angetippten Planeten (Ersatz für Mouseover auf Mobile) -->
                        <div id="selected-body-info" style="margin-top: 6px; background: rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.2); border-radius: 4px; padding: 4px 8px; font-size: 0.78rem; color: #a0f0ff; display: none; justify-content: space-between; align-items: center;">
                            <span id="selected-body-text">Tippe auf einen Planeten für Details</span>
                            <button onclick="document.getElementById('selected-body-info').style.display='none'" style="background:none; border:none; color:#00ffff; cursor:pointer; font-weight:bold;">×</button>
                        </div>

                        <!-- Body-List im unteren Bereich -->
                        <div style="margin-top: 6px; font-weight: bold; font-size: 0.8rem; color: #a0a0ff; border-bottom: 1px solid rgba(0,255,255,0.2); padding-bottom: 2px; display: flex; justify-content: space-between;">
                            <span>System-Objekte:</span>
                            <span style="font-size: 0.75rem; color: #00ffff;">Tippe Körper an für Fokus</span>
                        </div>
                        <div id="body-list-container" style="margin-top: 4px; overflow-y: auto; flex-grow: 1; padding-right: 4px;"></div>

                        <div class="status-badge" style="margin-top: 4px; font-size: 0.7rem; padding: 2px 6px;">STATUS: INTERACTIVE ORRERY MAP</div>
                    </div>
                `;

                setTimeout(() => this.initSvgPanAndZoom(), 50);
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
                type: scanEvent.PlanetClass || scanEvent.StarType || 'Asteroiden',
                distance: scanEvent.DistanceFromArrivalLS || 0,
                landable: scanEvent.Landable || false,
                hasRings: !!(scanEvent.Rings && scanEvent.Rings.length > 0),
                wasDiscovered: scanEvent.WasDiscovered ?? true,
                wasMapped: scanEvent.WasMapped ?? true,
                wasFootfalled: scanEvent.WasFootfalled ?? true
            };

            this.stateData.currentSystemData.bodies.set(bodyId, bodyData);

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

        const sortedBodies = Array.from(this.stateData.currentSystemData.bodies.values())
            .filter(body => body.distance > 0)
            .sort((a, b) => a.distance - b.distance);

        const maxDist = sortedBodies.length > 0 ? Math.max(...sortedBodies.map(b => b.distance), 100) : 100;

        sortedBodies.forEach((body, index) => {
            const normalizedDist = Math.log(body.distance + 1) / Math.log(maxDist + 1);
            const x = 140 + normalizedDist * 700;
            const y = 120; // Auf der Hauptachse oder leicht versetzt bei Monden

            let color = "#00ffff";
            let radius = 6;
            if (body.type.includes("Gas giant")) {
                color = "#ff8800";
                radius = 10;
            } else if (body.landable) {
                color = "#00ff66";
                radius = 5.5;
            }

            const shortName = body.name.split(' ').pop();

            // Ring-Andeutung, falls Ringe vorhanden
            let ringSvg = '';
            if (body.hasRings) {
                ringSvg = `<ellipse cx="${x}" cy="${y}" rx="${radius + 6}" ry="${radius + 2}" fill="none" stroke="${color}" stroke-width="1.5" transform="rotate(-15 ${x} ${y})" opacity="0.85"/>`;
            }

            svgContent += `
                <g class="svg-body-node" style="cursor: pointer;" onclick="uiController.showBodyDetails('${body.name}', '${body.type}', ${body.distance}, ${body.landable})">
                    <line x1="${x}" y1="120" x2="${x}" y2="${y}" stroke="rgba(0,255,255,0.3)" stroke-width="1.5" />
                    ${ringSvg}
                    <circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" filter="drop-shadow(0 0 6px ${color})" />
                    <text x="${x}" y="${y + 24}" fill="#a0f0ff" font-size="10" font-family="monospace" text-anchor="middle" font-weight="bold">${shortName}</text>
                </g>
            `;

            // Listeneintrag unten
            let badgesHtml = '';
            if (body.landable) badgesHtml += `<span style="color: #00ff66; border: 1px solid #00ff66; padding: 1px 4px; border-radius: 3px; font-size: 0.65rem; margin-left: 6px;">LANDABLE</span>`;
            if (!body.wasFootfalled) badgesHtml += `<span style="color: #ff00ff; font-size: 0.65rem; margin-left: 6px;" title="First Footfall möglich">👣 FIRST FOOTFALL</span>`;
            if (body.hasRings) badgesHtml += `<span style="color: #00ffff; font-size: 0.65rem; margin-left: 6px;">🪐 RINGED</span>`;

            listContent += `
                <div class="hud-row" style="font-size: 0.82rem; border-bottom: 1px solid rgba(0,255,255,0.15); padding: 5px 4px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="color: #fff; font-weight: bold;">${body.name}</span>
                        ${badgesHtml}
                    </div>
                    <div style="text-align: right; color: ${color};">
                        <span style="font-weight: bold;">${body.type}</span> 
                        <span style="color: #88a0a8; font-size: 0.78rem; margin-left: 10px;">${body.distance.toFixed(1)} LS</span>
                    </div>
                </div>
            `;
        });

        if (bodiesGroup) bodiesGroup.innerHTML = svgContent;
        if (bodyListContainer) bodyListContainer.innerHTML = listContent || '<div style="color: #666; font-size: 0.85rem; padding: 6px;">Warte auf Scans...</div>';
    }

    initSvgPanAndZoom() {
        const svg = document.getElementById('system-svg-map');
        const container = document.getElementById('zoom-container');
        const resetBtn = document.getElementById('reset-zoom-btn');
        if (!svg || !container) return;

        let scale = 1;
        let pannedX = 0;
        let pannedY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        const updateTransform = () => {
            container.setAttribute('transform', `translate(${pannedX}, ${pannedY}) scale(${scale})`);
        };

        // Reset Zoom Handler
        if (resetBtn) {
            resetBtn.onclick = () => {
                scale = 1;
                pannedX = 0;
                pannedY = 0;
                updateTransform();
            };
        }

        svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomIntensity = 0.1;
            if (e.deltaY < 0) {
                scale *= (1 + zoomIntensity);
            } else {
                scale /= (1 + zoomIntensity);
            }
            scale = Math.max(0.5, Math.min(scale, 5.0));
            updateTransform();
        }, {passive: false});

        svg.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX - pannedX;
            startY = e.clientY - pannedY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            pannedX = e.clientX - startX;
            pannedY = e.clientY - startY;
            updateTransform();
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch Support
        let initialDistance = null;
        svg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX - pannedX;
                startY = e.touches[0].clientY - startY;
            } else if (e.touches.length === 2) {
                isDragging = false;
                initialDistance = Math.hypot(
                    e.touches.clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        });

        svg.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                pannedX = e.touches.clientX - startX;
                pannedY = e.touches.clientY - startY;
                updateTransform();
            } else if (e.touches.length === 2 && initialDistance) {
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const factor = currentDistance / initialDistance;
                scale = Math.max(0.5, Math.min(scale * factor, 5.0));
                initialDistance = currentDistance;
                updateTransform();
            }
        }, {passive: true});

        svg.addEventListener('touchend', () => {
            isDragging = false;
            initialDistance = null;
        });
    }

    // Zeigt Details an, wenn man auf einen Planeten in der SVG-Map tippt
    showBodyDetails(bodyName, bodyType, distance, landable) {
        const infoBox = document.getElementById('selected-body-info');
        const infoText = document.getElementById('selected-body-text');
        if (!infoBox || !infoText) return;

        infoText.innerHTML = `<strong>${bodyName}</strong> (${bodyType}) — ${distance.toFixed(1)} LS ${landable ? '<span style="color: #00ff66;">[LANDABLE]</span>' : ''}`;
        infoBox.style.display = 'flex';
    }
}