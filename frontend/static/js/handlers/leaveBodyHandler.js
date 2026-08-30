class LeaveBodyHandler {
    handle(event, uiController) {
        if (uiController && typeof uiController.updateLeaveBody === 'function') {
            uiController.updateLeaveBody(event);
        }
    }
}