# CirqProof — Implementation Plan v2 (Simulation-Only, 4-Person Team, 24 Hours)

**Supersedes:** `IMPLEMENTATION_PLAN.md` (IoT/NEWRRO version).

**Core principle:** The Simulator behaves like a real recycling plant. Nothing below the Evidence Engine knows or cares whether data came from a simulator or hardware.

**MVP loop:**
`Simulator → Evidence Engine → AI Reconciliation → Human Verification → MST Attestation → Challenge → Escrow Settlement`

**Merge-safety rule (unchanged):** every file/folder has exactly **one owner**. Nobody edits a file they don't own. Teammates integrate only through **frozen interfaces** (§4) and **mocks**.

---

## 0. What Changed vs Plan v1

| Area | v1 (IoT) | v2 (Simulation-only) |
|---|---|---|
| Physical layer | NEWRRO/ESP32 + simulator | **Simulator only**; hardware is a roadmap slide, zero code |
| Ingestion endpoint | `POST /api/iot/events` | `POST /api/simulation/events` |
| Simulator | Simple sensor loop | **Virtual plant**: 7 generators + 3 scenario modes |
| Scenarios | 2 sample batches | **NORMAL / INCONSISTENT / TAMPERED** |
| Frontend | No simulator UI | **Simulator Control Panel** page (judge-facing) |
| Pipeline | Separate IoT path | **One path**: Simulation → Adapter → Common Evidence Interface → everything else |
| Tamper detection | Not covered | Evidence integrity check (hash vs committed root) + claim-vs-committed-evidence rule |
| Contract | Attest/challenge/settle | Adds `recordAiResult` (anchors AI completion) and **resolve → release OR refund** |
| Removed | `iot.*` files, `IotEvent` model | Replaced by `simulation.*` files, `SimulationRun` model |

---

## 1. Team Roles at a Glance

| Member | Role | Owns |
|---|---|---|
| **P1** | Blockchain & Settlement | `contracts/`, `backend/services/{blockchain,settlement}/`, chain routes/controllers/models, `frontend/src/chain/`, `shared/abi/`, `shared/api/chain.md` |
| **P2** | Backend Core & Evidence Engine (integration lead) | `backend/` core (auth, batch, evidence, AI client), scaffold, `shared/enums.json`, `shared/api/core.md`, `shared/api/evidence-event.md`, merges to `develop` |
| **P3** | Simulator & AI Reconciliation | `backend/services/simulation/`, `simulation.routes.js`, `simulator/`, `ai-service/`, `shared/api/ai.md`, `shared/api/simulation.md`, `shared/scenarios/` |
| **P4** | Frontend & Demo | `frontend/` (except `src/chain/`), `docs/`, `README.md` |

---

## 2. Repository Layout with Owners

