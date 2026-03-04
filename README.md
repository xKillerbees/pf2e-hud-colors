# PF2E HUD Colors

Adds color styling and UI tweaks for the [PF2E HUD](https://github.com/reonZ/pf2e-hud) module.

## Actor
<img width="716" height="234" alt="image" src="https://github.com/user-attachments/assets/b82549bf-9380-4663-9edc-68869cb1d74e" />
<img width="697" height="232" alt="image" src="https://github.com/user-attachments/assets/6ef91bcb-a143-41ff-a675-141bc036c155" />

## Party
<img width="512" height="198" alt="image" src="https://github.com/user-attachments/assets/c3434f87-05b4-4c17-861c-c6c7765209c0" />
<img width="577" height="192" alt="image" src="https://github.com/user-attachments/assets/59437e22-1172-4219-b54c-ed7b87f88d8b" />

## Actions
<img width="835" height="668" alt="image" src="https://github.com/user-attachments/assets/d81d1e7b-fa6e-4e3d-91ce-265de6749a5c" />
<img width="836" height="639" alt="image" src="https://github.com/user-attachments/assets/3a6ed33a-8427-4343-b5b4-a719fce9756a" />

## Spells
<img width="909" height="973" alt="image" src="https://github.com/user-attachments/assets/fa58d1f5-5676-4cde-b3aa-f501dd12b117" />
<img width="902" height="961" alt="image" src="https://github.com/user-attachments/assets/ade7e969-73e2-4c61-90d4-9f36d840744d" />

## Settings
- `Use Icon Color Variants?` (Client): Enables expanded per-icon coloring in PF2E HUD Colors.
- `Use Action Button Colors?` (Client): Enables custom strike/action chip styling.  
  When disabled, action chips are restored to default-like PF2E HUD color families.

Note:
- `Disable PF2E HUD Theme?` has been hidden from the settings UI as it was not working.

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
