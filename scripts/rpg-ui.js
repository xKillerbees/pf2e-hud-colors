const MODULE_ID = "pf2e-hud-colors";
const LEGACY_MODULE_ID = "pathfinder-ui";
const SETTING_DISABLE_THEME = "pf2eHud";
const SETTING_ICON_VARIANTS = "iconColorVariants";
const SETTING_ACTION_BUTTON_COLORS = "actionButtonColors";
const THEME_STYLESHEET_HREF = "modules/pf2e-hud-colors/css/pf2e-hud.css";
const THEME_STYLESHEET_ID = "pf2e-hud-colors-theme";
const DISABLE_KILL_SWITCH_ID = "pf2e-hud-colors-disable-kill-switch";
const RARITY_CLASSES = [
	"pf2e-hud-rarity-common",
	"pf2e-hud-rarity-uncommon",
	"pf2e-hud-rarity-rare",
	"pf2e-hud-rarity-unique",
];
const ICON_VARIANTS_CLASS = "pf2e-hud-color-variants";
const ACTION_BUTTON_COLORS_CLASS = "pf2e-hud-action-button-colors";
let actionSidebarObserver = null;
const rarityCache = new Map();
let updateQueued = false;
let sidebarRefreshHandler = null;
let observedSidebarType = null;

Hooks.on("init", () => {
	// Migrate legacy client setting namespace once so existing users keep behavior.
	const legacySetting = game.settings.settings.get(`${LEGACY_MODULE_ID}.${SETTING_DISABLE_THEME}`);
	const newSetting = game.settings.settings.get(`${MODULE_ID}.${SETTING_DISABLE_THEME}`);

	if (legacySetting && !newSetting) {
		game.settings.register(MODULE_ID, SETTING_DISABLE_THEME, {
			name: game.i18n.localize("RPGUI.SETTINGS.PF2E_HUD"),
			hint: game.i18n.localize("RPGUI.SETTINGS.PF2E_HUD_HINT"),
			scope: "client",
			type: Boolean,
			default: game.settings.get(LEGACY_MODULE_ID, SETTING_DISABLE_THEME),
			config: false,
			onChange: (disabled) => applyHudThemeState(disabled),
		});
	} else {
		game.settings.register(MODULE_ID, SETTING_DISABLE_THEME, {
			name: game.i18n.localize("RPGUI.SETTINGS.PF2E_HUD"),
			hint: game.i18n.localize("RPGUI.SETTINGS.PF2E_HUD_HINT"),
			scope: "client",
			type: Boolean,
			default: false,
			config: false,
			onChange: (disabled) => applyHudThemeState(disabled),
		});
	}

	game.settings.register(MODULE_ID, SETTING_ICON_VARIANTS, {
		name: game.i18n.localize("RPGUI.SETTINGS.PF2E_HUD_ICON_VARIANTS"),
		hint: game.i18n.localize("RPGUI.SETTINGS.PF2E_HUD_ICON_VARIANTS_HINT"),
		scope: "client",
		type: Boolean,
		default: true,
		config: true,
		onChange: (enabled) => applyIconVariantClass(!isThemeDisabled() && !!enabled),
	});

	game.settings.register(MODULE_ID, SETTING_ACTION_BUTTON_COLORS, {
		name: game.i18n.localize("RPGUI.SETTINGS.PF2E_HUD_ACTION_BUTTON_COLORS"),
		hint: game.i18n.localize("RPGUI.SETTINGS.PF2E_HUD_ACTION_BUTTON_COLORS_HINT"),
		scope: "client",
		type: Boolean,
		default: true,
		config: true,
		onChange: (enabled) => applyActionButtonColorClass(!isThemeDisabled() && !!enabled),
	});

});

Hooks.on("ready", () => {
	applyHudThemeState(game.settings.get(MODULE_ID, SETTING_DISABLE_THEME));
	syncThemeClasses();
	setupActionSidebarObserver();
});

function applyIconVariantClass(enabled) {
	document.body.classList.toggle(ICON_VARIANTS_CLASS, !!enabled);
}

function applyActionButtonColorClass(enabled) {
	document.body.classList.toggle(ACTION_BUTTON_COLORS_CLASS, !!enabled);
	document.body.dataset.pf2eHudActionColors = enabled ? "1" : "0";
}

function syncThemeClasses() {
	const disabled = isThemeDisabled();
	applyIconVariantClass(!disabled && game.settings.get(MODULE_ID, SETTING_ICON_VARIANTS));
	applyActionButtonColorClass(!disabled && game.settings.get(MODULE_ID, SETTING_ACTION_BUTTON_COLORS));
}

