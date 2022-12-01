import requests
import json
import os

HOST = os.getenv("HOST", "localhost")
PORT = os.getenv("PORT", 8002)

r = requests.get(f"http://{HOST}:{PORT}/admin")
print(r.text)