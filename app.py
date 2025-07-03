import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "." # Serve files from the current directory where app.py is located

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Ensure correct MIME types for JS and CSS if needed, though SimpleHTTPRequestHandler usually handles this.
        # For .js files, it should be 'application/javascript'
        # For .css files, it should be 'text/css'
        # SimpleHTTPRequestHandler is pretty good at guessing based on file extensions.
        super().do_GET()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving HTTP on port {PORT} from directory '{os.path.abspath(DIRECTORY)}'")
    print(f"Open http://localhost:{PORT}/index.html in your browser.")
    httpd.serve_forever()
