# ♻️ CirqProof

### Verify the Claim. Prove the Evidence. Settle with Confidence.

> **AI-Assisted Recycling Verification × Cryptographic Evidence
> Integrity × MST Blockchain Settlement**

------------------------------------------------------------------------

## 🌍 What is CirqProof?

**CirqProof** is an evidence-backed verification and settlement platform
for recycling operations.

Recycling claims depend on fragmented evidence such as weighbridge
records, processing logs, recovery records, downstream transfers,
telemetry and operational documents.

The core problem is:

> **How can stakeholders determine whether a recycling claim is
> supported by consistent evidence, whether that evidence was altered,
> and whether the claim should proceed to verification and settlement?**

CirqProof connects:

``` text
CLAIM
  ↓
EVIDENCE
  ↓
INTEGRITY CHECK
  ↓
AI / RULE RECONCILIATION
  ↓
HUMAN VERIFICATION
  ↓
MST ATTESTATION
  ↓
CHALLENGE / RESOLUTION
  ↓
ESCROW SETTLEMENT
```

------------------------------------------------------------------------

## 🎯 The Problem

A recycling claim may contain values such as:

``` text
Input       → 1,200 kg
Processed   → 1,170 kg
Recovered   →   900 kg
Downstream  →   870 kg
```

But the supporting evidence may exist across different records and
systems.

CirqProof asks:

1.  Does the evidence support the claim?
2.  Was any evidence modified after commitment?
3.  Can a verifier inspect the important proof?
4.  Should the claim be attested?
5.  Should settlement be released?
6.  What happens when a stakeholder challenges the claim?

**CirqProof addresses this trust and verification layer.**

------------------------------------------------------------------------

## 💡 Hybrid On-Chain + Off-Chain Architecture

### 🟦 Off-chain

Heavy operational data remains off-chain:

-   Raw evidence
-   Detailed telemetry
-   Simulation data
-   AI analysis
-   Reports
-   Application/database records

### 🟩 On-chain --- MST

Important proof and state transitions are anchored on MST:

-   Evidence commitments
-   AI result/report commitment
-   Attestation
-   Verification state
-   Challenge state
-   Settlement transactions

> **Efficient off-chain processing + publicly verifiable on-chain
> proof.**

------------------------------------------------------------------------

# 🔐 Three Trust Checks

### 1. Evidence Integrity

**Was the committed evidence changed?**

``` text
Current Evidence
      ↓
Recalculate Hashes
      ↓
Evidence Root
      ↓
Compare with Committed Root
      ↓
PASS / HASH MISMATCH
```

### 2. Reconciliation

**Does the evidence make sense?**

Deterministic rules evaluate relationships such as:

``` text
downstream ≤ recovered ≤ processed ≤ input
```

AI provides a human-readable explanation of the result.

> AI flags evidence inconsistencies; it does not independently declare
> fraud.

### 3. Human Verification

**Should this claim be attested?**

A verifier remains part of the final trust process.

------------------------------------------------------------------------

# 🧪 Three Demonstration Scenarios

  Scenario              Integrity   Reconciliation   Attestation
  --------------------- ----------- ---------------- -------------
  🟢 **NORMAL**         ✅ PASS     ✅ CONSISTENT    Allowed
  🟠 **INCONSISTENT**   ✅ PASS     ⚠️ FLAGGED       Blocked
  🔴 **TAMPERED**       ❌ FAILED   ⚠️ Review/Flag   Blocked

### 🟢 NORMAL

Randomized values are generated while maintaining valid relationships.

``` text
Valid Evidence
      ↓
Integrity PASS
      ↓
AI CONSISTENT
      ↓
Human Verification
      ↓
MST Attestation
      ↓
Settlement
```

### 🟠 INCONSISTENT

Randomized evidence contains a deliberate logical violation.

``` text
Evidence intact
      ↓
Integrity PASS
      ↓
AI FLAGGED
      ↓
Attestation BLOCKED
```

### 🔴 TAMPERED

Valid evidence is committed and then modified.

``` text
Valid Evidence
      ↓
Commit Evidence Root
      ↓
Modify Evidence
      ↓
Recalculate Hash
      ↓
HASH MISMATCH
      ↓
Attestation BLOCKED
```

------------------------------------------------------------------------

# ⛓️ MST Blockchain Integration

MST is the **trust and settlement layer** of CirqProof, not simply a
wallet connection or isolated transaction.

