from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn

app = FastAPI()

class ReconcileRequest(BaseModel):
    batch: Dict[str, Any]
    evidence: List[Dict[str, Any]]

@app.post("/reconcile")
def reconcile(req: ReconcileRequest):
    batch = req.batch
    evidence = req.evidence
    
    # Strip origin from evidence
    for ev in evidence:
        ev.pop("origin", None)
        
    flags = []
    
    # Group evidence by type
    by_type = {}
    for ev in evidence:
        t = ev.get("type")
        if t not in by_type:
            by_type[t] = []
        by_type[t].append(ev)
        
    def quantity_of(item, keys):
        if not item or "data" not in item:
            return None
        data = item["data"]
        for key in keys:
            if key in data and data[key] is not None:
                try:
                    return float(data[key])
                except (ValueError, TypeError):
                    pass
        return None

    claim = batch.get("claim", {})
    claim_quantity = claim.get("quantity")
    if claim_quantity is not None:
        claim_quantity = float(claim_quantity)
        
    output = by_type.get("processing_log", [None])[0]
    intake = by_type.get("weighbridge", [None])[0]
    downstream = by_type.get("downstream_invoice", [None])[0]
    capacity = by_type.get("capacity", [None])[0]
    
    output_quantity = quantity_of(output, ["outputWeight", "quantity", "weight", "processedWeight"])
    input_quantity = quantity_of(intake, ["weight", "quantity", "inputWeight"])
    downstream_quantity = quantity_of(downstream, ["quantity", "weight"])
    capacity_quantity = quantity_of(capacity, ["capacity", "quantity", "weight"])
    
    claim_unit = str(claim.get("unit", "")).strip().lower()
    if claim_unit:
        for ev in evidence:
            data = ev.get("data", {})
            unit = data.get("unit")
            if unit and str(unit).strip().lower() != claim_unit:
                flags.append({"code": "UNIT_MISMATCH", "detail": f"Evidence {ev.get('eventId')} has different unit."})
                break
                
    if output_quantity is not None and claim_quantity is not None and claim_quantity != output_quantity:
        flags.append({"code": "CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE", "detail": "Claim amount does not match processing log."})
        
    if output_quantity is not None and input_quantity is not None and output_quantity > input_quantity:
        flags.append({"code": "MASS_BALANCE_MISMATCH", "detail": "Output exceeds input."})
        
    if downstream_quantity is not None and claim_quantity is not None and claim_quantity > downstream_quantity:
        flags.append({"code": "CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM", "detail": "Claim exceeds downstream invoice."})
        
    if capacity_quantity is not None and input_quantity is not None and input_quantity > capacity_quantity:
        flags.append({"code": "CAPACITY_EXCEEDED", "detail": "Input exceeds machine capacity."})
        
    missing_evidence = []
    for req_type in ['weighbridge', 'processing_log', 'downstream_invoice']:
        if not by_type.get(req_type):
            missing_evidence.append(req_type)
            
    if missing_evidence:
        flags.append({"code": "MISSING_EVIDENCE", "detail": "Required evidence is missing."})
        
    status = "CONSISTENT"
    if missing_evidence:
        status = "REVIEW"
    if any(f["code"] != "MISSING_EVIDENCE" for f in flags):
        status = "FLAGGED"
        
    from reconciliation.explain import generate_explanation
    llm_result = generate_explanation(
        batch.get("batchId"),
        status,
        flags,
        missing_evidence,
        {"input": input_quantity, "output": output_quantity, "claim": claim_quantity}
    )
        
    return {
        "batchId": batch.get("batchId"),
        "status": status,
        "massBalanceResult": {"input": input_quantity, "output": output_quantity, "claim": claim_quantity},
        "capacityResult": {"capacity": capacity_quantity, "input": input_quantity, "withinCapacity": capacity_quantity is None or input_quantity is None or input_quantity <= capacity_quantity},
        "downstreamMatch": {"quantity": downstream_quantity, "matchesClaim": downstream_quantity == claim_quantity if downstream_quantity is not None else None},
        "flags": flags,
        "missingEvidence": missing_evidence,
        "explanation": llm_result["explanation"],
        "recommendation": llm_result["recommendation"]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