```
cirqproof/
├── .github/
│   ├── CODEOWNERS                          # P2 (scaffold, then frozen)
│   └── pull_request_template.md            # P2
├── shared/                                 # FROZEN CONTRACTS (§4)
│   ├── enums.json                          # P2 (frozen after H1)
│   ├── api/
│   │   ├── core.md                         # P2  auth/batch/evidence endpoints + example JSON
│   │   ├── evidence-event.md               # P2  Common Evidence Interface
│   │   ├── simulation.md                   # P3  simulation endpoints + SimulationEvent
│   │   ├── ai.md                           # P3  AI service contract
│   │   └── chain.md                        # P1  contract signatures + chain endpoints
│   ├── scenarios/                          # P3  NORMAL / INCONSISTENT / TAMPERED fixtures + expected AI outcome
│   │   ├── normal.json
│   │   ├── inconsistent.json
│   │   └── tampered.json
│   └── abi/                                # P1  generated on deploy
│       ├── CirqProofRegistry.json
│       ├── CirqProofSettlement.json
│       └── addresses.testnet.json
│
├── contracts/                              # P1 (own package.json, hardhat)
│   ├── CirqProofRegistry.sol
│   ├── CirqProofSettlement.sol
│   ├── scripts/deploy.js
│   └── test/
│
├── backend/
│   ├── package.json                        # P2 ONLY (all deps pre-installed in scaffold)
│   ├── server.js                           # P2 (frozen after scaffold)
│   ├── routes/
│   │   ├── index.js                        # auto-mounts *.routes.js  (P2, frozen)
│   │   ├── auth.routes.js                  # P2
│   │   ├── batch.routes.js                 # P2
│   │   ├── evidence.routes.js              # P2
│   │   ├── ai.routes.js                    # P2
│   │   ├── simulation.routes.js            # P3
│   │   ├── attestation.routes.js           # P1
│   │   ├── challenge.routes.js             # P1
│   │   ├── settlement.routes.js            # P1
│   │   └── blockchain.routes.js            # P1
│   ├── controllers/                        # same owner as the matching route file
│   ├── middleware/                         # P2 (auth, rbac, upload, error)
│   ├── models/
│   │   ├── User, Organization, Batch, Evidence, AiReport     # P2
│   │   ├── Attestation, Challenge, Settlement                # P1
│   │   └── SimulationRun                                     # P3
│   ├── scripts/seed.js                     # P2
│   └── services/
│       ├── evidence/                       # P2  ingest.js, normalize.js, hash.js, merkle.js, storage.js, integrity.js
│       ├── batch/batch.service.js          # P2  helpers used by P1 & P3
│       ├── ai/aiClient.js                  # P2  calls P3's FastAPI
│       ├── simulation/                     # P3  see below
│       │   ├── generators/                 #     batch, weight, processing, recovery, telemetry, downstream
│       │   ├── scenarios.js                #     NORMAL / INCONSISTENT / TAMPERED
│       │   ├── adapter.js                  #     SimulationEvent → EvidenceEvent[]
│       │   └── simulation.service.js
│       ├── blockchain/                     # P1
│       └── settlement/                     # P1
│
├── ai-service/                             # P3 (own requirements.txt)
│   ├── main.py
│   ├── extraction/  rules/  reconciliation/  anomaly/
│   └── requirements.txt
├── simulator/                              # P3  CLI wrapper + demo runner scripts
│   └── cli.js
│
├── frontend/
│   ├── package.json                        # P4 ONLY
│   └── src/
│       ├── pages/                          # P4 (one file per page)
│       ├── components/                     # P4
│       ├── hooks/                          # P4
│       ├── services/                       # P4 (api.js, per-domain files, mock/)
│       └── chain/                          # P1 (wallet + contract hooks)
├── docs/                                   # P4
└── README.md                               # P4
```

### Why this can't conflict
- One author per file. `routes/index.js` auto-mounts routes, so no shared router edits.
- Each package has its own manifest. **All backend deps are pre-installed in the scaffold**, so P1/P3 never touch `backend/package.json` (ask P2 for one-line dep PRs).
- `.env.example` is per-package: `backend/` (P2), `contracts/` (P1), `ai-service/` (P3), `frontend/` (P4).
- Lockfiles committed only by the folder owner.
- Shared docs are split into **one file per owner** inside `shared/api/`.

---

## 3. Git Workflow

```
main       ← protected, demo-ready only (P2 merges)
develop    ← integration branch (P2 merges PRs)
feature/p1-*  feature/p2-*  feature/p3-*  feature/p4-*
```

1. Branch from `develop` using your prefix (`feature/p3-tamper-scenario`).
2. PRs touch **only owned paths**; CODEOWNERS enforces this.
3. Small PRs, merged at least every ~2 hours. Big-bang merges cause conflicts.
4. `git fetch && git rebase origin/develop` before opening a PR. Squash-merge. No force-push to `develop`/`main`.
5. Commit format: `feat(p3): tampered scenario generator`, `fix(p2): merkle odd-leaf handling`.
6. Need a change in someone else's file? Open an Issue tagged with the owner. Never edit it yourself.
7. Frozen files (`shared/enums.json`, `server.js`, `routes/index.js`, `CODEOWNERS`) change only by agreement of all four, in a PR that touches nothing else.

