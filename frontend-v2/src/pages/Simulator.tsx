import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, AlertTriangle, AlertOctagon, CheckCircle2, Circle, Loader2, Activity, Zap, Thermometer, Cpu, ArrowRight } from "lucide-react";
import { simulationApi } from "../api/simulation";
import { aiApi } from "../api/ai";
import { generatePayload, buildEventStream, ScenarioType, SimPayload, SimEvent } from "../lib/simulatorData";

type PipelineStep = { label: string; state: "pending" | "active" | "done" | "error" };

const PIPELINE_LABELS = [
  "Generating operational data",
  "Ingesting evidence",
  "Running reconciliation",
  "Generating AI explanation",
  "Ready for human verification",
];

function stepStates(activeIndex: number, error: boolean): PipelineStep[] {
  return PIPELINE_LABELS.map((label, i) => ({
    label,
    state: i < activeIndex ? "done" : i === activeIndex ? (error ? "error" : "active") : "pending",
  }));
}

function TelemetryBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px] text-slate-400">
        <span className="uppercase tracking-[0.18em]">{label}</span>
        <span className="font-mono text-slate-200">{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800">
        <motion.div
          className={`h-1.5 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function EventRow({ ev, index }: { ev: SimEvent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.12 }}
      className="flex items-start gap-3 border-b border-white/5 py-2 last:border-0"
    >
      <span className="mt-0.5 font-mono text-[10px] text-slate-500 shrink-0">{ev.time}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300 shrink-0 w-40">{ev.type.replace(/_/g, " ")}</span>
      <span className="text-xs text-slate-300">{ev.detail}</span>
    </motion.div>
  );
}

export function Simulator() {
  const navigate = useNavigate();
  const [running, setRunning] = useState<ScenarioType | null>(null);
  const [pipelineStep, setPipelineStep] = useState(-1);
  const [pipelineError, setPipelineError] = useState(false);
  const [payload, setPayload] = useState<SimPayload | null>(null);
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [aiResult, setAiResult] = useState<{ output: string; explanation: string } | null>(null);
  const [completedBatchId, setCompletedBatchId] = useState<string | null>(null);
  const telemetryInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [liveTemp, setLiveTemp] = useState(0);
  const [liveLoad, setLiveLoad] = useState(0);
  const [liveRate, setLiveRate] = useState(0);

  useEffect(() => {
    return () => { if (telemetryInterval.current) clearInterval(telemetryInterval.current); };
  }, []);

  const startTelemetryFlicker = (base: SimPayload) => {
    setLiveTemp(base._telemetry.temperature);
    setLiveLoad(base._telemetry.machineLoad);
    setLiveRate(base._telemetry.processingRate);
    telemetryInterval.current = setInterval(() => {
      setLiveTemp((v) => parseFloat((v + (Math.random() - 0.5) * 1.4).toFixed(1)));
      setLiveLoad((v) => parseFloat(Math.min(99, Math.max(30, v + (Math.random() - 0.5) * 2.2)).toFixed(1)));
      setLiveRate((v) => parseFloat(Math.max(10, (v + (Math.random() - 0.5) * 8)).toFixed(1)));
    }, 900);
  };

  const stopTelemetryFlicker = () => {
    if (telemetryInterval.current) { clearInterval(telemetryInterval.current); telemetryInterval.current = null; }
  };

  const runSimulation = async (scenario: ScenarioType) => {
    setRunning(scenario);
    setPipelineStep(0);
    setPipelineError(false);
    setPayload(null);
    setEvents([]);
    setAiResult(null);
    setCompletedBatchId(null);

    try {
      // Step 0: generate data
      const p = generatePayload(scenario);
      setPayload(p);
      startTelemetryFlicker(p);
      await new Promise((r) => setTimeout(r, 600));

      // Step 1: ingest evidence
      setPipelineStep(1);
      const { batchId, material, inputWeight, processedWeight, recoveredWeight, downstreamWeight, machineRuntime, energyUsed } = p;
      await simulationApi.generate({ batchId, material, inputWeight, processedWeight, recoveredWeight, downstreamWeight, machineRuntime, energyUsed, scenario });

      if (scenario === "TAMPERED") {
        await simulationApi.tamper(batchId);
      }

      // Reveal events progressively
      const evStream = buildEventStream(p);
      for (let i = 0; i < evStream.length; i++) {
        await new Promise((r) => setTimeout(r, 220));
        setEvents((prev) => [...prev, evStream[i]]);
      }

      // Step 2: reconcile
      setPipelineStep(2);
      await new Promise((r) => setTimeout(r, 400));
      const reconcileRes = await aiApi.reconcile({ batchId });

      // Step 3: AI explanation
      setPipelineStep(3);
      await new Promise((r) => setTimeout(r, 500));

      const report = reconcileRes?.data?.report ?? reconcileRes?.report ?? null;
      if (report) {
        const nested = report.result ?? {};
        const output = String(nested.output ?? report.status ?? "REVIEW").toUpperCase();
        const explanation = nested.explanation ?? report.explanation ?? "AI reconciliation completed.";
        setAiResult({ output, explanation });
      }

      // Step 4: done
      setPipelineStep(4);
      stopTelemetryFlicker();
      setCompletedBatchId(batchId);
    } catch (err) {
      setPipelineError(true);
      stopTelemetryFlicker();
      console.error(err);
    } finally {
      setRunning(null);
    }
  };

  const isRunning = running !== null;
  const steps = pipelineStep >= 0 ? stepStates(pipelineStep, pipelineError) : [];

  return (
    <div className="animate-fade-in space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Plant Simulator</h1>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
          Simulates operational data from a recycling plant IoT gateway. Each run generates a unique batch with correlated mass-balance evidence, ingests it through the backend, and triggers real AI reconciliation.
        </p>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ScenarioCard
          title="Normal Operation"
          color="emerald"
          icon={<Play size={18} />}
          description="Generates physically plausible, correlated mass-balance data. All rules pass. AI confirms consistency."
          scenario="NORMAL"
          running={running}
          onRun={runSimulation}
        />
        <ScenarioCard
          title="Inconsistent Data"
          color="amber"
          icon={<AlertTriangle size={18} />}
          description="Introduces a controlled mass-balance violation — e.g. recovered exceeds processed. Rules flag the batch."
          scenario="INCONSISTENT"
          running={running}
          onRun={runSimulation}
        />
        <ScenarioCard
          title="Tampered Evidence"
          color="red"
          icon={<AlertOctagon size={18} />}
          description="Generates valid evidence, commits it, then rewrites the database record. Integrity check detects hash mismatch."
          scenario="TAMPERED"
          running={running}
          onRun={runSimulation}
        />
      </div>

      {/* Live telemetry + pipeline — shown once a run starts */}
      <AnimatePresence>
        {payload && (
          <motion.div
            key="telemetry"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* Telemetry panel */}
            <div className="card-glass p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300 flex items-center gap-2">
                    <span className="live-indicator" /> {payload._telemetry.lineId} — {isRunning ? "PROCESSING" : "COMPLETED"}
                  </div>
                  <div className="mt-1 text-base font-semibold text-white">{payload.material}</div>
                </div>
                <span className="font-mono text-xs text-slate-400">{payload.batchId}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Metric icon={<Activity size={13} />} label="Input" value={`${payload.inputWeight} kg`} />
                <Metric icon={<Cpu size={13} />} label="Processed" value={`${payload.processedWeight} kg`} />
                <Metric icon={<CheckCircle2 size={13} />} label="Recovered" value={`${payload.recoveredWeight} kg`} />
                <Metric icon={<ArrowRight size={13} />} label="Downstream" value={`${payload.downstreamWeight} kg`} />
                <Metric icon={<Zap size={13} />} label="Energy" value={`${payload.energyUsed} kWh`} />
                <Metric icon={<Thermometer size={13} />} label="Runtime" value={`${payload.machineRuntime} min`} />
              </div>

              <div className="space-y-3 pt-1">
                <TelemetryBar label="Temperature °C" value={liveTemp} max={100} color="bg-amber-400" />
                <TelemetryBar label="Machine load %" value={liveLoad} max={100} color="bg-cyan-400" />
                <TelemetryBar label="Processing rate kg/h" value={liveRate} max={800} color="bg-emerald-400" />
                <TelemetryBar label="Recovery rate %" value={payload._telemetry.recoveryRate} max={100} color="bg-violet-400" />
              </div>
            </div>

            {/* Pipeline + events */}
            <div className="space-y-5">
              {/* Pipeline steps */}
              <div className="card-glass p-5 space-y-3">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-1">Simulation pipeline</div>
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="shrink-0">
                      {step.state === "done" && <CheckCircle2 size={16} className="text-emerald-300" />}
                      {step.state === "active" && <Loader2 size={16} className="text-cyan-300 animate-spin" />}
                      {step.state === "error" && <AlertOctagon size={16} className="text-red-300" />}
                      {step.state === "pending" && <Circle size={16} className="text-slate-600" />}
                    </div>
                    <span className={`text-sm ${step.state === "done" ? "text-emerald-300" : step.state === "active" ? "text-white" : step.state === "error" ? "text-red-300" : "text-slate-500"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Event stream */}
              {events.length > 0 && (
                <div className="card-glass p-5">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Live event stream</div>
                  <div className="space-y-0">
                    {events.map((ev, i) => <EventRow key={i} ev={ev} index={i} />)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI result */}
      <AnimatePresence>
        {aiResult && (
          <motion.div
            key="ai-result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Activity className="text-cyan-300" size={18} />
              <h2 className="text-lg font-semibold text-white">AI Reconciliation Result</h2>
              <span className={`badge ml-auto ${aiResult.output === "CONSISTENT" ? "badge-success" : "badge-error"}`}>
                {aiResult.output}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Deterministic rule engine</div>
                <RuleRow label="Processed ≤ Input" pass={payload ? payload.processedWeight <= payload.inputWeight : true} />
                <RuleRow label="Recovered ≤ Processed" pass={payload ? payload.recoveredWeight <= payload.processedWeight : true} />
                <RuleRow label="Downstream ≤ Recovered" pass={payload ? payload.downstreamWeight <= payload.recoveredWeight : true} />
              </div>
              <div className="rounded-xl border border-cyan-400/15 bg-cyan-500/5 p-4">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">AI explanation</div>
                <p className="text-slate-200 leading-6">{aiResult.explanation}</p>
                {aiResult.output !== "CONSISTENT" && (
                  <p className="mt-3 text-amber-300 text-[11px]">
                    This indicates an evidence inconsistency requiring human review. It is not by itself proof of fraud.
                  </p>
                )}
              </div>
            </div>

            {completedBatchId && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => navigate(`/batches/${completedBatchId}`)}
                  className="btn-primary text-xs px-4 py-2"
                >
                  Open Batch Proof →
                </button>
                <button
                  onClick={() => navigate("/blockchain")}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  View Blockchain Proof
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScenarioCard({
  title, color, icon, description, scenario, running, onRun,
}: {
  title: string;
  color: "emerald" | "amber" | "red";
  icon: React.ReactNode;
  description: string;
  scenario: ScenarioType;
  running: ScenarioType | null;
  onRun: (s: ScenarioType) => void;
}) {
  const colors = {
    emerald: { border: "border-t-emerald-400", bg: "bg-emerald-500/10", text: "text-emerald-300", btn: "btn-primary" },
    amber: { border: "border-t-amber-400", bg: "bg-amber-500/10", text: "text-amber-300", btn: "bg-amber-500/10 text-amber-300 border border-amber-400/25 hover:bg-amber-500/20" },
    red: { border: "border-t-red-400", bg: "bg-red-500/10", text: "text-red-300", btn: "bg-red-500/10 text-red-300 border border-red-400/25 hover:bg-red-500/20" },
  }[color];

  const isActive = running === scenario;
  const disabled = running !== null;

  return (
    <div className={`card-glass p-6 border-t-2 ${colors.border} flex flex-col h-full`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded ${colors.bg} ${colors.text}`}>{icon}</div>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      <p className="text-slate-400 text-sm mb-6 flex-1">{description}</p>
      <button
        onClick={() => onRun(scenario)}
        disabled={disabled}
        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${colors.btn}`}
      >
        {isActive ? <><Loader2 size={14} className="animate-spin" /> Running…</> : `Run ${title}`}
      </button>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-950/40 px-3 py-2 flex items-center gap-2">
      <span className="text-slate-500">{icon}</span>
      <div>
        <div className="text-[9px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
        <div className="font-mono text-xs text-slate-100">{value}</div>
      </div>
    </div>
  );
}

function RuleRow({ label, pass }: { label: string; pass: boolean }) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      {pass
        ? <CheckCircle2 size={13} className="text-emerald-300 shrink-0" />
        : <AlertOctagon size={13} className="text-red-300 shrink-0" />}
      <span className={pass ? "text-slate-300" : "text-red-300"}>{label}</span>
    </div>
  );
}
