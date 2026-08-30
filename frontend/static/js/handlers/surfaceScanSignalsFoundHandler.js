class SAASignalsFoundHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateSurfaceScanSignals === 'function') {
            uiController.updateSurfaceScanSignals(event);
        }
    }
}