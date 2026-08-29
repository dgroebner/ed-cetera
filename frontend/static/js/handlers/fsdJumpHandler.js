class FSDJumpHandler {
    handle(event, uiController) {
        // Nach erfolgreichem Sprung sind wir wieder im Schiff und aktualisieren die Positionsdaten
        uiController.transitionTo('IN_SHIP', {
            StarSystem: event.StarSystem,
            Body: event.Body,
            StarPos: event.StarPos,
            JumpDist: event.JumpDist
        });
    }
}