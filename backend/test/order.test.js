const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const http = require('http');
const app = require('../src/app');
const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

let server;
let baseUrl;
const results = [];

function recordTest(title, passed, details = '') {
  results.push({ title, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${title}${details ? ` -> ${details}` : ''}`);
}

async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (e) { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);
    if (body) { req.write(JSON.stringify(body)); }
    req.end();
  });
}

async function runOrderTests() {
  console.log('\n======================================================');
  console.log('🛒 Starting Ninjacart Order API Tests');
  console.log('======================================================\n');

  try {
    // 1. Start Server
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        recordTest('1. Express server starts successfully', true, `Listening on port ${port}`);
        resolve();
      });
    });

    // 2. DB Connection
    await prisma.$connect();
    recordTest('2. PostgreSQL connection works', true, 'Connected to DB');

    // 3. Setup Test Data (Farmer, Retailer, Produce)
    const farmerUser = await prisma.user.create({
      data: {
        name: 'Order Test Farmer',
        email: `farmer_${Date.now()}@test.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'FARMER',
        farmer: { create: {} },
      }
    });

    const retailerUser = await prisma.user.create({
      data: {
        name: 'Order Test Retailer',
        email: `retailer_${Date.now()}@test.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'RETAILER',
        retailer: { create: { storeName: 'Fresh Mart' } },
      },
      include: { retailer: true }
    });

    // Login retailer
    const loginRes = await request('POST', '/api/auth/login', {
      email: retailerUser.email,
      password: 'password123',
    });
    const retailerToken = loginRes.body.data.token;

    // Login farmer
    const farmerLoginRes = await request('POST', '/api/auth/login', {
      email: farmerUser.email,
      password: 'password123',
    });
    const farmerToken = farmerLoginRes.body.data.token;

    // Create a produce with 100 units
    const producePayload = {
      name: 'Order Test Apples',
      category: 'FRUITS',
      price: 50.0,
      unit: 'kg',
      quantity: 100,
    };
    
    const produceRes = await request('POST', '/api/produce', producePayload, {
      Authorization: `Bearer ${farmerToken}`
    });
    const produceId = produceRes.body.data.id;

    // --- TESTS ---

    // Test A: Farmer cannot create order (403 Forbidden)
    const farmerOrderRes = await request('POST', '/api/orders', {
      items: [{ produceId, quantity: 10 }]
    }, { Authorization: `Bearer ${farmerToken}` });
    const farmerOrderValid = farmerOrderRes.status === 403;
    recordTest('3. Order creation fails for Farmer (403 Forbidden)', farmerOrderValid, JSON.stringify(farmerOrderRes.body));

    // Test B: Retailer orders 10 units (Success)
    const order1Res = await request('POST', '/api/orders', {
      items: [{ produceId, quantity: 10 }],
      deliveryAddress: '123 Market St',
      notes: 'Please pack well'
    }, { Authorization: `Bearer ${retailerToken}` });
    
    const order1Valid = order1Res.status === 201 && order1Res.body.data.totalAmount === 500 && order1Res.body.data.items.length === 1;
    recordTest('4. Order 10 units succeeds', order1Valid, order1Valid ? `Order Total: ${order1Res.body.data.totalAmount}` : JSON.stringify(order1Res.body));

    // Verify produce quantity dropped to 90
    const checkProduce1 = await prisma.produce.findUnique({ where: { id: produceId } });
    recordTest('5. Produce quantity decremented correctly (100 -> 90)', checkProduce1.quantity === 90, `Current quantity: ${checkProduce1.quantity}`);

    // Test C: Concurrent order simulation using Promise.all (Retailer tries to buy 50 units twice at the exact same time)
    // The current quantity is 90. Two concurrent requests for 50 each total 100. One should succeed, one should fail.
    const concurrentPayload = { items: [{ produceId, quantity: 50 }] };
    const req1 = request('POST', '/api/orders', concurrentPayload, { Authorization: `Bearer ${retailerToken}` });
    const req2 = request('POST', '/api/orders', concurrentPayload, { Authorization: `Bearer ${retailerToken}` });
    
    const [res1, res2] = await Promise.all([req1, req2]);
    
    const successCount = [res1, res2].filter(r => r.status === 201).length;
   // Explicitly expecting 409 Conflict as per the requirement
const thirdOrderRejected = resC.status === 409 && resC.body?.success === false;

    const concurrencyValid = successCount === 1 && failCount === 1;
    recordTest('6. Concurrency safe: Only one of two concurrent requests for 50 units succeeds (90 available)', concurrencyValid, `Successes: ${successCount}, Fails: ${failCount}`);

    // Verify produce quantity is now 40
    const checkProduce2 = await prisma.produce.findUnique({ where: { id: produceId } });
    recordTest('7. Produce quantity decremented correctly after concurrent requests (90 -> 40)', checkProduce2.quantity === 40, `Current quantity: ${checkProduce2.quantity}`);

    // Test D: Order exactly the remaining 40 units (status should flip to OUT_OF_STOCK)
    const order3Res = await request('POST', '/api/orders', {
      items: [{ produceId, quantity: 40 }]
    }, { Authorization: `Bearer ${retailerToken}` });
    
    const order3Valid = order3Res.status === 201;
    recordTest('8. Order remaining 40 units succeeds', order3Valid, order3Valid ? 'Order created' : JSON.stringify(order3Res.body));

    const checkProduce3 = await prisma.produce.findUnique({ where: { id: produceId } });
    const statusFlipped = checkProduce3.quantity === 0 && checkProduce3.status === 'OUT_OF_STOCK';
    recordTest('9. Produce status flipped to OUT_OF_STOCK upon reaching 0 quantity', statusFlipped, `Status: ${checkProduce3.status}, Quantity: ${checkProduce3.quantity}`);

  } catch (error) {
    console.error('❌ Verification failed with error:', error);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();

    console.log('\n======================================================');
    const passed = results.filter((r) => r.passed).length;
    console.log(`📊 Summary: Total: ${results.length} | Passed: ${passed} | Failed: ${results.length - passed}`);
    console.log('======================================================\n');
    
    if (passed === results.length) { process.exit(0); } else {
      process.exit(1);
    }
  }
}

runOrderTests();
