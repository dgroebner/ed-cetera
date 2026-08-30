class SurfaceScanHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateSurfaceScan === 'function') {
            uiController.updateSurfaceScan(event);
        }
    }
}