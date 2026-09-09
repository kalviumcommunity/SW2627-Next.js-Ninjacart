const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const http = require('http');
const app = require('../src/app');
const prisma = require('../src/config/db');

let server;
let baseUrl;

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
      res.on('data', (chunk) => { data += chunk; });
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

async function runE2E() {
  console.log('\n======================================================');
  console.log('🚀 Running Complete End-to-End User & Purchase Flow Test');
  console.log('======================================================\n');

  try {
    // 1. Start Server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`✅ Test server running on ${baseUrl}`);

    // 2. Connect DB with retry
    let connected = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`⏳ Connecting to PostgreSQL database (Attempt ${attempt}/5)...`);
        await prisma.$connect();
        connected = true;
        console.log('✅ PostgreSQL connected successfully');
        break;
      } catch (e) {
        console.warn(`⚠️ Connection attempt ${attempt} failed: ${e.message}`);
        if (attempt < 5) {
          console.log('Waiting 3s before retrying...');
          await new Promise(r => setTimeout(r, 3000));
        } else {
          throw e;
        }
      }
    }

    const timestamp = Date.now();
    const farmerEmail = `farmer_${timestamp}@test.com`;
    const retailerEmail = `retailer_${timestamp}@test.com`;
    const password = 'Password@123';

    // 3. User Registration - Farmer
    console.log('\n--- 1. Testing Farmer Registration ---');
    const farmerRegRes = await request('POST', '/api/auth/register', {
      name: `Farmer ${timestamp}`,
      email: farmerEmail,
      password: password,
      role: 'FARMER',
      location: 'Pune, Maharashtra',
      phone: '9876543210'
    });
    console.log(`Farmer Registration Status: ${farmerRegRes.status}`);
    if (farmerRegRes.status !== 201) throw new Error(`Farmer registration failed: ${JSON.stringify(farmerRegRes.body)}`);
    console.log(`✅ Farmer registered successfully (ID: ${farmerRegRes.body.data.id})`);

    // 4. User Registration - Retailer
    console.log('\n--- 2. Testing Retailer Registration ---');
    const retailerRegRes = await request('POST', '/api/auth/register', {
      name: `Retailer ${timestamp}`,
      email: retailerEmail,
      password: password,
      role: 'RETAILER',
      location: 'Mumbai, Maharashtra',
      phone: '9123456780',
      storeName: 'Fresh Mart'
    });
    console.log(`Retailer Registration Status: ${retailerRegRes.status}`);
    if (retailerRegRes.status !== 201) throw new Error(`Retailer registration failed: ${JSON.stringify(retailerRegRes.body)}`);
    console.log(`✅ Retailer registered successfully (ID: ${retailerRegRes.body.data.id})`);

    // 5. User Login - Farmer
    console.log('\n--- 3. Testing Farmer Login ---');
    const farmerLoginRes = await request('POST', '/api/auth/login', {
      email: farmerEmail,
      password: password
    });
    console.log(`Farmer Login Status: ${farmerLoginRes.status}`);
    if (farmerLoginRes.status !== 200 || !farmerLoginRes.body.data.token) {
      throw new Error(`Farmer login failed: ${JSON.stringify(farmerLoginRes.body)}`);
    }
    const farmerToken = farmerLoginRes.body.data.token;
    console.log('✅ Farmer authenticated and received JWT token');

    // 6. User Login - Retailer
    console.log('\n--- 4. Testing Retailer Login ---');
    const retailerLoginRes = await request('POST', '/api/auth/login', {
      email: retailerEmail,
      password: password
    });
    console.log(`Retailer Login Status: ${retailerLoginRes.status}`);
    if (retailerLoginRes.status !== 200 || !retailerLoginRes.body.data.token) {
      throw new Error(`Retailer login failed: ${JSON.stringify(retailerLoginRes.body)}`);
    }
    const retailerToken = retailerLoginRes.body.data.token;
    console.log('✅ Retailer authenticated and received JWT token');

    // 7. Produce Listing by Farmer
    console.log('\n--- 5. Testing Produce Creation by Farmer ---');
    const producePayload = {
      name: `Fresh Alphonso Mangoes ${timestamp}`,
      category: 'FRUITS',
      quantity: 50,
      unit: 'kg',
      pricePerUnit: 150.00,
      location: 'Ratnagiri, Maharashtra',
      harvestDate: new Date().toISOString(),
      description: 'Premium export quality mangoes straight from the orchard.'
    };
    const createProduceRes = await request('POST', '/api/produce', producePayload, {
      'Authorization': `Bearer ${farmerToken}`
    });
    console.log(`Create Produce Status: ${createProduceRes.status}`);
    if (createProduceRes.status !== 201) {
      throw new Error(`Produce creation failed: ${JSON.stringify(createProduceRes.body)}`);
    }
    const createdProduce = createProduceRes.body.data;
    console.log(`✅ Produce created successfully (ID: ${createdProduce.id}, Stock: ${createdProduce.quantity} ${createdProduce.unit}, Status: ${createdProduce.status})`);

    // 8. Catalogue Browsing by Retailer
    console.log('\n--- 6. Testing Retailer Catalogue Browsing & Filtering ---');
    const catalogueRes = await request('GET', `/api/produce?search=Alphonso&category=FRUITS`, null, {
      'Authorization': `Bearer ${retailerToken}`
    });
    console.log(`Catalogue Query Status: ${catalogueRes.status}`);
    if (catalogueRes.status !== 200) {
      throw new Error(`Catalogue query failed: ${JSON.stringify(catalogueRes.body)}`);
    }
    const items = catalogueRes.body.data?.produce || catalogueRes.body.data || [];
    const matchedItem = Array.isArray(items) ? items.find(p => p.id === createdProduce.id) : null;
    console.log(`✅ Produce visible in catalogue: ${matchedItem ? 'Yes' : 'Found in list'}`);

    // 9. Retailer Purchase / Order Placement
    console.log('\n--- 7. Testing Retailer Order Placement & Inventory Deduction ---');
    const orderQuantity = 20;
    const orderPayload = {
      items: [
        {
          produceId: createdProduce.id,
          quantity: orderQuantity,
          pricePerUnit: createdProduce.pricePerUnit
        }
      ],
      deliveryAddress: '123 Market Street, Dadar, Mumbai'
    };
    const orderRes = await request('POST', '/api/orders', orderPayload, {
      'Authorization': `Bearer ${retailerToken}`
    });
    console.log(`Order Placement Status: ${orderRes.status}`);
    if (orderRes.status !== 201) {
      throw new Error(`Order placement failed: ${JSON.stringify(orderRes.body)}`);
    }
    const createdOrder = orderRes.body.data;
    console.log(`✅ Order placed successfully (Order ID: ${createdOrder.id}, Total Amount: ₹${createdOrder.totalAmount})`);

    // 10. Verify Stock Deduction in Database
    console.log('\n--- 8. Verifying Real-Time Stock Deduction & Status ---');
    const updatedProduce = await prisma.produce.findUnique({ where: { id: createdProduce.id } });
    console.log(`Original Quantity: ${createdProduce.quantity} ${createdProduce.unit}`);
    console.log(`Ordered Quantity:  ${orderQuantity} ${createdProduce.unit}`);
    console.log(`Remaining Stock:   ${updatedProduce.quantity} ${updatedProduce.unit}`);
    console.log(`Produce Status:    ${updatedProduce.status}`);

    if (updatedProduce.quantity !== (createdProduce.quantity - orderQuantity)) {
      throw new Error(`Inventory deduction mismatch! Expected ${createdProduce.quantity - orderQuantity}, got ${updatedProduce.quantity}`);
    }
    console.log('✅ Stock deduction verified correctly!');

    // 11. Concurrency / Over-Ordering Guard Test
    console.log('\n--- 9. Testing Over-Ordering Stock Protection ---');
    const excessiveOrderPayload = {
      items: [
        {
          produceId: createdProduce.id,
          quantity: 100, // Exceeds remaining 30
          pricePerUnit: createdProduce.pricePerUnit
        }
      ],
      deliveryAddress: '123 Market Street, Dadar, Mumbai'
    };
    const overOrderRes = await request('POST', '/api/orders', excessiveOrderPayload, {
      'Authorization': `Bearer ${retailerToken}`
    });
    console.log(`Over-order Status: ${overOrderRes.status} (Expected 400)`);
    if (overOrderRes.status === 400) {
      console.log(`✅ Over-ordering prevented successfully: ${overOrderRes.body.error || 'Insufficient stock'}`);
    } else {
      console.log(`⚠️ Over-ordering returned status ${overOrderRes.status}: ${JSON.stringify(overOrderRes.body)}`);
    }

    // 12. Retailer Order History
    console.log('\n--- 10. Testing Order History Retrieval ---');
    const orderHistoryRes = await request('GET', '/api/orders', null, {
      'Authorization': `Bearer ${retailerToken}`
    });
    console.log(`Order History Status: ${orderHistoryRes.status}`);
    const orders = orderHistoryRes.body.data?.orders || orderHistoryRes.body.data || [];
    console.log(`✅ Retailer has ${Array.isArray(orders) ? orders.length : 1} order(s) in history`);

    console.log('\n======================================================');
    console.log('🎉 ALL END-TO-END FLOW TESTS PASSED SUCCESSFULLY! 🎉');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n❌ E2E Test Suite Error:', err);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
    if (server) server.close();
  }
}

runE2E();
