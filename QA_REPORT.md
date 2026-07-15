# LifeSim v24.2.1 — QA Report

Tested on 11 July 2026 using Chromium and static validation.

## Browser checks passed

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

## Static checks

- All 44 JavaScript files pass `node --check`.
- Python and Node launchers pass syntax validation.
- Local stylesheet and script references resolve.
- Duplicate HTML IDs are checked before packaging.
- The Python launcher returned HTTP 200 for `index.html` on the local server.
- The final ZIP is tested for archive integrity.

## Important testing note

The automated lifecycle test keeps health above 80 while checking age transitions. This isolates navigation and year-processing behavior from intentional health consequences. Separate gameplay logic still allows death when health genuinely collapses.
