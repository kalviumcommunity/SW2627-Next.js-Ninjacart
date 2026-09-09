const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const http = require('http');
const app = require('../src/app');
const prisma = require('../src/config/db');

let server;
let baseUrl;
const results = [];

function recordTest(title, passed, details = '') {
  results.push({ title, passed, details });
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${title}${details ? ` -> ${details}` : ''}`);
}

async function request(method, reqPath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, baseUrl);
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

async function runTests() {
  console.log('\n🚀 Starting Produce & Upload Integration Tests...\n');

  try {
    // Start temporary test server
    const testPort = 5055;
    server = app.listen(testPort);
    baseUrl = `http://localhost:${testPort}`;

    // 1. Health check
    const healthRes = await request('GET', '/api/health');
    recordTest('1. Health check endpoint responds with 200', healthRes.status === 200 && healthRes.body.success === true);

    // 2. Public catalogue endpoint responds with paginated data
    const catRes = await request('GET', '/api/produce?page=1&limit=10');
    recordTest('2. Public catalogue GET /api/produce returns 200 with pagination structure', 
      catRes.status === 200 && 
      catRes.body.success === true && 
      Array.isArray(catRes.body.data?.produces) && 
      typeof catRes.body.data?.pagination === 'object'
    );

    // 3. Register a test farmer
    const timestamp = Date.now();
    const farmerEmail = `farmer_${timestamp}@ninjacart.test`;
    const regFarmerRes = await request('POST', '/api/auth/register', {
      name: 'Test Farmer',
      email: farmerEmail,
      password: 'Password@123',
      role: 'FARMER',
    });
    recordTest('3. Register test farmer returns 201', regFarmerRes.status === 201);

    // Login farmer
    const loginFarmerRes = await request('POST', '/api/auth/login', {
      email: farmerEmail,
      password: 'Password@123',
    });
    const farmerToken = loginFarmerRes.body?.data?.token;
    recordTest('4. Farmer login returns JWT', !!farmerToken);

    // 4. Register a test retailer
    const retailerEmail = `retailer_${timestamp}@ninjacart.test`;
    await request('POST', '/api/auth/register', {
      name: 'Test Retailer',
      email: retailerEmail,
      password: 'Password@123',
      role: 'RETAILER',
    });
    const loginRetailerRes = await request('POST', '/api/auth/login', {
      email: retailerEmail,
      password: 'Password@123',
    });
    const retailerToken = loginRetailerRes.body?.data?.token;

    // 5. Cloudinary signature endpoint
    const sigRes = await request('GET', '/api/upload/signature', null, {
      Authorization: `Bearer ${farmerToken}`,
    });
    recordTest('5. GET /api/upload/signature returns signature, timestamp, and folder', 
      sigRes.status === 200 && 
      sigRes.body.success === true && 
      !!sigRes.body.data?.signature && 
      !!sigRes.body.data?.timestamp
    );

    // 6. Farmer can create produce item
    const createProduceRes = await request('POST', '/api/produce', {
      name: 'Fresh Organic Bell Peppers',
      description: 'Green and crisp',
      category: 'VEGETABLES',
      price: 45.5,
      unit: 'kg',
      quantity: 150,
      minOrderQuantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-test',
      imagePublicId: 'ninjacart/produce/test_img_123',
      status: 'AVAILABLE',
    }, {
      Authorization: `Bearer ${farmerToken}`,
    });
    const createdProduceId = createProduceRes.body?.data?.id;
    recordTest('6. Farmer POST /api/produce creates item with image and returns 201', 
      createProduceRes.status === 201 && 
      createProduceRes.body.success === true && 
      createProduceRes.body.data.name === 'Fresh Organic Bell Peppers' &&
      createProduceRes.body.data.imageUrl === 'https://images.unsplash.com/photo-test'
    );

    // 7. Retailer cannot create produce (403 Forbidden)
    const retailerCreateRes = await request('POST', '/api/produce', {
      name: 'Illegal produce item',
      price: 20,
    }, {
      Authorization: `Bearer ${retailerToken}`,
    });
    recordTest('7. Retailer attempting to POST /api/produce returns 403 Forbidden', retailerCreateRes.status === 403);

    // 8. Fetch single produce item by ID
    const getSingleRes = await request('GET', `/api/produce/${createdProduceId}`);
    recordTest('8. GET /api/produce/:id returns single produce item with farmer details', 
      getSingleRes.status === 200 && 
      getSingleRes.body.data?.id === createdProduceId &&
      !!getSingleRes.body.data?.farmer
    );

    // 9. Update produce item
    const updateRes = await request('PATCH', `/api/produce/${createdProduceId}`, {
      price: 49.99,
      quantity: 120,
      status: 'AVAILABLE',
    }, {
      Authorization: `Bearer ${farmerToken}`,
    });
    recordTest('9. Farmer PUT /api/produce/:id updates price and quantity', 
      updateRes.status === 200 && 
      updateRes.body.data?.price === 49.99 &&
      updateRes.body.data?.quantity === 120
    );

    // 10. Filter produce by status and pagination
    const filterRes = await request('GET', '/api/produce?status=AVAILABLE&category=VEGETABLES&page=1&limit=5');
    recordTest('10. GET /api/produce filters by indexed status & category', 
      filterRes.status === 200 && 
      filterRes.body.data.produces.length > 0 &&
      filterRes.body.data.produces.every(p => p.status === 'AVAILABLE' && p.category === 'VEGETABLES')
    );

    // Summary
    console.log('\n======================================================');
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    console.log(`📊 Summary: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log('======================================================\n');

    // Clean up test records
    try {
      if (createdProduceId) {
        await prisma.produce.delete({ where: { id: createdProduceId } });
      }
      await prisma.user.deleteMany({
        where: { email: { in: [farmerEmail, retailerEmail] } },
      });
    } catch (e) {
      // ignore cleanup error
    }

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    if (server) server.close();
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
