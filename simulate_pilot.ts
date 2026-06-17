
import fs from 'fs';
import path from 'path';

const MERCHANT_API_URL = 'http://localhost:3001/api';
const USSD_GATEWAY_URL = 'http://localhost:3002/ussd';
const NUM_MERCHANTS = 500;
const SIMULATION_DATA_DIR = '/home/team/shared/simulation_data';

if (!fs.existsSync(SIMULATION_DATA_DIR)) {
  fs.mkdirSync(SIMULATION_DATA_DIR, { recursive: true });
}

async function simulateMerchant(index: number, buyerPhone: string, buyerId: string) {
  const phone = `+254700000${index.toString().padStart(3, '0')}`;
  const name = `Merchant ${index}`;
  const businessName = `Business ${index}`;
  const country = 'KE';

  const results: any[] = [];

  try {
    // 1. Register (Merchant API)
    let start = Date.now();
    let res = await fetch(`${MERCHANT_API_URL}/merchants/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, country, name, businessName })
    });
    results.push({ op: 'register', latency: Date.now() - start, success: res.ok });
    const merchantId = (await res.json()).data?.id;

    if (!merchantId) throw new Error('Registration failed');

    // 2. Activate (Merchant API)
    start = Date.now();
    res = await fetch(`${MERCHANT_API_URL}/merchants/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone })
    });
    results.push({ op: 'activate', latency: Date.now() - start, success: res.ok });

    // 3. USSD Menu Navigation (Simulation of several steps)
    const sessionId = `sim-session-${index}`;
    
    // Step 1: Welcome (Dial *483#)
    start = Date.now();
    res = await fetch(USSD_GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, phoneNumber: phone, text: '', serviceCode: '*483#' })
    });
    results.push({ op: 'ussd_welcome', latency: Date.now() - start, success: res.ok });

    // Step 2: New Trade (Select 1)
    start = Date.now();
    res = await fetch(USSD_GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, phoneNumber: phone, text: '1', serviceCode: '*483#' })
    });
    results.push({ op: 'ussd_new_trade', latency: Date.now() - start, success: res.ok });

    // Step 3: Enter Buyer Phone
    start = Date.now();
    res = await fetch(USSD_GATEWAY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, phoneNumber: phone, text: `1*${buyerPhone}`, serviceCode: '*483#' })
    });
    results.push({ op: 'ussd_buyer_phone', latency: Date.now() - start, success: res.ok });

    // 4. Create Trade (Merchant API - simulating what the USSD gateway would eventually trigger)
    start = Date.now();
    res = await fetch(`${MERCHANT_API_URL}/trades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sellerId: merchantId,
        buyerId: buyerId,
        amount: '5000',
        fiatEquivalent: 5000,
        fiatCurrency: 'KES',
        description: `Trade ${index}`
      })
    });
    results.push({ op: 'create_trade', latency: Date.now() - start, success: res.ok });

  } catch (error: any) {
    results.push({ op: 'error', message: error.message });
  }

  return results;
}

async function main() {
    const logFile = fs.createWriteStream(path.join(SIMULATION_DATA_DIR, 'simulation.log'));
    const log = (msg: string) => {
        console.log(msg);
        logFile.write(msg + '\n');
    };

    log(`Initializing Pilot Simulation at ${new Date().toISOString()}`);

    // Register a buyer first
    const buyerPhone = '+254799999999';
    await fetch(`${MERCHANT_API_URL}/merchants/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: buyerPhone, country: 'KE', name: 'Buyer', businessName: 'Buyer Inc' })
    });
    const buyerRes = await fetch(`${MERCHANT_API_URL}/merchants/phone/${buyerPhone}`);
    const buyerData = await buyerRes.json();
    const buyerId = buyerData.data?.id;
    log(`Common Buyer ID: ${buyerId}`);

    log(`Simulating ${NUM_MERCHANTS} concurrent merchants...`);
    const allResults = [];
    
    const batchSize = 25; // Smaller batches for reliability
    for (let i = 0; i < NUM_MERCHANTS; i += batchSize) {
        const batch = [];
        for (let j = i; j < i + batchSize && j < NUM_MERCHANTS; j++) {
            batch.push(simulateMerchant(j, buyerPhone));
        }
        log(`Executing batch ${i / batchSize + 1}/${NUM_MERCHANTS / batchSize}...`);
        const batchResults = await Promise.all(batch);
        allResults.push(...batchResults);
    }

    const flatResults = allResults.flat();
    fs.writeFileSync(path.join(SIMULATION_DATA_DIR, 'raw_results.json'), JSON.stringify(flatResults, null, 2));

    const latencies = flatResults.filter(r => r.latency !== undefined).map(r => r.latency);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const errors = flatResults.filter(r => r.op === 'error' || r.success === false);

    const summary = {
        simulation_timestamp: new Date().toISOString(),
        total_merchants: NUM_MERCHANTS,
        total_requests: flatResults.length,
        avg_latency_ms: Math.round(avgLatency),
        max_latency_ms: Math.max(...latencies),
        min_latency_ms: Math.min(...latencies),
        error_count: errors.length,
        error_rate: (errors.length / flatResults.length) * 100,
    };

    fs.writeFileSync(path.join(SIMULATION_DATA_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
    log('Simulation complete.');
    log(JSON.stringify(summary, null, 2));
    logFile.end();
}

main().catch(console.error);
