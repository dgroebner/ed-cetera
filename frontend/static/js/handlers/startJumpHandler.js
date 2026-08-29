class StartJumpHandler {
    handle(event, uiController) {
        // Wenn der Sprung beginnt, schalten wir auf den Hyperspace-State um
        uiController.transitionTo('HYPERSPACE', {
            starSystem: event.StarSystem
        });
    }
}