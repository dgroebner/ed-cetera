class FSSDiscoveryScanHandler {
    handle(event, uiController) {
        if (uiController && uiController.stateData) {
            uiController.stateData.currentSystemData.name = event.SystemName;
            uiController.stateData.currentSystemData.bodyCount = event.BodyCount;
        }

        // Direkt in die Live-System-Ansicht umschalten, wenn der FSS-Scan reinkommt
        uiController.transitionTo('SYSTEM_MAP', {
            StarSystem: event.SystemName
        });
    }
}
