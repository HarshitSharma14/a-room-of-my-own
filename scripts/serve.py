"""Local preview. Serves only the built static site, never project secrets."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=4173)
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent / 'dist'
if not (root / 'index.html').is_file():
    raise SystemExit('Run npm run build first.')

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(root), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
print(f'Room preview: http://127.0.0.1:{args.port}', flush=True)
server.serve_forever()
