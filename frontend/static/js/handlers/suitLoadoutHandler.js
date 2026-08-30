class SuitLoadoutHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateSuitLoadout === 'function') {
            uiController.updateSuitLoadout(event);
        }
    }
}