class TouchdownHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateTouchdown === 'function') {
            uiController.updateTouchdown(event);
        }
    }
}