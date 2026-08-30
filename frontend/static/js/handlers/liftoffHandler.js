class LiftoffHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateLiftoff === 'function') {
            uiController.updateLiftoff(event);
        }
    }
}