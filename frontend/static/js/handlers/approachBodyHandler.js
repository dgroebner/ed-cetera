class ApproachBodyHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updatePlanetaryApproach === 'function') {
            uiController.updatePlanetaryApproach(event);
        }
    }
}