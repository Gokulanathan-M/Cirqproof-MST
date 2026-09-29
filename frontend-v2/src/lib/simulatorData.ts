export type ScenarioType = "NORMAL" | "INCONSISTENT" | "TAMPERED";

export interface MaterialProfile {
  name: string;
  inputRange: [number, number];
  processRatio: [number, number];
  recoveryRatio: [number, number];
  energyPerKg: [number, number];
  runtimePerKg: [number, number];
  lineId: string;
}

export const MATERIAL_PROFILES: MaterialProfile[] = [
  {
    name: "Mixed E-Waste",
    inputRange: [900, 1600],
    processRatio: [0.91, 0.97],
    recoveryRatio: [0.62, 0.74],
    energyPerKg: [0.28, 0.38],
    runtimePerKg: [0.0018, 0.0026],
    lineId: "LINE-02",
  },
  {
    name: "NMC 811 Batteries",
    inputRange: [420, 780],
    processRatio: [0.88, 0.95],
    recoveryRatio: [0.71, 0.83],
    energyPerKg: [0.44, 0.62],
    runtimePerKg: [0.0028, 0.0038],
    lineId: "LINE-04",
  },
  {
    name: "PCB / Electronic Components",
    inputRange: [600, 1100],
    processRatio: [0.89, 0.96],
    recoveryRatio: [0.55, 0.68],
    energyPerKg: [0.32, 0.46],
    runtimePerKg: [0.0022, 0.003],
    lineId: "LINE-01",
  },
  {
    name: "Copper-Bearing E-Waste",
    inputRange: [750, 1400],
    processRatio: [0.93, 0.98],
    recoveryRatio: [0.68, 0.79],
    energyPerKg: [0.24, 0.34],
    runtimePerKg: [0.0016, 0.0022],
    lineId: "LINE-03",
  },
  {
    name: "Aluminum-Bearing Scrap",
    inputRange: [1200, 2200],
    processRatio: [0.94, 0.99],
    recoveryRatio: [0.72, 0.85],
    energyPerKg: [0.18, 0.28],
    runtimePerKg: [0.0012, 0.0018],
    lineId: "LINE-05",
  },
];

function rand(min: number, max: number, decimals = 1): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface SimPayload {
  batchId: string;
  material: string;
  inputWeight: number;
  processedWeight: number;
  recoveredWeight: number;
  downstreamWeight: number;
  machineRuntime: number;
  energyUsed: number;
  scenario: ScenarioType;
  _telemetry: {
    lineId: string;
    temperature: number;
    machineLoad: number;
    processingRate: number;
    recoveryRate: number;
    sortingEfficiency: number;
  };
}

function buildPayload(
  batchId: string,
  profile: MaterialProfile,
  scenario: ScenarioType,
  inputWeight: number,
  processedWeight: number,
  recoveredWeight: number,
  downstreamWeight: number,
): SimPayload {
  const machineRuntime = parseFloat((inputWeight * rand(profile.runtimePerKg[0], profile.runtimePerKg[1], 5) * 60).toFixed(0));
  const energyUsed = parseFloat((inputWeight * rand(profile.energyPerKg[0], profile.energyPerKg[1], 4)).toFixed(1));
  const temperature = rand(48, 82);
  const machineLoad = rand(52, 88);
  const processingRate = parseFloat((processedWeight / Math.max(machineRuntime / 60, 0.1)).toFixed(1));
  const recoveryRate = parseFloat(((recoveredWeight / Math.max(processedWeight, 1)) * 100).toFixed(1));
  const sortingEfficiency = rand(88, 97);
  return {
    batchId,
    material: profile.name,
    inputWeight,
    processedWeight,
    recoveredWeight,
    downstreamWeight,
    machineRuntime,
    energyUsed,
    scenario,
    _telemetry: { lineId: profile.lineId, temperature, machineLoad, processingRate, recoveryRate, sortingEfficiency },
  };
}

export function generatePayload(scenario: ScenarioType): SimPayload {
  const profile = pick(MATERIAL_PROFILES);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const batchId = `SIM-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${suffix}`;

  const inputWeight = rand(profile.inputRange[0], profile.inputRange[1]);
  const processedWeight = parseFloat((inputWeight * rand(profile.processRatio[0], profile.processRatio[1], 4)).toFixed(1));

  if (scenario === "INCONSISTENT") {
    const kind = Math.floor(Math.random() * 3);
    if (kind === 0) {
      // recovered > processed
      const recoveredWeight = parseFloat((processedWeight * rand(1.12, 1.28, 4)).toFixed(1));
      const downstreamWeight = parseFloat((processedWeight * rand(0.82, 0.9, 4)).toFixed(1));
      return buildPayload(batchId, profile, scenario, inputWeight, processedWeight, recoveredWeight, downstreamWeight);
    } else if (kind === 1) {
      // downstream > recovered
      const recoveredWeight = parseFloat((processedWeight * rand(profile.recoveryRatio[0], profile.recoveryRatio[1], 4)).toFixed(1));
      const downstreamWeight = parseFloat((recoveredWeight * rand(1.02, 1.08, 4)).toFixed(1));
      return buildPayload(batchId, profile, scenario, inputWeight, processedWeight, recoveredWeight, downstreamWeight);
    } else {
      // processed > input
      const badProcessed = parseFloat((inputWeight * rand(1.05, 1.18, 4)).toFixed(1));
      const recoveredWeight = parseFloat((badProcessed * rand(profile.recoveryRatio[0], profile.recoveryRatio[1], 4)).toFixed(1));
      const downstreamWeight = parseFloat((processedWeight * rand(0.82, 0.9, 4)).toFixed(1));
      return buildPayload(batchId, profile, scenario, inputWeight, badProcessed, recoveredWeight, downstreamWeight);
    }
  }

  const recoveredWeight = parseFloat((processedWeight * rand(profile.recoveryRatio[0], profile.recoveryRatio[1], 4)).toFixed(1));
  const downstreamWeight = parseFloat((recoveredWeight * rand(0.95, 1.0, 4)).toFixed(1));
  return buildPayload(batchId, profile, scenario, inputWeight, processedWeight, recoveredWeight, downstreamWeight);
}

export interface SimEvent {
  time: string;
  type: string;
  detail: string;
}

export function buildEventStream(payload: SimPayload): SimEvent[] {
  const base = new Date();
  const t = (s: number) => new Date(base.getTime() + s * 1000).toTimeString().slice(0, 8);
  return [
    { time: t(0), type: "MATERIAL_RECEIVED", detail: `${payload.inputWeight} kg — ${payload.material}` },
    { time: t(13), type: "PROCESSING_STARTED", detail: payload._telemetry.lineId },
    { time: t(28), type: "PROCESSING_COMPLETED", detail: `${payload.processedWeight} kg output` },
    { time: t(41), type: "RECOVERY_COMPLETED", detail: `${payload.recoveredWeight} kg recovered` },
    { time: t(55), type: "DOWNSTREAM_TRANSFER", detail: `${payload.downstreamWeight} kg transferred` },
    { time: t(62), type: "TELEMETRY_SNAPSHOT", detail: `${payload.energyUsed} kWh / ${payload._telemetry.temperature}°C` },
  ];
}
