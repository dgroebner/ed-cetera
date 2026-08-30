class ScanOrganicHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateScanOrganic === 'function') {
            uiController.updateScanOrganic(event);
        }
    }
}