## 🟢 Registry Contract

**`CirqProofRegistry.sol`**

``` text
0xFE9236E0A273c00C901D70A9C7D347f2A5d56633
```

Handles the verification lifecycle:

-   Participant registration
-   Batch commitments
-   Evidence commitments
-   AI result recording
-   Attestation
-   Verification
-   Challenges
-   Resolution

## 🟡 Settlement Contract

**`CirqProofSettlement.sol`**

``` text
0xade8B1Caa033Cf637fC52c5746798D58cAdcb372
```

Handles:

-   Escrow deposit
-   Settlement release
-   Hold
-   Refund

> These are the documented MST Testnet contract addresses for the
> current deployment. Check `shared/abi/addresses.testnet.json` for the
> project's deployment configuration.

------------------------------------------------------------------------

# 🧾 What Goes On-Chain?

CirqProof does **not** store the complete recycling dataset on-chain.

Detailed data can remain in MongoDB:

``` json
{
  "inputWeight": 1200,
  "processedWeight": 1170,
  "recoveredWeight": 900,
  "downstreamWeight": 870,
  "machineRuntime": 245,
  "energyUsed": 38.7
}
```

The Evidence Engine generates a cryptographic commitment:

``` text
Evidence Root
0xc648181df3...09bf24d6
```

That commitment can be anchored through the Registry contract.

This allows the system to later determine whether the current evidence
still corresponds to the evidence that was committed.

------------------------------------------------------------------------

# 🔄 End-to-End Workflow

``` text
1. Create Batch
        ↓
2. Generate / Ingest Evidence
        ↓
3. Hash Evidence
        ↓
4. Build Evidence Root
        ↓
5. AI + Rule Reconciliation
        ↓
6. Integrity Verification
        ↓
7. Human Verification
        ↓
8. MST Attestation
        ↓
9. Challenge / Resolution
        ↓
10. Escrow Settlement
```

------------------------------------------------------------------------

# 🤖 AI + Blockchain Separation

  Component         Responsibility
  ----------------- -------------------------------------
  Simulator / IoT   Generate operational events
  Evidence Engine   Normalize + hash evidence
  Rules Engine      Deterministic consistency checks
  AI                Explain inconsistencies
  Human             Final verification / challenge
  MST               Immutable proof + state transitions
  MongoDB           Operational application data

> **AI determines whether evidence appears consistent. Blockchain proves
> what was committed and what state transitions were recorded.**

Blockchain does not physically prove that a recycling operation
happened. It provides integrity and provenance for the evidence
commitments and recorded verification state.

------------------------------------------------------------------------

# 🏗️ Architecture

``` text
                         CIRQPROOF
                             │
             ┌───────────────┴───────────────┐
             │                               │
        OFF-CHAIN                         ON-CHAIN
             │                               │
      ┌──────┴──────┐                 ┌──────┴──────┐
      │             │                 │             │
   MongoDB       AI/Rules          Registry     Settlement
      │             │              Contract       Contract
      │             │                 │             │
 Raw Evidence  Reconciliation      Evidence      Escrow
 Telemetry     Explanation         Attestation    Release
 Reports       Integrity           Challenge      Hold/Refund
      │             │                 │             │
      └─────────────┴─────────────────┴─────────────┘
                             │
                       MST Testnet
```

------------------------------------------------------------------------

# 🧰 Technology Stack

### Frontend

-   React
-   Vite
-   TypeScript
-   Tailwind CSS
-   Framer Motion
-   Lucide
-   Recharts

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT

### AI / Reconciliation

-   Python
-   FastAPI
-   Deterministic rule engine
-   LLM-assisted explanations

### Blockchain

-   MST Testnet
-   Solidity
-   Hardhat
-   ethers.js
-   MSTScan

### Simulation

-   Virtual recycling-plant simulator
-   Correlated randomized telemetry
-   NORMAL / INCONSISTENT / TAMPERED scenarios

------------------------------------------------------------------------

# 📁 Project Structure

``` text
cirqproof/
├── contracts/
│   ├── CirqProofRegistry.sol
│   ├── CirqProofSettlement.sol
│   └── scripts/deploy.js
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── services/
│       ├── evidence/
│       ├── blockchain/
│       ├── settlement/
│       ├── simulation/
│       └── ai/
├── ai-service/
│   ├── extraction/
│   ├── rules/
│   ├── reconciliation/
│   └── anomaly/
├── simulator/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── chain/
│       └── types/
├── shared/
│   ├── abi/
│   │   ├── CirqProofRegistry.json
│   │   ├── CirqProofSettlement.json
│   │   └── addresses.testnet.json
│   ├── api/
│   └── scenarios/
└── README.md
```

