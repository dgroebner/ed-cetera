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
                    <div class="hud-card" style="display: flex; flex-direction: column; height: 94vh; max-height: 94vh; box-sizing: border-box; padding: 8px; overflow: hidden;">
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,255,255,0.3); padding-bottom: 4px; flex-shrink: 0;">
                            <h2 class="card-title" style="margin: 0; font-size: 1.1rem; color: #ffaa00;">SYSTEM: ${this.stateData.currentSystemData.name || this.stateData.starSystem}</h2>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="font-size: 0.9rem; color: #a0f0ff;">Körper: <span id="body-count-text" style="color: #00ffff; font-weight: bold;">0</span></div>
                                <button id="reset-zoom-btn" style="background: rgba(0,255,255,0.1); border: 1px solid rgba(0,255,255,0.4); color: #00ffff; font-size: 0.8rem; padding: 3px 8px; border-radius: 4px; cursor: pointer;">RESET ZOOM</button>
                            </div>
                        </div>
                        
                        <!-- Zoom-able SVG System Map -->
                        <div style="height: 220px; min-height: 220px; flex-shrink: 0; position: relative; margin-top: 6px; background: #02060a; border: 1px solid rgba(0,255,255,0.4); border-radius: 4px; overflow: hidden; touch-action: none;">
                            <svg id="system-svg-map" viewBox="0 0 900 280" width="100%" height="100%" style="display: block; cursor: grab;">
                                <defs>
                                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,255,255,0.04)" stroke-width="1"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />

                                <g id="zoom-container">
                                    <line x1="0" y1="120" x2="2500" y2="120" stroke="rgba(0,255,255,0.2)" stroke-dasharray="4,4" />
                                    
                                    <g id="svg-star-group">
                                        <circle cx="60" cy="120" r="24" fill="#ffaa00" filter="drop-shadow(0 0 12px #ffaa00)" />
                                        <text x="60" y="85" fill="#ffaa00" font-size="12" text-anchor="middle" font-family="sans-serif" font-weight="bold">${this.stateData.currentSystemData.name || 'Primary Star'}</text>
                                    </g>

                                    <g id="svg-bodies-group"></g>
                                </g>
                            </svg>
                            <div style="position: absolute; bottom: 4px; right: 8px; font-size: 0.7rem; color: rgba(0,255,255,0.5); pointer-events: none;">
                                [Pinch / Scroll zoomen · Ziehen verschieben]
                            </div>
                        </div>

                        <!-- Info-Box für angetippten Planeten -->
                        <div id="selected-body-info" style="margin-top: 6px; flex-shrink: 0; background: rgba(0,255,255,0.08); border: 1px solid rgba(0,255,255,0.3); border-radius: 4px; padding: 6px 10px; font-size: 0.9rem; color: #a0f0ff; display: none; justify-content: space-between; align-items: center;">
                            <span id="selected-body-text">Tippe auf einen Planeten für Details</span>
                            <button onclick="document.getElementById('selected-body-info').style.display='none'" style="background:none; border:none; color:#00ffff; cursor:pointer; font-weight:bold; font-size: 1rem;">×</button>
                        </div>

                        <!-- Body-List im unteren Bereich mit echtem mobilem Scrollen -->
                        <div style="margin-top: 6px; flex-shrink: 0; font-weight: bold; font-size: 0.9rem; color: #a0a0ff; border-bottom: 1px solid rgba(0,255,255,0.2); padding-bottom: 2px; display: flex; justify-content: space-between;">
                            <span>System-Objekte:</span>
                            <span style="font-size: 0.8rem; color: #00ffff;">Fokus per Tipp</span>
                        </div>
                        <div id="body-list-container" style="margin-top: 4px; overflow-y: auto; -webkit-overflow-scrolling: touch; flex-grow: 1; min-height: 0; padding-right: 4px;"></div>

                        <div class="status-badge" style="margin-top: 4px; flex-shrink: 0; font-size: 0.75rem; padding: 3px 6px;">STATUS: ORRERY MAP ACTIVE</div>
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
            // Eltern-ID aus dem Parents-Array extrahieren (entweder Planet oder Star/Null)
            let parentId = null;
            if (scanEvent.Parents && scanEvent.Parents.length > 0) {
                const p = scanEvent.Parents;
                if (p[0].Planet !== undefined) parentId = p[0].Planet;
                else if (p[0].Star !== undefined) parentId = p[0].Star;
                else if (p[0].Null !== undefined) parentId = p[0].Null; // Baryzentrum
            }

            const bodyData = {
                id: bodyId,
                name: scanEvent.BodyName,
                type: scanEvent.PlanetClass || scanEvent.StarType || 'Unbekannt',
                distance: scanEvent.DistanceFromArrivalLS || 0,
                landable: scanEvent.Landable || false,
                hasRings: !!(scanEvent.Rings && scanEvent.Rings.length > 0),
                wasDiscovered: scanEvent.WasDiscovered ?? true,
                wasMapped: scanEvent.WasMapped ?? true,
                wasFootfalled: scanEvent.WasFootfalled ?? true,
                parentId: parentId
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

        const bodiesMap = this.stateData.currentSystemData.bodies;

        // Belt Cluster (Asteroidengürtel) filtern, damit sie die Ansicht nicht fluten (bleiben übersichtlich weggefiltert)
        const allBodies = Array.from(bodiesMap.values()).filter(b => {
            if (b.distance === 0) return false;
            return !(b.name && b.name.includes("Belt Cluster"));

        });

        const primaryBodies = allBodies.filter(b => b.parentId === null || b.parentId === 0 || !bodiesMap.has(b.parentId));
        primaryBodies.sort((a, b) => a.distance - b.distance);

        // Finde die maximale Distanz, um sie sauber auf unsere Map-Breite (z.B. 800 Pixel) abzubilden
        const maxDist = primaryBodies.length > 0 ? Math.max(...primaryBodies.map(b => b.distance), 10) : 10;

        const bodyCoords = new Map();
        let lastX = -100;

        primaryBodies.forEach((body) => {
            // Logarithmische Skalierung mit Log10, damit ferne Planeten nicht rechts rauslaufen
            // Wir mappen 0 bis log10(maxDist + 1) auf einen Bereich von 0 bis 750 Pixeln
            const logMax = Math.log10(maxDist + 1);
            const logCurrent = Math.log10(body.distance + 1);

            let x = 150 + (logCurrent / (logMax || 1)) * 720;

            // Verhindere Überlappungen bei eng beieinander liegenden Körpern
            if (x - lastX < 50) {
                x = lastX + 50;
            }
            lastX = x;

            const y = 120; // Hauptachse
            bodyCoords.set(body.id, {x, y});

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

            let ringSvg = '';
            if (body.hasRings) {
                ringSvg = `<ellipse cx="${x}" cy="${y}" rx="${radius + 6}" ry="${radius + 2}" fill="none" stroke="${color}" stroke-width="1.5" transform="rotate(-15 ${x} ${y})" opacity="0.85"/>`;
            }

            // Label ÜBER dem Körper (Y = 88), damit Verbindungslinien nicht durch den Text schneiden
            svgContent += `
                <g class="svg-body-node" style="cursor: pointer;" onclick="uiController.showBodyDetails('${body.name.replace(/'/g, "\\'")}', '${body.type}', ${body.distance}, ${body.landable})">
                    <line x1="${x}" y1="120" x2="${x}" y2="${y}" stroke="rgba(0,255,255,0.3)" stroke-width="1.5" />
                    ${ringSvg}
                    <circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" filter="drop-shadow(0 0 6px ${color})" />
                    <text x="${x}" y="88" fill="#a0f0ff" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold" style="letter-spacing: 0.5px;">${shortName}</text>
                </g>
            `;

            listContent += this.generateListRow(body);
        });

        // Kinder (Monde) vertikal darunter anordnen
        allBodies.filter(b => b.parentId !== null && b.parentId !== 0 && bodiesMap.has(b.parentId)).forEach((child, cIndex) => {
            const parentCoord = bodyCoords.get(child.parentId);
            if (!parentCoord) return;

            const x = parentCoord.x;
            const y = parentCoord.y + 45 + (cIndex * 28);

            let color = child.landable ? "#00ff66" : "#00ffff";
            const shortName = child.name.split(' ').pop();

            svgContent += `
                <g class="svg-body-node" style="cursor: pointer;" onclick="uiController.showBodyDetails('${child.name.replace(/'/g, "\\'")}', '${child.type}', ${child.distance}, ${child.landable})">
                    <path d="M ${x} ${parentCoord.y + 10} L ${x} ${y} L ${x + 12} ${y}" fill="none" stroke="rgba(0,255,255,0.4)" stroke-width="1.2" />
                    <circle cx="${x}" cy="${y}" r="4" fill="${color}" filter="drop-shadow(0 0 4px ${color})" />
                    <text x="${x + 16}" y="${y + 4}" fill="#a0f0ff" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="start">${shortName}</text>
                </g>
            `;

            listContent += this.generateListRow(child, true);
        });

        if (bodiesGroup) bodiesGroup.innerHTML = svgContent;
        if (bodyListContainer) bodyListContainer.innerHTML = listContent || '<div style="color: #666; font-size: 0.9rem; padding: 6px;">Warte auf Scans...</div>';
    }

    generateListRow(body, isChild = false) {
        let badgesHtml = '';
        if (body.landable) badgesHtml += `<span style="color: #00ff66; border: 1px solid #00ff66; padding: 1px 4px; border-radius: 3px; font-size: 0.75rem; margin-left: 6px;">LANDABLE</span>`;
        // First Footfall NUR bei landbaren Planeten
        if (body.landable && !body.wasFootfalled) badgesHtml += `<span style="color: #ff00ff; font-size: 0.75rem; margin-left: 6px;" title="First Footfall möglich">👣 FIRST FOOTFALL</span>`;
        if (body.hasRings) badgesHtml += `<span style="color: #00ffff; font-size: 0.75rem; margin-left: 6px;">🪐 RINGED</span>`;

        const indent = isChild ? 'margin-left: 20px; border-left: 2px solid rgba(0,255,255,0.3); padding-left: 8px;' : '';
        const color = body.landable ? "#00ff66" : (body.type.includes("Gas giant") ? "#ff8800" : "#00ffff");

        // Schriftgrößen auf lesbare Werte >= 0.9rem angehoben
        return `
            <div class="hud-row" style="font-size: 0.92rem; line-height: 1.4; border-bottom: 1px solid rgba(0,255,255,0.15); padding: 8px 4px; display: flex; justify-content: space-between; align-items: center; ${indent}">
                <div>
                    <span style="color: #fff; font-weight: bold;">${body.name}</span>
                    ${badgesHtml}
                </div>
                <div style="text-align: right; color: ${color};">
                    <span style="font-weight: bold;">${body.type}</span> 
                    <span style="color: #88a0a8; font-size: 0.85rem; margin-left: 10px;">${body.distance.toFixed(1)} LS</span>
                </div>
            </div>
        `;
    }

    showBodyDetails(bodyName, bodyType, distance, landable) {
        const infoBox = document.getElementById('selected-body-info');
        const infoText = document.getElementById('selected-body-text');
        if (!infoBox || !infoText) return;

        // Tooltip zeigt volles Label an
        infoText.innerHTML = `<strong>Körper:</strong> ${bodyName} &nbsp;|&nbsp; <em>${bodyType}</em> &nbsp;|&nbsp; ${distance.toFixed(1)} LS ${landable ? '<span style="color: #00ff66; font-weight: bold;">[LANDABLE]</span>' : ''}`;
        infoBox.style.display = 'flex';
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
}