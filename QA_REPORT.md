# LifeSim v24.2.1 — QA Report

Last verified on 16 July 2026.

## Current automated checks

- The canonical page loads `lifesim-fun-first.css` and `lifesim-fun-first.js` after the compatibility layers.
- All 60 page resources plus `build-manifest.json` resolve from the local server with HTTP 200.
- All 192 HTML IDs are unique.
- All 85 inline control handlers compile.
- The build manifest exactly matches all 16 stylesheets and 44 scripts in canonical load order.
- All 44 loaded JavaScript and data files pass `node --check`.
- All 16 stylesheets pass structural brace validation.
- All 49 careers, 127 achievements and 121 core events pass schema, uniqueness and safe-empty-state validation.
- Corrupted-save fixtures pass normalization, clamping, collection repair and invalid-identity rejection checks.
- Startup records resource/runtime failures, validates required modules and mounts, and provides an accessible reload path without deleting saves.
- Python and Node launchers pass syntax validation.
- `index.html` returns HTTP 200 from the local server.

Run these checks with `node qa.js`.

## Prior browser checks

- New-life setup opens and completes.
- Infant navigation contains only Life, Activities, Family and Health.
- Four age-appropriate quick actions render.
- Updates and Settings dialogs open correctly.
- All five Settings categories render: Game, Look, Sound, Local AI and Save.
- Ollama controls remain available.
- Real Age Up progression was tested through age 26.
- Navigation transitions were verified at ages 6, 13, 18 and 25.
- More opens and an optional system can be entered and exited.
- The simplified event modal renders without legacy risk metadata.
- No inline click-handler compilation failures were found.
- No browser page errors or console errors were observed in the focused run.
- Desktop width: 1440 px with no horizontal overflow.
- Mobile width: 390 px with no horizontal overflow.
- Mobile Settings remained inside the viewport.

The browser checks above were completed on 11 July 2026. They should be repeated after substantial layout or gameplay changes. The automated checker intentionally does not claim visual fidelity or full lifecycle coverage.

## Important testing note

The automated lifecycle test keeps health above 80 while checking age transitions. This isolates navigation and year-processing behavior from intentional health consequences. Separate gameplay logic still allows death when health genuinely collapses.
