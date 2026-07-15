#!/usr/bin/env python3
"""Small local launcher for LifeSim. Serves static files without request logs."""
from __future__ import annotations

import http.server
import os
import socket
import sys
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PREFERRED_PORT = 8765


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *_args: object) -> None:
        return

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def available_port(start: int = PREFERRED_PORT) -> int:
    for port in range(start, start + 25):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind((HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError("No free local port found between 8765 and 8789.")


def main() -> int:
    os.chdir(ROOT)
    try:
        port = available_port()
    except RuntimeError as exc:
        print(exc)
        return 1

    server = http.server.ThreadingHTTPServer((HOST, port), QuietHandler)
    url = f"http://127.0.0.1:{port}/index.html"
    print(f"LifeSim v24.2.1 is running locally at {url}")
    print("Keep this window open while playing. Press Ctrl+C to stop.")
    threading.Timer(0.7, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
