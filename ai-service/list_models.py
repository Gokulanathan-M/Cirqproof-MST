import requests
import json
import os

key = os.environ.get("GROQ_API_KEY")
if not key:
    raise SystemExit("GROQ_API_KEY is required")
r = requests.get('https://api.groq.com/openai/v1/models', headers={'Authorization': f'Bearer {key}'})
data = r.json().get('data', [])
for m in data:
    print(m['id'])