------------------------------------------------------------------------

# 🌐 MST Testnet

  Parameter      Value
  -------------- ----------------------------------------
  Network        `mst_testnet`
  Chain ID       `91562037`
  Native Token   `tMSTC`
  RPC            `https://testnetrpc.mstblockchain.com`
  Explorer       https://testnet.mstscan.com/

### Contract Explorer

**Registry:**\
https://testnet.mstscan.com/address/0xFE9236E0A273c00C901D70A9C7D347f2A5d56633

**Settlement:**\
https://testnet.mstscan.com/address/0xade8B1Caa033Cf637fC52c5746798D58cAdcb372

------------------------------------------------------------------------

# 🎥 Demo Flow

``` text
NORMAL
  ↓
Evidence Generated
  ↓
Evidence Root
  ↓
AI → CONSISTENT
  ↓
Integrity → PASS
  ↓
Human Verification
  ↓
MST Attestation
  ↓
Settlement Release

INCONSISTENT
  ↓
AI → FLAGGED
  ↓
Attestation Blocked

TAMPERED
  ↓
Evidence Modified
  ↓
Hash Mismatch
  ↓
Attestation + Settlement Blocked
```

------------------------------------------------------------------------

# 🔎 Why the MST Integration is Meaningful

CirqProof uses MST across multiple critical stages:

``` text
Evidence Commitment
       ↓
AI Result
       ↓
Attestation
       ↓
Challenge
       ↓
Resolution
       ↓
Settlement
```

MST therefore forms part of the application's
**verification-to-settlement lifecycle** rather than being used only for
wallet connectivity.

------------------------------------------------------------------------

# 🚀 Future Extensions

The current simulator can later be replaced or supplemented by real data
sources:

-   🏭 Recycling plant sensors
-   ⚖️ Industrial weighbridges
-   📡 IoT gateways
-   🧾 ERP systems
-   🚚 Logistics/downstream systems
-   📷 Computer vision inspection
-   🔗 Enterprise data sources

The Evidence Event interface is designed so these sources can feed the
same verification pipeline.

------------------------------------------------------------------------

# 🌱 Impact

CirqProof does not physically recycle waste or replace existing
recycling infrastructure.

It strengthens the **trust layer around recycling operations** through:

-   Better evidence accountability
-   Detection of post-commitment changes
-   Identification of inconsistent claims
-   Auditable verification history
-   Structured stakeholder challenges
-   Blockchain-backed settlement records

> **We are strengthening the verification and accountability layer
> around recycling claims.**

------------------------------------------------------------------------

# 🏆 MST × NEWRRO Buildathon

**CirqProof** combines:

`Real-World Applications` · `Blockchain` · `AI` · `Trust` ·
`Verification` · `Settlement`

The project demonstrates how MST can be integrated into a real
operational workflow where blockchain provides **proof and critical
state transitions**, while detailed application data and computation
remain off-chain.

------------------------------------------------------------------------

# 👥 Team

  Role     Responsibility
  -------- --------------------------------
  **P1**   Blockchain & Settlement
  **P2**   Backend Core & Evidence Engine
  **P3**   AI Reconciliation & Simulator
  **P4**   Frontend & Demo

------------------------------------------------------------------------

# 🔗 Links

-   **Live Application:** `ADD_YOUR_DEPLOYED_APP_URL`
-   **GitHub:** `ADD_YOUR_PUBLIC_GITHUB_URL`
-   **Demo Video:** `ADD_YOUR_YOUTUBE_URL`
-   **MST Explorer:** https://testnet.mstscan.com/

------------------------------------------------------------------------

## ⭐ One-Line Pitch

> **CirqProof turns fragmented recycling evidence into a verifiable,
> challengeable and blockchain-backed path from claim to settlement.**

------------------------------------------------------------------------

```{=html}
<p align="center">
```
`<b>`{=html}♻️ CirqProof`</b>`{=html}`<br>`{=html} Verify the Claim.
Prove the Evidence. Settle with Confidence.
```{=html}
</p>
```
