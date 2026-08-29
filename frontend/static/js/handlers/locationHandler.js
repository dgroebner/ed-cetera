class LocationHandler {
    handle(event, uiController) {
        // Übergibt die relevanten System- und Positionsdaten an den UIController / State
        uiController.transitionTo('IN_SHIP', {
            StarSystem: event.StarSystem,
            Body: event.Body,
            Latitude: event.Latitude,
            Longitude: event.Longitude
        });
    }
}