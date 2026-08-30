class DisembarkHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateDisembark === 'function') {
            uiController.updateDisembark(event);
        }
    }
}