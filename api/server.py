import json
import os
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

from .scraper import scrape_profile_url


DEFAULT_PORT = 3001
PUBLIC_PROFILE_PREFIX = "https://www.skills.google/public_profiles/"


class ArcadeTrackerHandler(BaseHTTPRequestHandler):
    server_version = "ArcadeTrackerPythonAPI/0.1.1"

    def do_GET(self) -> None:
        parsed_url = urlparse(self.path)

        if parsed_url.path == "/api/health":
            self._send_json(
                HTTPStatus.OK,
                {
                    "status": "ok",
                    "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                    "runtime": "python",
                    "parser": "lxml",
                },
            )
            return

        if parsed_url.path == "/api/scrape":
            query = parse_qs(parsed_url.query)
            profile_url = (query.get("url") or [""])[0]
            if not profile_url.startswith(PUBLIC_PROFILE_PREFIX):
                self._send_json(HTTPStatus.BAD_REQUEST, {"error": "URL profil publik Skills Google tidak valid."})
                return

            try:
                self._send_json(HTTPStatus.OK, scrape_profile_url(profile_url))
            except Exception as error:
                print(f"Scrape error: {error}", flush=True)
                self._send_json(HTTPStatus.BAD_GATEWAY, {"error": format_scrape_error(error)})
            return

        self._send_json(HTTPStatus.NOT_FOUND, {"error": "Endpoint tidak ditemukan."})

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self._send_cors_headers()
        self.end_headers()

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.address_string()} - {format % args}", flush=True)

    def _send_json(self, status: HTTPStatus, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_cors_headers(self) -> None:
        allowed_origin = os.environ.get("ALLOWED_ORIGIN", "*").strip() or "*"
        self.send_header("Access-Control-Allow-Origin", allowed_origin)
        if allowed_origin != "*":
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")


def format_scrape_error(error: Exception) -> str:
    message = str(error) or "Scrape gagal."
    if "No module named" in message and ("httpx" in message or "lxml" in message):
        return "Dependency httpx/lxml belum terpasang. Jalankan uv sync, lalu ulangi server API."
    return message


def main() -> None:
    port = int(os.environ.get("PORT", DEFAULT_PORT))
    server = ThreadingHTTPServer(("0.0.0.0", port), ArcadeTrackerHandler)
    print(f"Arcade Tracker Python API siap di http://localhost:{port}", flush=True)
    print("CORS enabled for all origins.", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
