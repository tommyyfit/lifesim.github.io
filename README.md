# LifeSim v24.2.1 — Fun First

LifeSim v24.2.1 is a stability and usability rebuild of the overloaded v24.2 concept. It keeps the age-aware simulation, saves, relationships, careers, finances and optional local Ollama support, but presents them through a much smaller and more enjoyable interface.

## Start the game

### Windows

Extract the ZIP and double-click **`start_lifesim.bat`**.

### macOS

Double-click **`start_lifesim.command`**. On the first launch, macOS may require right-click → **Open**.

### Linux

Run:

```bash
./start_lifesim.sh
```

The launcher opens LifeSim on a local `127.0.0.1` address. Keep the launcher window open while playing.

## What changed

- One clean Life screen instead of several competing dashboards.
- Four clear, age-appropriate actions each year.
- Only the most relevant navigation sections are shown.
- Advanced systems are optional and live under **More**.
- Events show up to three readable choices without risk dashboards or stat-chip clutter.
- One event at a time prevents chained modal spam and stuck Age Up states.
- Four understandable wellbeing values replace the overloaded stat wall.
- Cleaner desktop and mobile layouts with no decorative overlays covering controls.
- Settings are reduced to **Game, Look, Sound, Local AI and Save**.
- Ollama remains optional and the built-in game works without it.
- Healthy characters cannot die from an arbitrary random roll before age 35.

## Saves and privacy

Saves and settings stay in browser storage unless you export them. Ollama is disabled by default. When enabled, LifeSim only contacts the endpoint entered in Settings; the default is `http://localhost:11434`.

See `V24_2_1_FUN_FIRST.md`, `OLLAMA_SETUP.md`, and `QA_REPORT.md` for more information.