**Merge order at every checkpoint:** `P1 → P3 → P2 → P4`

---

## 4. Frozen Interfaces (agree in Hour 0–1)

### 4.1 Enums — `shared/enums.json`
```json
{
  "batchStatus": ["CREATED","EVIDENCE_COMMITTED","AI_ANALYZED","ATTESTED","VERIFIED","CHALLENGED","UNDER_REVIEW","RESOLVED","SETTLED"],
  "aiResult": ["CONSISTENT","FLAGGED","REVIEW"],
  "flagCodes": ["MASS_BALANCE_MISMATCH","CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM","CAPACITY_EXCEEDED",
                "CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE","EVIDENCE_HASH_MISMATCH","MISSING_EVIDENCE","UNIT_MISMATCH"],
  "scenario": ["NORMAL","INCONSISTENT","TAMPERED"],
  "challengeStatus": ["NONE","CHALLENGED","UNDER_REVIEW","RESOLVED"],
  "settlementStatus": ["PENDING","VERIFIED","HELD","RELEASED","REFUNDED"],
  "roles": ["PRODUCER","RECYCLER","AUDITOR","BUYER","ADMIN"],
  "evidenceTypes": ["weighbridge","intake_invoice","processing_log","output_record","downstream_invoice","capacity","telemetry"],
  "evidenceOrigin": ["upload","simulation"]
}
```

### 4.2 Common Evidence Interface — `shared/api/evidence-event.md` (P2 owns, P3 produces)
This is the **single** input the Evidence Engine accepts, regardless of source.
```json
{
  "eventId": "uuid",
  "batchId": "CP-2026-001",
  "type": "weighbridge",
  "timestamp": "2026-09-28T12:00:00Z",
  "source": "Recycler-A",
  "origin": "simulation",
  "data": { "weight": 1000, "unit": "kg" },
  "file": { "name": "weighbridge.json", "mime": "application/json", "contentBase64": "..." }
}
```
P2 exports `evidence.service.ingest(evidenceEvent)` → validate → normalize → SHA-256 → store off-chain → attach to batch → recompute Merkle root. Manual uploads and simulator events go through this **same function**.

> **Rule:** `origin` is stored by P2 for audit but is **stripped before calling the AI service**. The AI must never branch on "this is simulated."

### 4.3 Simulation API & event — `shared/api/simulation.md` (P3)
```
POST /api/simulation/generate      { batchId, material, inputWeight, processedWeight, recoveredWeight,
                                     downstreamWeight, machineRuntime, energyUsed, scenario }
                                   → generates full event set, pushes through adapter → ingest()
POST /api/simulation/events        single SimulationEvent (as below) → adapter → ingest()
POST /api/simulation/tamper/:batchId   (TAMPERED mode; guarded by SIMULATION_ENABLED=true)
GET  /api/simulation/scenarios     default parameter sets for the control panel
GET  /api/simulation/events/:batchId   generated events for display
```
SimulationEvent:
```json
{ "batchId":"CP-001","timestamp":"2026-09-28T12:00:00Z",
  "inputWeight":1000,"processedWeight":950,"recoveredWeight":680,"residueWeight":270,
  "machineRuntime":182,"energyUsed":31.8,"temperature":42.1,"status":"COMPLETED" }
```
**Adapter mapping (P3, `adapter.js`):**
| SimulationEvent fields | → EvidenceEvent type |
|---|---|
| `inputWeight` | `weighbridge` |
| `processedWeight`, `machineRuntime`, `energyUsed`, `temperature` | `processing_log` |
| `recoveredWeight`, `residueWeight` | `output_record` |
| downstream generator (buyer, weight, amount) | `downstream_invoice` |
| `machineRuntime`, `energyUsed`, `temperature`, `status` | `telemetry` |