function applyHudThemeState(disabled) {
	if (disabled) {
		for (const link of getThemeStylesheetLinks()) {
			link.remove();
		}
		enableDisableKillSwitch();
	} else {
		disableDisableKillSwitch();
		rpgUIAddPf2eHud();
	}

	document.body.classList.toggle("pf2e-hud-colors-disabled", !!disabled);
	if (disabled) {
		clearEnhancedSidebarState();
	}
	syncThemeClasses();
}

function getThemeStylesheetLinks() {
	const tail = THEME_STYLESHEET_HREF;

	return Array.from(document.querySelectorAll('link[rel="stylesheet"][href]')).filter((link) => {
		const href = link.getAttribute("href") || "";
		return link.id === THEME_STYLESHEET_ID || href.includes(tail);
	});
}

function setupActionSidebarObserver() {
	if (actionSidebarObserver) {
		actionSidebarObserver.disconnect();
		actionSidebarObserver = null;
	}

	if (sidebarRefreshHandler) {
		document.body.removeEventListener("click", sidebarRefreshHandler);
		document.body.removeEventListener("change", sidebarRefreshHandler);
	}

	sidebarRefreshHandler = () => queueSidebarRefresh();
	actionSidebarObserver = new MutationObserver(sidebarRefreshHandler);
	actionSidebarObserver.observe(document.getElementById("interface") ?? document.body, {
		childList: true,
		subtree: true,
	});

	document.body.addEventListener("click", sidebarRefreshHandler, { passive: true });
	document.body.addEventListener("change", sidebarRefreshHandler, { passive: true });

	sidebarRefreshHandler();
}

function queueSidebarRefresh() {
	if (updateQueued) return;
	updateQueued = true;
	requestAnimationFrame(() => {
		updateQueued = false;
		updateActiveActionRows();
	});
}

function updateActiveActionRows() {
	if (isThemeDisabled()) {
		clearEnhancedSidebarState();
		return;
	}

	const sidebar = document.querySelector("#pf2e-hud-sidebar");
	if (!sidebar) {
		observedSidebarType = null;
		rarityCache.clear();
		return;
	}

	const sidebarType = sidebar.dataset.type ?? "";
	if (observedSidebarType !== sidebarType) {
		observedSidebarType = sidebarType;
		delete sidebar.dataset.rarityApplied;
		rarityCache.clear();
	}

	const rows = sidebar.querySelectorAll(".item.action");
	for (const row of rows) {
		const hasActiveToggle = !!row.querySelector('.controls a.active');
		const hasOnSwitch = !!row.querySelector(
			'.controls a[data-action="toggle-stance"] i.fa-toggle-large-on, .controls a[data-action="toggle-exploration"] i.fa-toggle-large-on'
		);
		const hasCheckedInput = !!row.querySelector('input[type="checkbox"]:checked');
		const hasXmarkUse = !!row.querySelector('.controls a.use i.fa-xmark');

		row.classList.toggle("pf2e-hud-action-active", hasActiveToggle || hasOnSwitch || hasCheckedInput || hasXmarkUse);
	}

	const optionRows = sidebar.querySelectorAll(".option-toggles li");
	for (const row of optionRows) {
		const hasCheckedInput = !!row.querySelector('input[type="checkbox"]:checked');
		row.classList.toggle("pf2e-hud-action-active", hasCheckedInput);
	}

	if (sidebarType === "skills" || sidebarType === "extras") {
		const profWrappers = sidebar.querySelectorAll(".statistic-wrapper");
		for (const wrapper of profWrappers) {
			const isProficient = !!wrapper.querySelector(".item.statistic.proficient");
			wrapper.classList.toggle("pf2e-hud-proficient-action", isProficient);
		}
	}

	if (sidebarType === "spells" && sidebar.dataset.rarityApplied !== "1") {
		const spellRows = sidebar.querySelectorAll(".item[data-item-id]");
		for (const row of spellRows) {
			const itemId = row.dataset.itemId;
			const nameLink = row.querySelector('.details .name > a[data-action="item-description"]');
			if (!itemId || !nameLink) continue;

			const rarity = getItemRarityById(itemId);
			nameLink.classList.remove(...RARITY_CLASSES);
			nameLink.classList.add(`pf2e-hud-rarity-${rarity}`);
		}

		sidebar.dataset.rarityApplied = "1";
	}
}

function isThemeDisabled() {
	try {
		return !!game.settings.get(MODULE_ID, SETTING_DISABLE_THEME);
	} catch {
		return false;
	}
}

