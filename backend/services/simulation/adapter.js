const { ingest } = require('../evidence/ingest');

async function pushSimulationEvents(simEvent) {
  const { batchId, timestamp, inputWeight, processedWeight, recoveredWeight, residueWeight, downstreamWeight, machineRuntime, energyUsed, temperature, status } = simEvent;
  
  const baseEvent = { batchId, timestamp: timestamp || new Date().toISOString(), source: 'Simulator', origin: 'simulation' };
  
  const events = [];
  
  // Weighbridge
  events.push({ ...baseEvent, type: 'weighbridge', data: { weight: inputWeight, unit: 'kg' } });
  
  // Processing Log
  events.push({
    ...baseEvent,
    type: 'processing_log',
    data: {
      inputWeight,
      processedWeight,
      outputWeight: processedWeight,
      machineRuntime,
      energyUsed,
      temperature,
      unit: 'kg',
    },
  });
  
  // Output Record
  events.push({ ...baseEvent, type: 'output_record', data: { recoveredWeight, residueWeight, unit: 'kg' } });
  
  // Downstream Invoice
  events.push({ ...baseEvent, source: 'Buyer', type: 'downstream_invoice', data: { quantity: downstreamWeight, unit: 'kg' } });
  
  // Telemetry
  events.push({ ...baseEvent, type: 'telemetry', data: { machineRuntime, energyUsed, temperature, status } });

  const ingested = [];
  for (const ev of events) {
    const result = await ingest(ev);
    ingested.push(result);
  }
  
  return ingested;
}

module.exports = { pushSimulationEvents };
