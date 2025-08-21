# PF2E HUD Colors

Adds color styling and UI tweaks for the [PF2E HUD](https://github.com/reonZ/pf2e-hud) module.

Colors picked from Pathfinder UI v3 by Sasmira
[Request to Sasmira](https://gitlab.com/sasmira/pathfinder-ui/-/issues/97#note_2127535397)

With HUD Colors
<img width="679" height="249" alt="image" src="https://github.com/user-attachments/assets/a978d983-3693-4303-8ab8-fc415d49331d" />

Without HUD Colors
<img width="677" height="244" alt="image" src="https://github.com/user-attachments/assets/433e4cee-d038-4328-8e27-472ecd1c40d6" />

## Requirements
- Foundry VTT v12+ (tested on v13)
- System: PF2E
- Module: PF2E HUD (by reonZ)

## Installation
**Via Manifest URL**
1. Copy the manifest URL for the release you want, for example:
   `https://raw.githubusercontent.com/xKillerbees/pf2e-hud-colors/main/module.json`
2. In Foundry: *Add-on Modules* → *Install Module* → Paste the URL → *Install*.

**Manual**
1. Download the release zip (e.g. `pf2e-hud-colors-v1.0.0.zip`) from the Releases page.
2. Extract into your `Data/modules` folder so that the path is `Data/modules/pf2e-hud-colors/`.
3. Restart Foundry.

## Development
```bash
# clone
git clone https://github.com/xKillerbees/pf2e-hud-colors.git
cd pf2e-hud-colors

# optional: link into your local Foundry data folder for live testing
# replace PATH_TO_DATA with your Foundry data path
ln -s "$(pwd)" PATH_TO_DATA/Data/modules/pf2e-hud-colors

# bump version in module.json and tag a release
git add -A && git commit -m "v1.0.0" && git tag v1.0.0 && git push --tags
```

## Releasing
1. Update `version`, `manifest`, and `download` in `module.json` for the new tag (e.g. `v1.0.1`).
2. Create a zip of the module folder contents (without `.git`), named `pf2e-hud-colors-v1.0.1.zip`.
3. Create a GitHub Release with tag `v1.0.1` and upload the zip as an asset.
4. Users can install/update via the manifest URL.

## License
MIT
