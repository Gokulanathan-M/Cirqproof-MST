import os
import json
from openai import OpenAI

# Initialize client with Groq API Key
API_KEY = os.environ.get("GROQ_API_KEY")
client = OpenAI(
    api_key=API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

def generate_explanation(batch_id: str, status: str, flags: list, missing: list, mass_balance: dict) -> dict:
    fallback_exp = "Evidence values conflict with the batch claim." if status == "FLAGGED" else "Required evidence is missing." if status == "REVIEW" else "Available evidence is consistent with the batch claim."
    fallback_rec = "Review the flags and supply any missing evidence before verification." if flags else "Proceed to verification review."
    
    try:
        prompt = f"""
You are an AI assistant for CirqProof, a circular-material evidence platform.
Your task is to explain the following reconciliation result to a human auditor.
NEVER use the word "fraud" or "fake". If there are issues, refer to them as "evidence inconsistency".

Batch ID: {batch_id}
Status: {status}
Flags: {json.dumps(flags)}
Missing Evidence: {json.dumps(missing)}
Mass Balance: {json.dumps(mass_balance)}

Provide a JSON response with two keys: "explanation" (a brief summary of the findings) and "recommendation" (next steps for the auditor).
"""
        response = client.chat.completions.create(
            model="qwen/qwen3.8-27b",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs only JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            timeout=10.0
        )
        
        result_str = response.choices[0].message.content
        result = json.loads(result_str)
        return {
            "explanation": result.get("explanation", fallback_exp),
            "recommendation": result.get("recommendation", fallback_rec)
        }
    except Exception as e:
        print(f"LLM generation failed, using fallback: {e}")
        return {
            "explanation": fallback_exp,
            "recommendation": fallback_rec
        }
