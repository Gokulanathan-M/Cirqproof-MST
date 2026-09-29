// Mock database store for frontend offline demonstration
export const initialBatches = [
  {
    id: "BATCH-2026-0891",
    material: "Lithium-Ion Batteries (NMC 811)",
    inputWeight: 1000,
    processedWeight: 950,
    claimedRecoveredWeight: 680,
    downstreamWeight: 675,
    residueWeight: 270,
    producer: "VoltForge Dynamics Ltd",
    recycler: "EcoLoop Hydrometallurgy Unit 4",
    buyer: "CathodePure Advanced Materials",
    status: "VERIFIED",
    scenario: "NORMAL",
    createdAt: "2026-09-28T09:30:00Z",
    evidence: {
      weighbridge: { status: "VALID", docId: "WB-99120", weight: 1000, timestamp: "2026-09-28T08:15:00Z" },
      processingLog: { status: "VALID", runtimeHours: 8.5, energyKwh: 1240, temperatureAvg: "142°C" },
      outputRecord: { status: "VALID", recoveredWeight: 680, grade: "Battery Grade 99.4%" },
      downstreamInvoice: { status: "VALID", invoiceNo: "INV-CATH-4402", verifiedWeight: 675 },
      telemetry: { status: "VALID", sensorIntegrity: "100%", continuousLogging: true }
    },
    evidenceRoot: "0x8fa918b2c45100ea8b1a8d01f5bc91238df109403a557bfa1e9986341dcefa01",
    integrityStatus: "VALID",
    aiReport: {
      status: "CONSISTENT",
      massBalance: { passed: true, variancePercent: 0.5, message: "Mass balance within 0.5% tolerance threshold." },
      capacity: { passed: true, message: "Throughput matches recycler 1.2t/shift rated capacity." },
      downstreamMatch: { passed: true, delta: -5, message: "Downstream receiver confirmed 675kg with minimal transit moisture loss." },
      flags: [],
      explanation: "All 5 multi-tier telemetry streams and physical weighbridge inputs exhibit nominal thermodynamic mass-balance continuity with no sensor anomalies.",
      recommendation: "Approved for immediate automated smart contract MST attestation and payout release."
    },
    blockchain: {
      attestationId: "ATTEST-MST-004921",
      txHash: "0x7a3f81e9b21dc8074f9d0c64b63ee27b14d23a1a9e403d5ec7125301dae0bb14",
      evidenceRoot: "0x8fa918b2c45100ea8b1a8d01f5bc91238df109403a557bfa1e9986341dcefa01",
      verifier: "0x3F881c2069B56eF70F04D6a61DEa3D8f4f9a0A21",
      timestamp: "2026-09-28T10:04:12Z",
      blockNumber: 14890211,
      network: "MST Testnet (Chain ID: 4242)"
    },
    settlement: {
      id: "SETTLE-981",
      amountINR: 50000,
      status: "RELEASED", // PENDING, HELD, RELEASED, REFUNDED
      escrowTx: "0x31bca89d14f2e90c88b776a3f019ea812d4d9894e6bf12c49980112faac90145",
      releaseTx: "0x9812ccf128ea902b489a2df41e8c7151f1124ad9001bbcf81001aef351992cc8",
      recipient: "EcoLoop Hydrometallurgy Unit 4"
    }
  },
  {
    id: "BATCH-2026-0892",
    material: "E-Waste Circuit Boards (Grade A PCB)",
    inputWeight: 1000,
    processedWeight: 920,
    claimedRecoveredWeight: 900,
    downstreamWeight: 680,
    residueWeight: 80,
    producer: "TerraGreen CleanTech",
    recycler: "UrbanOre Smelting Corp",
    buyer: "NobleRefine Precious Metals",
    status: "CHALLENGED",
    scenario: "INCONSISTENT",
    createdAt: "2026-09-28T11:15:00Z",
    evidence: {
      weighbridge: { status: "VALID", docId: "WB-99144", weight: 1000, timestamp: "2026-09-28T10:45:00Z" },
      processingLog: { status: "SUSPICIOUS", runtimeHours: 4.2, energyKwh: 480, temperatureAvg: "92°C (Under-temp)" },
      outputRecord: { status: "FLAGGED", recoveredWeight: 900, grade: "Overstated Assay" },
      downstreamInvoice: { status: "MISMATCH", invoiceNo: "INV-NOB-1102", verifiedWeight: 680 },
      telemetry: { status: "WARNING", sensorIntegrity: "78%", continuousLogging: false }
    },
    evidenceRoot: "0x310bb2189af012dfac881270091aafe0912cb8102377fae99120934125bfa10a",
    integrityStatus: "FLAGGED",
    aiReport: {
      status: "FLAGGED",
      massBalance: { passed: false, variancePercent: 24.4, message: "Mass Balance Violation: Claimed 900kg recovery exceeds theoretical yields by +220kg." },
      capacity: { passed: true, message: "Within rated physical footprint limits." },
      downstreamMatch: { passed: false, delta: -220, message: "Severe Downstream Discrepancy: Receiver documented 680kg vs claimed 900kg." },
      flags: [
        "MASS_BALANCE_VIOLATION: Claimed 90% recovery on PCB Grade A impossible",
        "DOWNSTREAM_MISMATCH: 220kg delta between claim and buyer receipt",
        "ANOMALOUS_THERMAL_PROFILE: Smelter ran 48°C below thermal desorption minimum"
      ],
      explanation: "CirqProof AI multi-agent verification rejected this attestation. Claimed recovery weight contradicts physical thermodynamics and certified downstream weighment by 220 kg.",
      recommendation: "Flagged for Auditor inspection. Escrow bounty challenge triggered; automatic payout frozen."
    },
    blockchain: {
      attestationId: "ATTEST-MST-004922",
      txHash: "0x1102abf9872199acdef41289134bbcd8912efc401aa98012bbde49912aefa091",
      evidenceRoot: "0x310bb2189af012dfac881270091aafe0912cb8102377fae99120934125bfa10a",
      verifier: "0x9812A27191Fca098C81129bBcFA0192800109912",
      timestamp: "2026-09-28T11:45:00Z",
      blockNumber: 14890250,
      network: "MST Testnet (Chain ID: 4242)"
    },
    settlement: {
      id: "SETTLE-982",
      amountINR: 75000,
      status: "HELD",
      escrowTx: "0xaa90128cb4120199ecfa8812301985fa019248bbccfa001288921afde0091244",
      releaseTx: null,
      recipient: "UrbanOre Smelting Corp"
    },
    challenge: {
      id: "CHALLENGE-042",
      challenger: "0x77A19bE492801FdA21004C9912AcDa78912066fB",
      reason: "Downstream receipt confirms only 680kg delivered; claimed 900kg constitutes artificial EPR credit inflation.",
      bountyINR: 15000,
      status: "ACTIVE",
      timestamp: "2026-09-28T12:00:00Z"
    }
  },
  {
    id: "BATCH-2026-0893",
    material: "Polyethylene Terephthalate (PET Flakes)",
    inputWeight: 2500,
    processedWeight: 2420,
    claimedRecoveredWeight: 2150,
    downstreamWeight: 2145,
    residueWeight: 270,
    producer: "Apex Polymers Pvt",
    recycler: "CircularPellets India",
    buyer: "EcoThread Fibres Ltd",
    status: "VERIFIED",
    scenario: "NORMAL",
    createdAt: "2026-09-28T13:00:00Z",
    evidence: {
      weighbridge: { status: "VALID", docId: "WB-99158", weight: 2500, timestamp: "2026-09-28T12:30:00Z" },
      processingLog: { status: "VALID", runtimeHours: 12.0, energyKwh: 860, temperatureAvg: "260°C" },
      outputRecord: { status: "VALID", recoveredWeight: 2150, grade: "Clear rPET Grade 1" },
      downstreamInvoice: { status: "VALID", invoiceNo: "INV-ECO-9941", verifiedWeight: 2145 },
      telemetry: { status: "VALID", sensorIntegrity: "99.8%", continuousLogging: true }
    },
    evidenceRoot: "0x55bc0128919ae9810bbcefa190234789abce1287901dafe009128876cdeee918",
    integrityStatus: "VALID",
    aiReport: {
      status: "CONSISTENT",
      massBalance: { passed: true, variancePercent: 0.2, message: "Mass balance 100% within statutory limits (86% yield)." },
      capacity: { passed: true, message: "Extrusion lines operated within nominal rate." },
      downstreamMatch: { passed: true, delta: -5, message: "Direct match against invoice INV-ECO-9941." },
      flags: [],
      explanation: "PET mechanical washing and pelletizing telemetry validates continuous steady-state operation.",
      recommendation: "Approve attestation; dispatch MST minting transaction."
    },
    blockchain: {
      attestationId: "ATTEST-MST-004923",
      txHash: "0x448a90123be8719cbde8712948bbcae1098234bbfa81992388102dcf881023a1",
      evidenceRoot: "0x55bc0128919ae9810bbcefa190234789abce1287901dafe009128876cdeee918",
      verifier: "0x3F881c2069B56eF70F04D6a61DEa3D8f4f9a0A21",
      timestamp: "2026-09-28T13:40:00Z",
      blockNumber: 14890289,
      network: "MST Testnet (Chain ID: 4242)"
    },
    settlement: {
      id: "SETTLE-983",
      amountINR: 42000,
      status: "PENDING",
      escrowTx: "0x8891024bcde10298a0019234bbef019280019dae77109238810239fae0910234",
      releaseTx: null,
      recipient: "CircularPellets India"
    }
  },
  {
    id: "BATCH-2026-0894",
    material: "Solar Photovoltaic Silicon Wafers",
    inputWeight: 1500,
    processedWeight: 1400,
    claimedRecoveredWeight: 1350,
    downstreamWeight: 820,
    residueWeight: 50,
    producer: "SunPower Renewables",
    recycler: "Helios Recovery Labs",
    buyer: "SilCore Wafers",
    status: "FLAGGED",
    scenario: "TAMPERED",
    createdAt: "2026-09-28T14:10:00Z",
    evidence: {
      weighbridge: { status: "MODIFIED", docId: "WB-99177", weight: 1500, timestamp: "2026-09-28T13:50:00Z" },
      processingLog: { status: "TAMPERED_HASH", runtimeHours: 2.1, energyKwh: 120, temperatureAvg: "Erroneous Log" },
      outputRecord: { status: "FLAGGED", recoveredWeight: 1350, grade: "Solar 9N Silicon" },
      downstreamInvoice: { status: "UNCONFIRMED", invoiceNo: "INV-SIL-002", verifiedWeight: 820 },
      telemetry: { status: "OFFLINE", sensorIntegrity: "23%", continuousLogging: false }
    },
    evidenceRoot: "0x99238120faec10293847bbade01923847daee1029348871029384caffff90123",
    integrityStatus: "TAMPERED",
    aiReport: {
      status: "FLAGGED",
      massBalance: { passed: false, variancePercent: 35.0, message: "Severe Mass Violation: Telemetry shows missing 530kg residue or fake yield." },
      capacity: { passed: false, message: "Reported throughput exceeds machine max throughput by 300%." },
      downstreamMatch: { passed: false, delta: -530, message: "Critical Downstream Mismatch: Buyer signed 820kg vs claimed 1350kg." },
      flags: [
        "TAMPERED_EVIDENCE_HASH: Merkle leaf signature mismatch in telemetry upload",
        "DOWNSTREAM_DISCREPANCY: -530kg unaccounted volume",
        "IMPOSSIBLE_CYCLE_TIME: 2.1 hours claimed for 14-hour chemical delamination"
      ],
      explanation: "Sensor audit records were modified post-hoc. Telemetry checksums do not match hardware enclave signatures.",
      recommendation: "Immediate dispute lock. Penalty protocol triggered on smart contract."
    },
    blockchain: {
      attestationId: "ATTEST-MST-004924",
      txHash: "0x990012eafbc0192348baef01928374aedbf01923881029348bcaef1029384fa1",
      evidenceRoot: "0x99238120faec10293847bbade01928374aedbf01923847daee1029348871029384caffff90123",
      verifier: "0x9812A27191Fca098C81129bBcFA0192800109912",
      timestamp: "2026-09-28T14:25:00Z",
      blockNumber: 14890310,
      network: "MST Testnet (Chain ID: 4242)"
    },
    settlement: {
      id: "SETTLE-984",
      amountINR: 110000,
      status: "HELD",
      escrowTx: "0x551290384baef01928374aedbc01928374aed019283741029384baef1029384a",
      releaseTx: null,
      recipient: "Helios Recovery Labs"
    }
  }
];

// Helper to simulate network latency
export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
