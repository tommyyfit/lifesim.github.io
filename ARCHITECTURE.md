# LifeSim architecture

LifeSim is a dependency-free browser application. `index.html` loads plain scripts synchronously because later simulation modules intentionally extend earlier globals.

## Canonical layers

1. `js/bootstrap.js` records resource failures and verifies the startup contract.
2. `data/` contains deterministic content definitions.
3. `js/save.js`, `js/ui.js`, `js/engine.js`, and `js/main.js` provide persistence, rendering, simulation, and application lifecycle behavior.
4. Feature modules such as careers, relationships, health, assets, pets, skills, and crime own their individual systems.
5. Compatibility layers preserve older save and feature behavior.
6. `js/lifesim-fun-first.js` and `css/lifesim-fun-first.css` are the only canonical presentation layer and must load last.

The exact stylesheet and script order is declared in `build-manifest.json`. `node qa.js` fails when `index.html` drifts from that manifest.

## Invariants

- Core simulation modules must not depend on Ollama.
- Saves are normalized at every save, load, backup, and import boundary.
- A year can process only once at a time through `Engine._aging`.
- An event choice can settle only once.
- Main navigation is derived from age; optional systems remain accessible through More.
- Fun First owns visible branding, primary navigation, the Life screen, and event presentation.
- New content IDs must be unique and stable after release.

## Safe change workflow

1. Add or modify the smallest owning module.
2. Avoid adding another global patch layer when an existing owner can be changed directly.
3. Update `build-manifest.json` if a loaded asset changes.
4. Run `node qa.js`.
5. Serve the folder locally and complete desktop and mobile lifecycle checks before packaging.

`window.LifeSimBoot.report()` returns startup status and captured resource/runtime errors for diagnostics without exposing save data.
