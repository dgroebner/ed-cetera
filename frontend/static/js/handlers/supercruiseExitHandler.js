class SupercruiseExitHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateSupercruiseExit === 'function') {
            uiController.updateSupercruiseExit(event);
        }
    }
}