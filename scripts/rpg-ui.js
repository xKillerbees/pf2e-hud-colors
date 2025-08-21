Hooks.on('init', () => {
	// Register module settings.

	game.settings.register('pathfinder-ui', 'pf2eHud', {
		name: game.i18n.localize('RPGUI.SETTINGS.PF2E_HUD'),
		hint: game.i18n.localize('RPGUI.SETTINGS.PF2E_HUD_HINT'),
		scope: "client",
		type: Boolean,
		default: false,
		config: true,
		onChange: () => {
			location.reload();
		}
	});

	if (!game.settings.get('pathfinder-ui', 'pf2eHud')) { rpgUIAddPf2eHud() }

});

function rpgUIAddPf2eHud() {
	const head = document.getElementsByTagName("head")[0];
	const mainCss = document.createElement("link");
	mainCss.setAttribute("rel", "stylesheet")
	mainCss.setAttribute("type", "text/css")
	mainCss.setAttribute("href", "modules/pf2e-hud-colors/css/pf2e-hud.css")
	mainCss.setAttribute("media", "all")
	head.insertBefore(mainCss, head.lastChild);
}