### 4.4 Scenarios — `shared/scenarios/*.json` (P3; used by P3 tests, P4 mocks, P1/P2 for demos)
| Scenario | Input | Processed | Claimed recovered | Recovered evidence | Downstream | Expected |
|---|---|---|---|---|---|---|
| NORMAL | 1000 | 950 | 680 | 680 | 675 | `CONSISTENT` |
| INCONSISTENT | 1000 | 950 | 900 | 900 | 680 | `FLAGGED` → `CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM` |
| TAMPERED | 1000 | committed 950 | claim.processed = 1200 | committed 950; stored record later altered | 675 | `FLAGGED` → `CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE` + `EVIDENCE_HASH_MISMATCH` |

### 4.5 AI contract — `shared/api/ai.md` (P3 ⇄ P2)
```
POST /reconcile
{
  "batchId":"CP-001",
  "claim":{ "material":"E-Waste","inputWeight":1000,"processedWeight":950,"recoveredWeight":680,"unit":"kg" },
  "evidence":[ { "type":"weighbridge","data":{...},"fileHash":"..." } ],
  "committedEvidenceRoot":"0x...",
  "integrity":{ "allHashesMatch":true,"mismatchedEvidenceIds":[] }
}
→ {
  "batchId":"CP-001","status":"CONSISTENT|FLAGGED|REVIEW",
  "massBalanceResult":{...},"capacityResult":{...},"downstreamMatch":{...},
  "flags":[{ "code":"CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM","detail":"..." }],
  "missingEvidence":[],
  "explanation":"Uses 'evidence inconsistency', never 'fraud'.",
  "recommendation":"Proceed to human verification"
}
```
No `iot` key — telemetry is just an evidence type. Also `/document-extract`, `/anomaly-check`, `/generate-report`.

### 4.6 Contract interface — `shared/api/chain.md` (P1)
```
Registry:
  registerParticipant(address, string role)
  createBatch(bytes32 batchIdHash)
  commitEvidence(bytes32 batchIdHash, bytes32 evidenceRoot)
  recordAiResult(bytes32 batchIdHash, uint8 aiResult, bytes32 reportHash)   // AI_RECONCILIATION_COMPLETED
  submitAttestation(bytes32 batchIdHash, uint256 inputWeight, uint256 recoveredWeight, bytes32 evidenceRoot, uint8 aiResult)
  verifyAttestation(bytes32 batchIdHash)
  challengeAttestation(bytes32 batchIdHash, string reason)
  resolveChallenge(bytes32 batchIdHash, bool upheld)     // upheld => refund path, else release path
Settlement:
  deposit(bytes32 batchIdHash, address payee) payable
  release(bytes32 batchIdHash)    // requires VERIFIED or RESOLVED(not upheld)
  hold(bytes32 batchIdHash)       // on CHALLENGED
  refund(bytes32 batchIdHash)     // requires RESOLVED(upheld)
```
`batchIdHash = keccak256(batchId)`. Events emitted for every transition. ABIs + testnet addresses published to `shared/abi/`.

### 4.7 Cross-owner helpers (import only, never edit)
P2 exports from `backend/services/batch/batch.service.js`:
```
createBatch(params)            getBatch(batchId)
setBatchStatus(batchId, s)     setChainRefs(batchId, { txHash, attestationId })
getEvidenceRoot(batchId)       getLatestAiReport(batchId)
```
P2 exports from `backend/services/evidence/`:
```
ingest(evidenceEvent)
verifyIntegrity(batchId)                       → { allHashesMatch, mismatchedEvidenceIds }
overwriteEvidenceForSimulation(evidenceId, newData)   // dev-only, requires SIMULATION_ENABLED=true (used by TAMPERED)
```
Until P2 ships these, P1 and P3 use local stubs in their own folders (`_stubs.js`), deleted at integration.

---

## 5. Task Breakdown

