# Ollama Setup for LifeSim v24

Ollama is optional. LifeSim remains fully playable when it is off.

## 1. Start LifeSim with the local launcher

Use:

- Windows: `start_lifesim.bat`
- macOS: `start_lifesim.command`
- Linux: `start_lifesim.sh`

The launcher opens LifeSim through a local address such as `http://127.0.0.1:8765`. It uses Python 3 or Node.js and requires no downloaded package.

The `127.0.0.1` origin is intentional because Ollama allows local browser origins by default.

## 2. Start Ollama

Open the Ollama application or start its local service. The default LifeSim endpoint is:

```text
http://localhost:11434
```

## 3. Install at least one chat model

LifeSim does not force a particular model. In Settings, click **Refresh** and it will list models already installed in Ollama. When no model is selected, LifeSim prefers a smaller non-embedding chat/instruction model where possible.

A smaller model is recommended for faster yearly recaps and story moments. The game does not require a very large model.

## 4. Enable Ollama inside LifeSim

1. Start or continue a life.
2. Open **Settings**.
3. Find **Local AI → Ollama Storyteller**.
4. Turn it on.
5. Click **Refresh**.
6. Select an installed model or keep auto-select.
7. Click **Test connection**.

## Settings

- **Endpoint**: local Ollama address.
- **Installed model**: model used by LifeSim.
- **Creativity**: grounded, balanced or creative.
- **Enhance yearly recaps**: rewrites the built-in recap using the local model.
- **Allow one AI moment per year**: enables an optional contextual event button.

## Privacy and game safety

LifeSim sends a compact summary of the fictional character to the configured endpoint. It does not send browser saves to an online service by default.

AI output is validated and bounded. The deterministic game engine remains responsible for rules, age eligibility and major life outcomes.

## Troubleshooting

### “Ollama is not reachable”

- Confirm Ollama is running.
- Confirm the endpoint is `http://localhost:11434` unless you changed it.
- Use the LifeSim launcher instead of opening `index.html` directly.
- Click Refresh again.

### “No model is installed”

Install a chat model through Ollama, then click Refresh.

### Slow response

Choose a smaller installed model or set Creativity to Grounded.

### The core game still works

Turn Ollama off. All main LifeSim systems continue to work without it.
