#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then
  exec python3 server.py
elif command -v python >/dev/null 2>&1; then
  exec python server.py
elif command -v node >/dev/null 2>&1; then
  exec node server.js
else
  printf '\nPython 3 or Node.js is required for the local launcher.\n'
  printf 'You can still open index.html directly, but Ollama works best through the launcher.\n\n'
  read -r _
  exit 1
fi