### P1 — Blockchain & Settlement
| # | Task | Output |
|---|---|---|
| 1.1 | Hardhat project, MST Testnet config, `.env.example` | Local compile + deploy |
| 1.2 | `CirqProofRegistry.sol`: participants, batches, evidence commitment, `recordAiResult`, attestation, verify, challenge, resolve, events for every transition | Tests pass |
| 1.3 | `CirqProofSettlement.sol`: deposit → VERIFIED→release / CHALLENGED→hold / RESOLVED→release or refund | Tests for all three paths |
| 1.4 | `deploy.js` writes ABIs + addresses into `shared/abi/` | **Testnet addresses** (target H8–10) |
| 1.5 | Blockchain service (ethers, tx manager, event listener, retry) + server-signed fallback | `services/blockchain/` |
| 1.6 | Routes/controllers: attestations, challenges (+resolve), settlements, blockchain anchor/status | Real tx hashes |
| 1.7 | Models `Attestation`, `Challenge`, `Settlement` | Schemas |
| 1.8 | `frontend/src/chain/`: BridgeKey connect, network switch, `useAttest`, `useVerify`, `useChallenge`, `useResolve`, `useDeposit`, `useRelease` | Hooks for P4 |
| 1.9 | Fund all team wallets; record demo tx hashes | Screenshot list |

**Done when:** normal path (attest → verify → release) **and** challenge path (attest → challenge → hold → resolve → release/refund) both work on MST Testnet.

### P2 — Backend Core & Evidence Engine (integration lead)
**First 45 min:** scaffold repo (folders, CODEOWNERS, PR template, `server.js`, auto-loader, pre-installed deps, Mongo connection, `enums.json`, `core.md` + `evidence-event.md` with full example JSON), push to `develop`, enable branch protection.

| # | Task | Output |
|---|---|---|
| 2.1 | Auth (JWT), RBAC middleware, org ↔ wallet mapping | `middleware/` |
| 2.2 | Models: User, Organization, Batch (incl. `claim`), Evidence, AiReport | Schemas |
| 2.3 | Batch API + status machine; `batch.service.js` helpers (§4.7) | Endpoints |
| 2.4 | **Evidence Engine** `ingest()` (validate → normalize → SHA-256 → off-chain store) used by uploads **and** simulator | `services/evidence/` |
| 2.5 | Manual upload route (multer) that wraps events and calls `ingest()` | `evidence.routes.js` |
| 2.6 | Merkle root + `verifyIntegrity()` (recompute hashes vs stored/committed root) + dev-only tamper helper | + unit tests |
| 2.7 | `aiClient.js` (strips `origin`, adds `committedEvidenceRoot` + `integrity`), `AI_MOCK=true` fallback, `ai.routes.js` (`/reconcile`, `/report/:batchId`) | Saves `AiReport`, sets batch status |
| 2.8 | `GET /api/evidence/:batchId/integrity` | Tamper proof for UI |
| 2.9 | Seed script: Dell (producer), Recycler-A, Auditor-B, Buyer + wallets | `scripts/seed.js` |
| 2.10 | Integration owner: run checkpoints, route bugs to file owners, merge `develop → main` | Green `develop` |
| 2.11 | Backend deployment | Public API URL |

