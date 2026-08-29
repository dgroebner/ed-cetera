class FSSBodySignalsHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateBodySignals === 'function') {
            uiController.updateBodySignals(event);
        }
    }
}