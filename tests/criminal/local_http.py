"""Shared loopback HTTP settings for the many-resource mobile acceptance suite."""
from http.server import ThreadingHTTPServer

class LocalServer(ThreadingHTTPServer):
    # Windows and Linux may issue many parallel connections for CSS, script,
    # WebP and fonts. The default backlog of five can refuse valid requests.
    request_queue_size = 128
