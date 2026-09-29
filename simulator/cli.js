const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

function noise(base, variance) {
  return base + (Math.random() * variance * 2 - variance);
}

async function run() {
  const argv = yargs(hideBin(process.argv))
    .option('scenario', { type: 'string', default: 'NORMAL' })
    .option('batch', { type: 'string', default: 'CP-RAND-1' })
    .argv;
    
  console.log(`Running simulator for batch ${argv.batch} with scenario ${argv.scenario}`);
  
  // Randomize base inputs
  const inputWeight = Math.round(noise(1000, 100)); // 900 - 1100
  const processedWeight = Math.round(inputWeight * noise(0.95, 0.02)); // ~95%
  let recoveredWeight, downstreamWeight;
  
  if (argv.scenario === 'INCONSISTENT') {
     recoveredWeight = Math.round(processedWeight * 0.98); 
     downstreamWeight = Math.round(recoveredWeight * 0.70);
  } else {
     recoveredWeight = Math.round(processedWeight * 0.75); 
     downstreamWeight = Math.round(recoveredWeight * 0.99); 
  }
  
  const machineRuntime = Math.round(noise(180, 20));
  const energyUsed = Number(noise(32, 5).toFixed(1));

  try {
    const payload = {
      batchId: argv.batch,
      material: 'plastic',
      inputWeight,
      processedWeight,
      recoveredWeight,
      downstreamWeight,
      machineRuntime,
      energyUsed,
      scenario: argv.scenario
    };
    
    console.log('Sending randomized simulation data:', payload);
    const res = await axios.post('http://127.0.0.1:4000/api/simulation/generate', payload);
    console.log('Generated events successfully.');
    
    if (argv.scenario === 'TAMPERED') {
      console.log('Tampering with evidence...');
      const tamperRes = await axios.post(`http://127.0.0.1:4000/api/simulation/tamper/${argv.batch}`);
      console.log(tamperRes.data);
    }
  } catch (error) {
    if (error.response) {
      console.error('Simulation failed with status', error.response.status, ':', error.response.data);
    } else {
      console.error('Simulation failed:', error.message);
    }
  }
}

run();
