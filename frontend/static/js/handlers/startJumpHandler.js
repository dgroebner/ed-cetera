class StartJumpHandler {
    handle(event, uiController) {
        if (event.JumpType === 'Hyperspace') {
            // Echter Systemwechsel -> Voller Sprung-State mit Reset
            if (uiController && typeof uiController.transitionTo === 'function') {
                uiController.transitionTo('HYPERSPACE', {
                    starSystem: event.StarSystem
                });
            }
        } else if (event.JumpType === 'Supercruise') {
            // Innerhalb des Systems in den Supercruise wechseln -> Nur Status anpassen
            if (uiController && typeof uiController.updateSupercruiseStart === 'function') {
                uiController.updateSupercruiseStart(event);
            }
        }
    }
}