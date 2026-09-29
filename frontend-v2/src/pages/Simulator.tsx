import React, { useState } from "react";
import { simulationApi } from "../api/simulation";
import { useNavigate } from "react-router-dom";
import { Play, AlertTriangle, AlertOctagon } from "lucide-react";

export function Simulator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const runSimulation = async (scenario: string) => {
    setLoading(scenario);
    try {
      const batchId = `SIM-${Date.now()}`;
      
      const payload = {
        batchId,
        material: "E-Waste",
        inputWeight: 1500,
        processedWeight: scenario === "INCONSISTENT" ? 1200 : 1400, // Inconsistent scenario fails rule: recovered <= processed
        recoveredWeight: 1400,
        downstreamWeight: 1400,
        machineRuntime: 120,
        energyUsed: 450,
        scenario
      };

      await simulationApi.generate(payload);
      
      if (scenario === "TAMPERED") {
        await simulationApi.tamper(batchId);
      }

      navigate(`/batches/${batchId}`);
    } catch (err) {
      alert("Simulation failed: " + (err as Error).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Plant Simulator</h1>
        <p className="text-[#8b92a5] mt-2 text-sm leading-relaxed">
          The simulator represents operational data normally produced by a recycling plant's IoT gateway and ERP system. 
          Select a scenario below to generate a new batch of physical evidence and observe how the CirqProof consensus protocol handles it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Normal Scenario */}
        <div className="card-glass p-6 border-t-2 border-t-[#00E676] flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#00e6761a] rounded text-[#00E676]">
              <Play size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Normal Operation</h2>
          </div>
          <p className="text-[#8b92a5] text-sm mb-6 flex-1">
            Generates perfectly consistent mass-balance data. Evidence rules will pass, AI will explain the successful recovery, and the batch will await human verification.
          </p>
          <button 
            onClick={() => runSimulation("NORMAL")}
            disabled={!!loading}
            className="btn-primary w-full py-2"
          >
            {loading === "NORMAL" ? "Running..." : "Run Normal Scenario"}
          </button>
        </div>

        {/* Inconsistent Scenario */}
        <div className="card-glass p-6 border-t-2 border-t-[#FFB300] flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#ffb3001a] rounded text-[#FFB300]">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Inconsistent Data</h2>
          </div>
          <p className="text-[#8b92a5] text-sm mb-6 flex-1">
            Generates evidence where recovered weight exceeds processed weight. Deterministic rules will fail and flag the batch to prevent false attestation.
          </p>
          <button 
            onClick={() => runSimulation("INCONSISTENT")}
            disabled={!!loading}
            className="w-full py-2 bg-[#ffb3001a] text-[#FFB300] border border-[#ffb30033] rounded font-semibold text-sm hover:bg-[#ffb30033] transition-colors"
          >
            {loading === "INCONSISTENT" ? "Running..." : "Run Inconsistent"}
          </button>
        </div>

        {/* Tampered Scenario */}
        <div className="card-glass p-6 border-t-2 border-t-[#FF3D00] flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-[#ff3d001a] rounded text-[#FF3D00]">
              <AlertOctagon size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Tampered Evidence</h2>
          </div>
          <p className="text-[#8b92a5] text-sm mb-6 flex-1">
            Generates valid evidence, but immediately triggers a malicious database rewrite that invalidates the cryptographic commitment root hash.
          </p>
          <button 
            onClick={() => runSimulation("TAMPERED")}
            disabled={!!loading}
            className="w-full py-2 bg-[#ff3d001a] text-[#FF3D00] border border-[#ff3d0033] rounded font-semibold text-sm hover:bg-[#ff3d0033] transition-colors"
          >
            {loading === "TAMPERED" ? "Running..." : "Run Tampered"}
          </button>
        </div>
      </div>
    </div>
  );
}