function clearEnhancedSidebarState() {
	const sidebar = document.querySelector("#pf2e-hud-sidebar");
	if (!sidebar) return;

	for (const row of sidebar.querySelectorAll(".pf2e-hud-action-active")) {
		row.classList.remove("pf2e-hud-action-active");
	}

	for (const row of sidebar.querySelectorAll(".pf2e-hud-proficient-action")) {
		row.classList.remove("pf2e-hud-proficient-action");
	}

	for (const link of sidebar.querySelectorAll(
		`.details .name > a.${RARITY_CLASSES.join(", .details .name > a.")}`
	)) {
		link.classList.remove(...RARITY_CLASSES);
	}

	delete sidebar.dataset.rarityApplied;
}

function getItemRarityById(itemId) {
	if (rarityCache.has(itemId)) {
		return rarityCache.get(itemId);
	}

	let rarity = "common";
	for (const actor of getLikelyActors()) {
		const item = actor?.items?.get(itemId);
		if (!item) {
			continue;
		}

		rarity = item.system?.traits?.rarity || "common";
		break;
	}

	rarityCache.set(itemId, rarity);
	return rarity;
}

function getLikelyActors() {
	const actors = [];
	const seen = new Set();

	const add = (actor) => {
		if (!actor?.id || seen.has(actor.id)) return;
		seen.add(actor.id);
		actors.push(actor);
	};

	add(game.user?.character);

	for (const token of canvas?.tokens?.controlled ?? []) {
		add(token.actor);
	}

	add(canvas?.tokens?.hud?.object?.actor);

	for (const actor of game.actors ?? []) {
		add(actor);
	}

	return actors;
}

function rpgUIAddPf2eHud() {
	const head = document.getElementsByTagName("head")[0];
	if (head.querySelector(`link#${THEME_STYLESHEET_ID}`)) {
		return;
	}

	const existing = head.querySelector(`link[rel="stylesheet"][href*="${THEME_STYLESHEET_HREF}"]`);
	if (existing) {
		existing.id = THEME_STYLESHEET_ID;
		return;
	}

	const mainCss = document.createElement("link");
	mainCss.id = THEME_STYLESHEET_ID;
	mainCss.setAttribute("rel", "stylesheet");
	mainCss.setAttribute("type", "text/css");
	mainCss.setAttribute("href", THEME_STYLESHEET_HREF);
	mainCss.setAttribute("media", "all");
	head.insertBefore(mainCss, head.lastChild);
}

function enableDisableKillSwitch() {
	if (document.getElementById(DISABLE_KILL_SWITCH_ID)) return;

	const style = document.createElement("style");
	style.id = DISABLE_KILL_SWITCH_ID;
	style.textContent = `
body.pf2e-hud-colors-disabled #pf2e-hud-persistent [data-panel] i,
body.pf2e-hud-colors-disabled [id^="pf2e-hud"] [data-sidebar] i,
body.pf2e-hud-colors-disabled [id^="pf2e-hud"] [data-section] i,
body.pf2e-hud-colors-disabled #pf2e-hud-sidebar [data-action="use-action"] i.fa-play,
body.pf2e-hud-colors-disabled #pf2e-hud-sidebar [data-action="hero-action-use"] i.fa-play {
  color: #d4d7de !important;
}

body.pf2e-hud-colors-disabled [id^="pf2e-hud"] [data-section],
body.pf2e-hud-colors-disabled [id^="pf2e-hud"] [data-sidebar] {
  --icon-color: #d4d7de !important;
}

body.pf2e-hud-colors-disabled #pf2e-hud-sidebar .item.action .name a,
body.pf2e-hud-colors-disabled #pf2e-hud-sidebar .option-toggles li,
body.pf2e-hud-colors-disabled #pf2e-hud-sidebar .option-toggles li a,
body.pf2e-hud-colors-disabled #pf2e-hud-sidebar .option-toggles li label,
body.pf2e-hud-colors-disabled #pf2e-hud-sidebar .option-toggles li span {
  color: inherit !important;
}

body.pf2e-hud-colors-disabled #pf2e-hud-sidebar .variants .variant {
  background: var(--variant-background) !important;
  border: none !important;
  color: var(--variant-color) !important;
  box-shadow: var(--variant-box-shadow) !important;
  border-radius: 2px !important;
  text-shadow: none !important;
}

body.pf2e-hud-colors-disabled #pf2e-hud-sidebar .variants .variant:hover {
  background: var(--variant-background-hover) !important;
  color: var(--variant-color-hover) !important;
}
`;
	document.head.appendChild(style);
}

function disableDisableKillSwitch() {
	document.getElementById(DISABLE_KILL_SWITCH_ID)?.remove();
}