### P3 — Simulator & AI Reconciliation
| # | Task | Output |
|---|---|---|
| 3.1 | Write `shared/scenarios/*.json` **first (Hour 0–1)** — unblocks everyone | Fixtures + expected outcomes |
| 3.2 | Virtual plant generators: batch, weight, processing, recovery, machine telemetry, downstream transaction (seeded randomness, small realistic noise) | `services/simulation/generators/` |
| 3.3 | `scenarios.js`: NORMAL, INCONSISTENT, TAMPERED | Deterministic outputs |
| 3.4 | `adapter.js`: SimulationEvent → `EvidenceEvent[]` (§4.3) → calls P2's `ingest()` | One pipeline only |
| 3.5 | Simulation routes: `generate`, `events`, `tamper/:batchId`, `scenarios`, `events/:batchId`; `SimulationRun` model | Endpoints |
| 3.6 | CLI `simulator/cli.js` (`node cli.js --scenario TAMPERED --batch CP-001`) for backup demo | Runs without UI |
| 3.7 | FastAPI `/reconcile` per §4.5 | Service on `:8000` |
| 3.8 | Deterministic rule engine: unit normalisation, mass balance, capacity, cross-source diff, downstream match, **claim vs committed evidence**, **hash-integrity flag** | pytest per rule |
| 3.9 | Anomaly checker (threshold/z-score vs prior batches) | `anomaly/` |
| 3.10 | LLM explanation layer: rules compute, LLM only explains; prompt forbids "fraud" (use "evidence inconsistency"); template fallback if API fails | `reconciliation/explain.py` |
| 3.11 | `/document-extract` (JSON/CSV parse first, LLM fallback for PDFs) | `extraction/` |
| 3.12 | Test that each scenario fixture yields its expected status/flags; AI service deployment | Green tests, public URL |

> If P3 is overloaded at H6, hand `3.6` (CLI) and `3.11` (extraction) to whoever is free; ownership transfer is announced in the group chat and the file header comment updated.

### P4 — Frontend & Demo
| # | Task | Output |
|---|---|---|
| 4.1 | Vite + React + Tailwind + Recharts, routing, role-aware layout | App shell |
| 4.2 | `services/api.js` with `VITE_USE_MOCK=true`; `services/mock/` built from `core.md`, `simulation.md`, `scenarios/` | UI runs with no backend |
| 4.3 | Pages: Login, Dashboard, CreateBatch, BatchDetails, Verification (judge screen), Challenges, Settlements, Blockchain (tx history) | One file per page |
| 4.4 | **Simulator Control Panel** page: material, input/processing/recovery/downstream weights, runtime, energy, scenario radio (Normal / Inconsistent / Tampered), **[Generate Batch]** | Calls `/api/simulation/generate` |
| 4.5 | Components: EvidenceList (with hash + integrity ✓/⚠), AiReportCard (flags + explanation), StatusTimeline, TxHashLink, ChallengeModal, ScenarioBadge | `components/` |
| 4.6 | Wire P1's `src/chain/` hooks into Verification / Challenge / Settlement | Wallet flows |
| 4.7 | Demo script (§8), PPT architecture diagram, roadmap slide (future hardware), README, backup screen recording | `docs/`, `README.md` |
| 4.8 | Frontend deployment | Public URL |

---

## 6. Timeline (24 Hours)

| Hours | Work | Gate |
|---|---|---|
| **0–1** | P2 pushes scaffold. P3 pushes `scenarios/*.json` + `simulation.md` + `ai.md`. P1 pushes `chain.md` signatures. P2 pushes `core.md` + `evidence-event.md`. All four review `shared/` | **Gate 0:** `shared/` frozen |
| **1–7** | Parallel build in own folders with mocks/stubs; merge small PRs to `develop` every ~2h | |
| **7–8** | **Checkpoint 1** (order P1 → P3 → P2 → P4): simulator → adapter → `ingest()` → AI mock works locally | Evidence flows end to end |
| **8–14** | P1 deploys to Testnet (target H10) + chain routes/hooks; P3 finishes rules/LLM/tamper; P2 AI client, integrity, seed; P4 switches from mocks to real API, builds Simulator Panel | |
| **14–15** | **Checkpoint 2:** NORMAL scenario → AI → attest → verify → release on Testnet | Demo 1 works |
| **15–20** | INCONSISTENT + TAMPERED flows, challenge/hold/resolve, polish, deployments | **Checkpoint 3 (H20):** all three demos work |
| **20–22** | Feature freeze; bug-fix PRs only; rehearse demo twice | |
| **22–23** | P2 merges `develop → main`, tags `v1.0` | Final |
| **23–24** | README, recording, PPT, submission (repo, live URL, contract addresses, tx hashes) | Submit |

