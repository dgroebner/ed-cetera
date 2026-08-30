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
                bodies: new Map(),
                signals: new Map()
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
                // Beim Sprung in ein neues System die alten Daten verwerfen!
                this.resetSystemData();

                app.innerHTML = `
                    <div class="hud-card">
                        <h2 class="card-title">HYPERSPACE</h2>
                        <div class="hud-row">Target System: <span>${this.stateData.starSystem}</span></div>
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
                    <div class="hud-card" style="display: flex; flex-direction: column; height: 100vh; max-height: 100vh; box-sizing: border-box; padding: 6px; overflow: hidden;">
                        
                        <!-- Header -->
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,255,255,0.3); padding-bottom: 4px; flex-shrink: 0;">
                            <h2 class="card-title" style="margin: 0; font-size: 1rem; color: #ffaa00;">SYSTEM: ${this.stateData.currentSystemData.name || this.stateData.starSystem}</h2>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="font-size: 0.85rem; color: #a0f0ff;">Körper: <span id="body-count-text" style="color: #00ffff; font-weight: bold;">0 / ${this.stateData.currentSystemData.bodyCount || '?'}</span></div>
                                <button id="reset-zoom-btn" style="background: rgba(0,255,255,0.1); border: 1px solid rgba(0,255,255,0.4); color: #00ffff; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; cursor: pointer;">RESET ZOOM</button>
                            </div>
                        </div>
                        
                        <!-- SVG Map Container (Flexibel im oberen Bereich eingepasst) -->
                        <div style="height: 190px; min-height: 190px; flex-shrink: 0; position: relative; margin-top: 4px; background: #02060a; border: 1px solid rgba(0,255,255,0.4); border-radius: 4px; overflow: hidden; touch-action: none;">
                            <svg id="system-svg-map" viewBox="0 0 900 260" width="100%" height="100%" style="display: block; cursor: grab;">
                                <defs>
                                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(0,255,255,0.04)" stroke-width="1"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid)" />

                                <g id="zoom-container">
                                    <line x1="0" y1="110" x2="2500" y2="110" stroke="rgba(0,255,255,0.2)" stroke-dasharray="4,4" />
                                    
                                    <g id="svg-star-group">
                                        <circle cx="60" cy="110" r="22" fill="#ffaa00" filter="drop-shadow(0 0 10px #ffaa00)" />
                                        <text x="60" y="78" fill="#ffaa00" font-size="11" text-anchor="middle" font-family="sans-serif" font-weight="bold">${this.stateData.currentSystemData.name || 'Primary Star'}</text>
                                    </g>

                                    <g id="svg-bodies-group"></g>
                                </g>
                            </svg>
                            <div style="position: absolute; bottom: 3px; right: 6px; font-size: 0.65rem; color: rgba(0,255,255,0.5); pointer-events: none;">
                                [Pinch / Scroll zoomen · Ziehen verschieben]
                            </div>
                        </div>

                        <!-- Info-Box für ausgewählte Körper -->
                        <div id="selected-body-info" style="margin-top: 4px; flex-shrink: 0; background: rgba(0,255,255,0.08); border: 1px solid rgba(0,255,255,0.3); border-radius: 4px; padding: 4px 8px; font-size: 0.85rem; color: #a0f0ff; display: none; justify-content: space-between; align-items: center;">
                            <span id="selected-body-text">Tippe auf einen Planeten für Details</span>
                            <button onclick="document.getElementById('selected-body-info').style.display='none'" style="background:none; border:none; color:#00ffff; cursor:pointer; font-weight:bold; font-size: 0.9rem;">×</button>
                        </div>

                        <!-- Tabellen-Container (Nimmt den restlichen Platz ein und scrollt sauber) -->
                        <div style="margin-top: 4px; flex-shrink: 0; font-weight: bold; font-size: 0.85rem; color: #a0a0ff; border-bottom: 1px solid rgba(0,255,255,0.2); padding-bottom: 2px; display: flex; justify-content: space-between;">
                            <span>System-Objekte:</span>
                            <span style="font-size: 0.75rem; color: #00ffff;">Fokus per Tipp</span>
                        </div>
                        <div id="body-list-container" style="margin-top: 2px; overflow-y: auto; -webkit-overflow-scrolling: touch; flex-grow: 1; min-height: 0; padding-right: 4px; margin-bottom: 4px;"></div>
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
            let parentId = null;
            if (scanEvent.Parents && scanEvent.Parents.length > 0) {
                const p = scanEvent.Parents;
                if (p[0].Planet !== undefined) parentId = p[0].Planet;
                else if (p[0].Star !== undefined) parentId = p[0].Star;
                else if (p[0].Null !== undefined) parentId = p[0].Null;
            }

            // Prüfen, ob für diesen Body bereits FSSBodySignals eingetroffen sind
            const cachedSignals = this.stateData.currentSystemData.signals.get(bodyId) || [];

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
                parentId: parentId,
                signals: cachedSignals // Direkt verknüpfen!
            };

            this.stateData.currentSystemData.bodies.set(bodyId, bodyData);

            if (this.stateData.status === 'SYSTEM_MAP') {
                this.renderSvgMap();
            }
        }
    }

    formatBodyName(bodyName, isChild = false) {
        if (!bodyName) return "Unbekannt";

        // Wenn es ein langgezogener Name ist, holen wir das Ende (z.B. "3 a" oder "A Belt Cluster 1")
        const parts = bodyName.split(' ');
        const lastPart = parts[parts.length - 1];

        // Für Monde (z.B. "3 a" -> "3a" oder "1 a" -> "1a")
        if (isChild && parts.length >= 2) {
            const secondLast = parts[parts.length - 2];
            // Prüfen ob das letzte Zeichen ein Buchstabe ist und das davor eine Zahl/Buchstabe
            if (/^[a-zA-Z]$/.test(lastPart) && /^[0-9a-zA-Z]+$/.test(secondLast)) {
                return secondLast + lastPart;
            }
        }

        return lastPart;
    }

    updateBodySignals(signalEvent) {
        const bodyId = signalEvent.BodyID;
        if (bodyId !== undefined) {
            // Signal direkt im System-State zwischenspeichern
            this.stateData.currentSystemData.signals.set(bodyId, signalEvent.Signals || []);

            // Falls der Körper schon existiert, direkt zuweisen
            if (this.stateData.currentSystemData.bodies.has(bodyId)) {
                const bodyData = this.stateData.currentSystemData.bodies.get(bodyId);
                bodyData.signals = signalEvent.Signals || [];
            }

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
        if (countText) {
            countText.innerText = `${totalBodiesFound}`;
        }

        if (!bodiesGroup && !bodyListContainer) return;

        let svgContent = '';
        let listContent = '';

        const bodiesMap = this.stateData.currentSystemData.bodies;

        // Belt Cluster (Asteroidengürtel) herausfiltern
        const allBodies = Array.from(bodiesMap.values()).filter(b => {
            if (b.distance === 0) return false;
            return !(b.name && b.name.includes("Belt Cluster"));
        });

        const primaryBodies = allBodies.filter(b => b.parentId === null || b.parentId === 0 || !bodiesMap.has(b.parentId));
        primaryBodies.sort((a, b) => a.distance - b.distance);

        const bodyCoords = new Map();
        let currentX = 160;
        const fixedStepSpacing = 75;

        primaryBodies.forEach((body) => {
            let x = currentX;
            currentX += fixedStepSpacing;

            const y = 120;
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

            const shortName = this.formatBodyName(body.name, false);

            let ringSvg = '';
            if (body.hasRings) {
                ringSvg = `<ellipse cx="${x}" cy="${y}" rx="${radius + 6}" ry="${radius + 2}" fill="none" stroke="${color}" stroke-width="1.5" transform="rotate(-15 ${x} ${y})" opacity="0.85"/>`;
            }

            // --- SVG VISUELLE BADGES (Entzerrt und nebeneinander platziert) ---
            let svgBadges = '';
            // Wir starten etwas weiter rechts vom Planetenkreis
            let badgeXOffset = x + radius + 8;

            if (!body.wasDiscovered) {
                svgBadges += `<text x="${badgeXOffset}" y="${y - 4}" fill="#ffaa00" font-size="9" font-family="sans-serif" font-weight="bold" title="Unerforscht">🔍</text>`;
                badgeXOffset += 14;
            }
            if (!body.wasMapped) {
                svgBadges += `<text x="${badgeXOffset}" y="${y - 4}" fill="#00ffff" font-size="9" font-family="sans-serif" font-weight="bold" title="Nicht gemappt">📡</text>`;
                badgeXOffset += 14;
            }
            if (body.landable && !body.wasFootfalled) {
                svgBadges += `<text x="${badgeXOffset}" y="${y - 4}" fill="#ff00ff" font-size="10" font-family="sans-serif" font-weight="bold" title="First Footfall möglich">👣</text>`;
                badgeXOffset += 16;
            }

            if (body.signals && body.signals.length > 0) {
                body.signals.forEach(sig => {
                    if (sig.Type_Localised === 'Biologisch' || sig.Type.includes('Biological')) {
                        svgBadges += `<text x="${badgeXOffset}" y="${y - 4}" fill="#00ffaa" font-size="9" font-family="sans-serif" font-weight="bold">🧬${sig.Count}</text>`;
                        badgeXOffset += 24;
                    }
                    if (sig.Type_Localised === 'Geologisch' || sig.Type.includes('Geological')) {
                        svgBadges += `<text x="${badgeXOffset}" y="${y - 4}" fill="#ffaa00" font-size="9" font-family="sans-serif" font-weight="bold">🌋${sig.Count}</text>`;
                        badgeXOffset += 24;
                    }
                });
            }

            // Haupt-SVG Knoten mit integrierten Mini-Badges neben dem Planeten/Label
            svgContent += `
                <g class="svg-body-node" style="cursor: pointer;" onclick="uiController.showBodyDetailsObject(${body.id})">
                    <line x1="${x}" y1="120" x2="${x}" y2="${y}" stroke="rgba(0,255,255,0.3)" stroke-width="1.5" />
                    ${ringSvg}
                    <circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" filter="drop-shadow(0 0 6px ${color})" />
                    <text x="${x}" y="88" fill="#a0f0ff" font-size="12" font-family="sans-serif" text-anchor="middle" font-weight="bold" style="letter-spacing: 0.5px;">${shortName}</text>
                    ${svgBadges}
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
            const shortName = this.formatBodyName(child.name, true);

            let childSvgBadges = '';
            // Weiter nach rechts verschieben (z.B. basierend auf der Textlänge von shortName),
            // damit sich Name und Badges nicht überlagern:
            let childBadgeXOffset = x + 28 + (shortName.length * 6);

            if (child.landable && !child.wasFootfalled) {
                childSvgBadges += `<text x="${childBadgeXOffset}" y="${y + 4}" fill="#ff00ff" font-size="9" font-family="sans-serif" font-weight="bold">👣</text>`;
                childBadgeXOffset += 14;
            }
            if (child.signals && child.signals.length > 0) {
                child.signals.forEach(sig => {
                    if (sig.Type_Localised === 'Biologisch' || sig.Type.includes('Biological')) {
                        childSvgBadges += `<text x="${childBadgeXOffset}" y="${y + 4}" fill="#00ffaa" font-size="8" font-family="sans-serif" font-weight="bold">🧬${sig.Count}</text>`;
                        childBadgeXOffset += 22;
                    }
                    if (sig.Type_Localised === 'Geologisch' || sig.Type.includes('Geological')) {
                        childSvgBadges += `<text x="${childBadgeXOffset}" y="${y + 4}" fill="#ffaa00" font-size="8" font-family="sans-serif" font-weight="bold">🌋${sig.Count}</text>`;
                        childBadgeXOffset += 22;
                    }
                });
            }

            svgContent += `
                <g class="svg-body-node" style="cursor: pointer;" onclick="uiController.showBodyDetailsObject(${child.id})">
                    <path d="M ${x} ${parentCoord.y + 10} L ${x} ${y} L ${x + 12} ${y}" fill="none" stroke="rgba(0,255,255,0.4)" stroke-width="1.2" />
                    <circle cx="${x}" cy="${y}" r="4" fill="${color}" filter="drop-shadow(0 0 4px ${color})" />
                    <text x="${x + 16}" y="${y + 4}" fill="#a0f0ff" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="start">${shortName}</text>
                    ${childSvgBadges}
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
        if (body.landable && !body.wasFootfalled) badgesHtml += `<span style="color: #ff00ff; font-size: 0.75rem; margin-left: 6px;" title="First Footfall möglich">👣 FIRST FOOTFALL</span>`;
        if (body.hasRings) badgesHtml += `<span style="color: #00ffff; font-size: 0.75rem; margin-left: 6px;">🪐 RINGED</span>`;

        // Hier binden wir deine FSSBodySignals ein:
        if (body.signals && body.signals.length > 0) {
            body.signals.forEach(sig => {
                if (sig.Type_Localised === 'Biologisch' || sig.Type.includes('Biological')) {
                    badgesHtml += `<span style="color: #00ffaa; border: 1px solid #00ffaa; padding: 1px 4px; border-radius: 3px; font-size: 0.75rem; margin-left: 6px;" title="Biologische Signale">🧬 ${sig.Count}</span>`;
                }
                if (sig.Type_Localised === 'Geologisch' || sig.Type.includes('Geological')) {
                    badgesHtml += `<span style="color: #ffaa00; border: 1px solid #ffaa00; padding: 1px 4px; border-radius: 3px; font-size: 0.75rem; margin-left: 6px;" title="Geologische Signale">🌋 ${sig.Count}</span>`;
                }
            });
        }

        const indent = isChild ? 'margin-left: 20px; border-left: 2px solid rgba(0,255,255,0.3); padding-left: 8px;' : '';
        const color = body.landable ? "#00ff66" : (body.type.includes("Gas giant") ? "#ff8800" : "#00ffff");

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

    showBodyDetailsObject(bodyId) {
        const body = this.stateData.currentSystemData.bodies.get(bodyId);
        const infoBox = document.getElementById('selected-body-info');
        const infoText = document.getElementById('selected-body-text');
        if (!body || !infoBox || !infoText) return;

        // Wir nutzen generateListRow (ohne Einrückung), damit der Info-Kasten
        // exakt dieselben Badges, Farben und Formatierungen wie die Tabelle hat!
        const rowHtml = this.generateListRow(body, false);

        infoText.innerHTML = `<div style="width: 100%;">${rowHtml}</div>`;
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

        if (resetBtn) {
            resetBtn.onclick = () => {
                scale = 1;
                pannedX = 0;
                pannedY = 0;
                updateTransform();
            };
        }

        // --- DESKTOP MOUSE EVENTS ---
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

        // --- MOBILE TOUCH EVENTS ---
        let initialDistance = null;
        let initialScale = 1;

        svg.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                // Ein Finger: Verschieben (Pan)
                isDragging = true;
                startX = e.touches[0].clientX - pannedX;
                startY = e.touches[0].clientY - startY;
            } else if (e.touches.length === 2) {
                // Zwei Finger: Pinch-Zoom vorbereiten
                isDragging = false;
                initialDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                initialScale = scale;
            }
        }, {passive: true});

        svg.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                pannedX = e.touches[0].clientX - startX;
                pannedY = e.touches[0].clientY - startY;
                updateTransform();
            } else if (e.touches.length === 2 && initialDistance) {
                // Aktiven Browser-Zoom/Scroll unbedingt verhindern bei Pinch-Gesten
                e.preventDefault();
                const currentDistance = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                const factor = currentDistance / initialDistance;
                scale = Math.max(0.5, Math.min(initialScale * factor, 5.0));
                updateTransform();
            }
        }, {passive: false});

        svg.addEventListener('touchend', () => {
            isDragging = false;
            initialDistance = null;
        });
    }

    resetSystemData() {
        this.stateData.currentSystemData = {
            name: null,
            bodyCount: 0,
            bodies: new Map()
        };
        const infoBox = document.getElementById('selected-body-info');
        if (infoBox) infoBox.style.display = 'none';
    }
}