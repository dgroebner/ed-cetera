class LoadGameHandler {
    handle(event, uiController) {
        const data = {
            commanderName: event.Commander,
            shipType: event.Ship_Localised || event.Ship,
            shipName: event.ShipName || event.Commander,
            credits: event.Credits
        };

        // UI-Controller anweisen, diesen Zustand zu rendern
        uiController.transitionTo('IN_SHIP', data);
    }
}