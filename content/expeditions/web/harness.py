# Loaded in Pyodide before every activity in the web expedition.
# The runner defines SITE_JSON first: the simulated site as {path: text},
# built from content/expeditions/web/site/.
#
# Provides a fake `requests` module (no real network: browsers block most
# cross-site requests anyway) and helpers that activity checks can use:
#   B          base URL, "https://trailnet.test"
#   LOG        every URL requested during the current run
#   norm(u)    URL without #fragment, with "/" for an empty path
#   short(u)   path only, for friendly messages
# Each activity's check(ns, out) gets the student's namespace and printed
# output, and returns (passed: bool, message: str).

import sys
import types
import json
from urllib.parse import urlparse, urldefrag

SITE = json.loads(SITE_JSON)  # noqa: F821 (defined by the runner)
HOST = "trailnet.test"
B = "https://" + HOST
LOG = []
MAX_REQUESTS = 300


class HTTPError(Exception):
    pass


class Response:
    def __init__(self, url, status_code, text):
        self.url, self.status_code, self.text = url, status_code, text
        self.content = text.encode()
        self.ok = status_code < 400
        self.headers = {"Content-Type": "text/plain" if url.endswith(".txt") else "text/html"}

    def raise_for_status(self):
        if not self.ok:
            raise HTTPError(f"{self.status_code} Client Error: Not Found for url: {self.url}")

    def __repr__(self):
        return f"<Response [{self.status_code}]>"


def get(url, *args, **kwargs):
    if not isinstance(url, str):
        raise TypeError(f"url must be a string, not {type(url).__name__}")
    url, _ = urldefrag(url)
    p = urlparse(url)
    if p.scheme not in ("http", "https"):
        raise ValueError(f"Invalid URL {url!r}: No scheme supplied. Perhaps you meant https://{url}?")
    if p.hostname != HOST:
        raise ConnectionError(f"Can't reach {p.hostname}. This practice sandbox only contains {B}")
    LOG.append(url)
    if len(LOG) > MAX_REQUESTS:
        raise RuntimeError(f"Over {MAX_REQUESTS} requests in one run. Is your crawler visiting the same pages over and over?")
    path = p.path or "/"
    if path in SITE:
        return Response(url, 200, SITE[path])
    return Response(url, 404, "<html><head><title>404</title></head><body><h1>Trail not found</h1></body></html>")


requests_mod = types.ModuleType("requests")
exceptions_mod = types.ModuleType("requests.exceptions")
exceptions_mod.HTTPError = HTTPError
exceptions_mod.ConnectionError = ConnectionError
requests_mod.get = get
requests_mod.Response = Response
requests_mod.HTTPError = HTTPError
requests_mod.exceptions = exceptions_mod
sys.modules["requests"] = requests_mod
sys.modules["requests.exceptions"] = exceptions_mod


def norm(u):
    u, _ = urldefrag(str(u))
    p = urlparse(u)
    return f"{p.scheme}://{p.netloc}{p.path or '/'}"


def short(u):
    return str(u).replace(B, "") or "/"
