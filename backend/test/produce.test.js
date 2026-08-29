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
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runProduceTests() {
  console.log('\n======================================================');
  console.log('🍅 Starting Ninjacart Produce API Tests');
  console.log('======================================================\n');

  try {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    recordTest('1. Express server starts successfully', true, `Listening on port ${port}`);

    await prisma.$connect();
    recordTest('2. PostgreSQL connection works', true, 'Connected to DB');

    // Clean up only test records
    const testEmails = ['test.farmer@example.com', 'test.retailer@example.com'];
    await prisma.orderItem.deleteMany({ where: { order: { retailer: { user: { email: { in: testEmails } } } } } });
    await prisma.order.deleteMany({ where: { retailer: { user: { email: { in: testEmails } } } } });
    await prisma.produce.deleteMany({ where: { farmer: { user: { email: { in: testEmails } } } } });
    await prisma.farmer.deleteMany({ where: { user: { email: { in: testEmails } } } });
    await prisma.retailer.deleteMany({ where: { user: { email: { in: testEmails } } } });
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });

    // Register a Farmer
    const farmerRegPayload = {
      name: 'Test Farmer',
      email: 'test.farmer@example.com',
      password: 'password123',
      role: 'FARMER',
    };
    await request('POST', '/api/auth/register', farmerRegPayload);
    
    const loginRes = await request('POST', '/api/auth/login', {
      email: farmerRegPayload.email,
      password: farmerRegPayload.password,
    });
    const farmerToken = loginRes.body?.data?.token;
    
    // Register a Retailer
    const retailerRegPayload = {
      name: 'Test Retailer',
      email: 'test.retailer@example.com',
      password: 'password123',
      role: 'RETAILER',
    };
    await request('POST', '/api/auth/register', retailerRegPayload);
    const loginRetailerRes = await request('POST', '/api/auth/login', {
      email: retailerRegPayload.email,
      password: retailerRegPayload.password,
    });
    const retailerToken = loginRetailerRes.body?.data?.token;

    // Test POST /api/produce
    const producePayload = {
      name: 'Fresh Tomatoes',
      price: 40.5,
      quantity: 100,
      category: 'Vegetables',
      image: 'tomato.jpg'
    };

    // 1. Create produce (Success)
    const createRes = await request('POST', '/api/produce', producePayload, {
      Authorization: `Bearer ${farmerToken}`
    });
    const createValid = createRes.status === 201 && 
      createRes.body.success === true && 
      createRes.body.data.name === 'Fresh Tomatoes' &&
      createRes.body.data.status === 'AVAILABLE';
    recordTest('3. Create Produce (POST /produce) succeeds for Farmer', createValid, JSON.stringify(createRes.body));
    
    const produceId = createRes.body.data.id;

    // 2. Retailer tries to create produce (Forbidden)
    const createRetailerRes = await request('POST', '/api/produce', producePayload, {
      Authorization: `Bearer ${retailerToken}`
    });
    const createRetailerValid = createRetailerRes.status === 403;
    recordTest('4. Create Produce fails for Retailer (403 Forbidden)', createRetailerValid, JSON.stringify(createRetailerRes.body));

    // 3. Create produce with invalid fields (Validation Error)
    const invalidProducePayload = { ...producePayload, price: -10 };
    const createInvalidRes = await request('POST', '/api/produce', invalidProducePayload, {
      Authorization: `Bearer ${farmerToken}`
    });
    const createInvalidValid = createInvalidRes.status === 400 && createInvalidRes.body.success === false;
    recordTest('5. Create Produce validation fails for negative price (400 Bad Request)', createInvalidValid, JSON.stringify(createInvalidRes.body));

    // 4. Create produce with 0 quantity sets status to OUT_OF_STOCK
    const soldOutPayload = { ...producePayload, quantity: 0, name: 'Onions' };
    const createSoldOutRes = await request('POST', '/api/produce', soldOutPayload, {
      Authorization: `Bearer ${farmerToken}`
    });
    const createSoldOutValid = createSoldOutRes.status === 201 && createSoldOutRes.body.data.status === 'OUT_OF_STOCK';
    recordTest('6. Create Produce with 0 quantity sets status to OUT_OF_STOCK', createSoldOutValid, JSON.stringify(createSoldOutRes.body));

    // Test PATCH /api/produce/:id
    
    // 5. Update produce (Success)
    const updatePayload = {
      price: 50.0,
      quantity: 50
    };
    const updateRes = await request('PATCH', `/api/produce/${produceId}`, updatePayload, {
      Authorization: `Bearer ${farmerToken}`
    });
    const updateValid = updateRes.status === 200 &&
      updateRes.body.data.price === 50 &&
      updateRes.body.data.quantity === 50;
    recordTest('7. Update Produce (PATCH /produce/:id) succeeds', updateValid, JSON.stringify(updateRes.body));

    // 6. Update produce to 0 quantity changes status to OUT_OF_STOCK
    const updateToZeroRes = await request('PATCH', `/api/produce/${produceId}`, { quantity: 0 }, {
      Authorization: `Bearer ${farmerToken}`
    });
    const updateToZeroValid = updateToZeroRes.status === 200 && updateToZeroRes.body.data.status === 'OUT_OF_STOCK';
    recordTest('8. Update Produce to 0 quantity changes status to OUT_OF_STOCK', updateToZeroValid, JSON.stringify(updateToZeroRes.body));

    // 7. Update produce back to positive quantity changes status to AVAILABLE
    const updateToPositiveRes = await request('PATCH', `/api/produce/${produceId}`, { quantity: 10 }, {
      Authorization: `Bearer ${farmerToken}`
    });
    const updateToPositiveValid = updateToPositiveRes.status === 200 && updateToPositiveRes.body.data.status === 'AVAILABLE';
    recordTest('9. Update Produce to positive quantity changes status to AVAILABLE', updateToPositiveValid, JSON.stringify(updateToPositiveRes.body));

    // 8. Update produce validation error
    const updateInvalidRes = await request('PATCH', `/api/produce/${produceId}`, { price: -5 }, {
      Authorization: `Bearer ${farmerToken}`
    });
    const updateInvalidValid = updateInvalidRes.status === 400;
    recordTest('10. Update Produce validation fails for negative price (400 Bad Request)', updateInvalidValid, JSON.stringify(updateInvalidRes.body));

    // 9. Retailer tries to update produce (Forbidden)
    const updateRetailerRes = await request('PATCH', `/api/produce/${produceId}`, { price: 60 }, {
      Authorization: `Bearer ${retailerToken}`
    });
    // the route has authorizeRole('FARMER') so it will return 403
    const updateRetailerValid = updateRetailerRes.status === 403;
    recordTest('11. Update Produce fails for Retailer (403 Forbidden)', updateRetailerValid, JSON.stringify(updateRetailerRes.body));

    console.log('\n======================================================');
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = total - passed;
    console.log(`📊 Summary: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log('======================================================\n');

    if (failed === 0) { process.exit(0); } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Verification failed with error:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

runProduceTests();
