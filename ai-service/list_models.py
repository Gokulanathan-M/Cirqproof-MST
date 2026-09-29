import requests
import json
import os

key = "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"
r = requests.get('https://api.groq.com/openai/v1/models', headers={'Authorization': f'Bearer {key}'})
data = r.json().get('data', [])
for m in data:
    print(m['id'])