**Cut order if behind at H14:** PDF report → QR → live charts → multiple materials → advanced anomaly detection.
**Never cut:** simulator control panel, attestation tx, challenge tx, hold/release, Testnet deployment.

---

## 7. Integration Checklist (each checkpoint)

1. `git checkout develop && git pull`; install in `backend/`, `frontend/`, `contracts/`; `pip install -r ai-service/requirements.txt`.
2. Start Mongo → `ai-service` (`:8000`) → `backend` (`:5000`, `SIMULATION_ENABLED=true`) → `frontend` (`:5173`).
3. Set `AI_MOCK=false`, `VITE_USE_MOCK=false`.
4. Seed → Simulator Panel → **NORMAL** → AI `CONSISTENT` → attest → auditor verify → deposit → release.
5. **INCONSISTENT** → `FLAGGED` → challenge → settlement `HELD`.
6. **TAMPERED** → tamper endpoint → integrity check shows hash mismatch + claim-vs-committed flag.
7. Any failure is filed to the **file owner**, not fixed by the finder.

---

## 8. Demo Script (owners in brackets)

**Demo 1 — Valid operation**
1. Open Simulator Panel, pick **Normal**, click Generate Batch **[P4 UI / P3 API]**
2. Evidence appears with hashes; evidence root created **[P2]**
3. AI: `✓ CONSISTENT` **[P3]**
4. Recycler submits attestation → MST tx hash **[P1]**
5. Auditor approves → escrow deposit → **RELEASED** **[P1 + P4]**

**Demo 2 — Attack the system (Inconsistent)**
6. Generate **Inconsistent** batch: claim 900 kg vs downstream 680 kg **[P3]**
7. AI: `⚠ EVIDENCE INCONSISTENCY` **[P3]**
8. Auditor **Challenges** → MST challenge tx → settlement **HELD** **[P1]**
9. Recycler submits corrected evidence → resolve → **RELEASED** or **REFUNDED** **[P1]**

**Demo 3 — Tampered (bonus)**
10. Generate **Tampered** batch: committed processing record 950 kg, claim 1,200 kg, stored record altered after commit **[P3 + P2]**
11. Integrity check: `EVIDENCE_HASH_MISMATCH`; AI: `CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE` → `⚠ CONFLICT DETECTED` **[P2 + P3]**

**Narration:** *"Raw evidence stays off-chain. MST holds the evidence root, attestation, challenge state and settlement. The simulator is just a data source — swap it for real plant integrations and nothing downstream changes."*

**Roadmap slide (P4):** future NEWRRO/ESP32 or plant-system integration plugs in as a new adapter that emits the same Evidence Event.

---

## 9. Risks and Fallbacks

| Risk | Mitigation |
|---|---|
| MST Testnet slow/unavailable | P1 keeps a local Hardhat demo + pre-recorded tx hashes/screenshots |
| LLM API failure | Template explanation fallback; rule engine is fully deterministic |
| BridgeKey wallet trouble | Server-signed `POST /api/blockchain/anchor` fallback (P1) |
| Backend not ready for UI | P4 runs on mocks (`VITE_USE_MOCK=true`) |
| Simulator endpoint breaks live | `simulator/cli.js` runs the same scenarios headlessly |
| Judges suspect "fake" data | Explain the adapter design; show the same `ingest()` path handles manual uploads too |
| Missing backend dep | One-line PR request to P2; never edit `package.json` yourself |
| Merge conflict anyway | Owner of the path wins; other person drops the change and files an issue |

---

## 10. PR Checklist (`.github/pull_request_template.md`)

- [ ] Only files under my owned paths changed
- [ ] Rebased on latest `develop`
- [ ] No changes to `shared/` (or change agreed by all four)
- [ ] Runs locally; my tests pass (scenario fixtures still produce expected results, if P3)
- [ ] No secrets or `.env` committed
