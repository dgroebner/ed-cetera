// Globale Instanzen
let ui = null;
let dispatcher = null;
let lastEventId = 0;

async function initStatus() {
    try {
        let statusRes = await fetch('/api/status');
        let statusData = await statusRes.json();

        if (statusData.last_id) {
            lastEventId = statusData.last_id;
        }

        let loadGameRes = await fetch('/api/last_loadgame');
        let loadGameData = await loadGameRes.json();
        if (loadGameData.data && dispatcher) {
            dispatcher.handleLine(loadGameData.data);
        }

        let locationRes = await fetch('/api/last_location');
        let locationData = await locationRes.json();
        if (locationData.data && dispatcher) {
            dispatcher.handleLine(locationData.data);
        }
    } catch (e) {
        console.log("Fehler bei der Initialisierung:", e);
    }
}

async function pollEvents() {
    try {
        let response = await fetch(`/api/events/since/${lastEventId}`);
        let result = await response.json();

        if (result.events && result.events.length > 0) {
            for (const item of result.events) {
                lastEventId = item.id;
                if (dispatcher) dispatcher.handleLine(item.data);
            }
        }
    } catch (e) {
        console.log("Fehler beim Event-Polling:", e);
    }
}

async function startApp() {
    try {
        // 1. Version vom Server holen (für das Cache-Busting)
        let res = await fetch('/api/version');
        let data = await res.json();
        let v = data.version || '1.0.0';

        // 2. Skripte dynamisch MIT Cache-Breaker (?v=...) nachladen
        const scripts = [
            `/static/js/uiController.js?v=${v}`,
            `/static/js/dispatcher.js?v=${v}`,
            `/static/js/handlers/approachBodyHandler.js?v=${v}`,
            `/static/js/handlers/disembarkHandler.js?v=${v}`,
            `/static/js/handlers/leaveBodyHandler.js?v=${v}`,
            `/static/js/handlers/liftoffHandler.js?v=${v}`,
            `/static/js/handlers/loadGameHandler.js?v=${v}`,
            `/static/js/handlers/locationHandler.js?v=${v}`,
            `/static/js/handlers/fsdJumpHandler.js?v=${v}`,
            `/static/js/handlers/fssBodySignalsHandler.js?v=${v}`,
            `/static/js/handlers/fssDiscoveryScanHandler.js?v=${v}`,
            `/static/js/handlers/startJumpHandler.js?v=${v}`,
            `/static/js/handlers/scanHandler.js?v=${v}`,
            `/static/js/handlers/scanOrganicHandler.js?v=${v}`,
            `/static/js/handlers/suitLoadoutHandler.js?v=${v}`,
            `/static/js/handlers/surfaceScanHandler.js?v=${v}`,
            `/static/js/handlers/surfaceScanSignalsFoundHandler.js?v=${v}`,
            `/static/js/handlers/supercruiseExitHandler.js?v=${v}`,
            `/static/js/handlers/touchdownHandler.js?v=${v}`,
        ];

        for (const src of scripts) {
            await new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = () => {
                    // Falls du LoadGameHandler.js noch nicht als eigene Datei hast,
                    // stört es hier nicht, aber wir loggen es vorsichtshalber.
                    console.warn(`Konnte Skript nicht laden (optional?): ${src}`);
                    resolve(); // Lädt trotzdem weiter, falls optional
                };
                document.body.appendChild(script);
            });
        }

        console.log(`Alle Skripte erfolgreich geladen (Version: ${v})`);

        // 3. UI und Dispatcher instanziieren
        ui = new UIController();
        dispatcher = new EliteJournalDispatcher(ui);

        // 4. Handler registrieren (Modularisierung)
        dispatcher.registerHandler('ApproachBody', new ApproachBodyHandler());
        dispatcher.registerHandler('Disembark', new DisembarkHandler());
        dispatcher.registerHandler('LeaveBody', new LeaveBodyHandler());
        dispatcher.registerHandler('Liftoff', new LiftoffHandler());
        dispatcher.registerHandler('LoadGame', new LoadGameHandler());
        dispatcher.registerHandler('Location', new LocationHandler());
        dispatcher.registerHandler('FSDJump', new FSDJumpHandler());
        dispatcher.registerHandler('FSSBodySignals', new FSSBodySignalsHandler());
        dispatcher.registerHandler('FSSDiscoveryScan', new FSSDiscoveryScanHandler());
        dispatcher.registerHandler('SAAScanComplete', new SurfaceScanHandler());
        dispatcher.registerHandler('SAASignalsFound', new SAASignalsFoundHandler());
        dispatcher.registerHandler('SuitLoadout', new SuitLoadoutHandler());
        dispatcher.registerHandler('Scan', new ScanHandler());
        dispatcher.registerHandler('ScanOrganic', new ScanOrganicHandler());
        dispatcher.registerHandler('StartJump', new StartJumpHandler());
        dispatcher.registerHandler('SupercruiseExit', new SupercruiseExitHandler());
        dispatcher.registerHandler('Touchdown', new TouchdownHandler());

        // 5. Status initialisieren und Live-Poller starten
        await initStatus();
        setInterval(pollEvents, 2000);

    } catch (e) {
        console.error("Fehler beim Starten der App:", e);
    }
}

// App-Start triggern
startApp();