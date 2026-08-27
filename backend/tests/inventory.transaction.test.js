const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const http = require('http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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

async function request(method, routePath, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(routePath, baseUrl);
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

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'test_jwt_secret_ninjacart_dev';
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    secret,
    { expiresIn: '1h' }
  );
}

async function runConcurrencyTest() {
  console.log('\n================================================================');
  console.log('🧪 Simulating 2 Simultaneous Orders for the Last Unit of Stock');
  console.log('================================================================\n');

  try {
    // 1. Ensure JWT_SECRET
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test_jwt_secret_ninjacart_dev';
    }

    // 2. Connect Database & Start Server
    await prisma.$connect();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    recordTest('1. Test Server and DB initialized', true, `Port ${port}`);

    // 3. Clean up any previous test users & produce
    const cleanupEmails = [
      'farmer_concurrency@example.com',
      'retailer_a@example.com',
      'retailer_b@example.com',
    ];
    await prisma.orderItem.deleteMany({
      where: { order: { retailer: { user: { email: { in: cleanupEmails } } } } },
    });
    await prisma.order.deleteMany({
      where: { retailer: { user: { email: { in: cleanupEmails } } } },
    });
    await prisma.produce.deleteMany({
      where: { farmer: { user: { email: { in: cleanupEmails } } } },
    });
    await prisma.farmer.deleteMany({
      where: { user: { email: { in: cleanupEmails } } },
    });
    await prisma.retailer.deleteMany({
      where: { user: { email: { in: cleanupEmails } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: cleanupEmails } },
    });

    const hashedPassword = await bcrypt.hash('SecurePass123!', 10);

    // 4. Create 1 Farmer
    const farmerUser = await prisma.user.create({
      data: {
        name: 'Suresh Kumar',
        email: 'farmer_concurrency@example.com',
        password: hashedPassword,
        role: 'FARMER',
        farmer: {
          create: {
            phone: '9876543210',
            location: 'Nashik, Maharashtra',
          },
        },
      },
      include: { farmer: true },
    });

    // 5. Create 2 Distinct Retailers
    const retailerUserA = await prisma.user.create({
      data: {
        name: 'Retailer Alpha Store',
        email: 'retailer_a@example.com',
        password: hashedPassword,
        role: 'RETAILER',
        retailer: {
          create: {
            storeName: 'Alpha Supermarket',
            phone: '9123456780',
            location: 'Bangalore East',
          },
        },
      },
      include: { retailer: true },
    });

    const retailerUserB = await prisma.user.create({
      data: {
        name: 'Retailer Beta Mart',
        email: 'retailer_b@example.com',
        password: hashedPassword,
        role: 'RETAILER',
        retailer: {
          create: {
            storeName: 'Beta Fresh Mart',
            phone: '9123456781',
            location: 'Bangalore West',
          },
        },
      },
      include: { retailer: true },
    });

    const tokenA = generateToken(farmerUser ? retailerUserA : null);
    const tokenB = generateToken(retailerUserB);

    recordTest('2. Created Farmer and 2 Concurrent Retailers', true, 'Retailer A & Retailer B ready');

    // 6. Seed exactly 1 unit of stock (quantity = 1)
    const produceItem = await prisma.produce.create({
      data: {
        name: 'Premium Shimla Apple (Last Unit)',
        description: 'Single remaining stock item for concurrency testing',
        category: 'FRUITS',
        price: 180.0,
        unit: 'kg',
        quantity: 1.0, // EXACTLY 1 UNIT IN STOCK
        minOrderQuantity: 1.0,
        status: 'AVAILABLE',
        farmerId: farmerUser.farmer.id,
      },
    });

    recordTest(
      '3. Initialized produce stock = 1 unit',
      produceItem.quantity === 1.0 && produceItem.status === 'AVAILABLE',
      `Produce ID: ${produceItem.id}, Initial Qty: ${produceItem.quantity}`
    );

    // 7. Fire two SIMULTANEOUS order placement requests for quantity = 1
    console.log('\n⚡ Dispatching 2 Simultaneous Orders for 1 Unit of stock...\n');

    const orderPayload = {
      items: [
        {
          produceId: produceItem.id,
          quantity: 1.0,
        },
      ],
      deliveryAddress: '123 Main Street, Wholesale Hub',
      notes: 'Urgent delivery needed',
    };

    const startTime = Date.now();
    const [resA, resB] = await Promise.all([
      request('POST', '/api/orders', orderPayload, {
        Authorization: `Bearer ${tokenA}`,
      }),
      request('POST', '/api/orders', orderPayload, {
        Authorization: `Bearer ${tokenB}`,
      }),
    ]);
    const duration = Date.now() - startTime;

    console.log(`⏱️ Both requests finished in ${duration}ms`);
    console.log(`📦 Response A -> Status: ${resA.status}, Body: ${JSON.stringify(resA.body)}`);
    console.log(`📦 Response B -> Status: ${resB.status}, Body: ${JSON.stringify(resB.body)}`);

    // 8. Assertions on Concurrency Outcomes
    const successResponses = [resA, resB].filter((r) => r.status === 201 && r.body?.success === true);
    const failedResponses = [resA, resB].filter((r) => r.status === 400 && r.body?.success === false);

    const exactlyOneSucceeded = successResponses.length === 1;
    const exactlyOneFailed = failedResponses.length === 1;

    recordTest(
      '4. Exactly ONE concurrent order succeeded with HTTP 201',
      exactlyOneSucceeded,
      `Success count: ${successResponses.length}/2`
    );

    recordTest(
      '5. Exactly ONE concurrent order failed with HTTP 400 (Insufficient Stock)',
      exactlyOneFailed,
      `Failure count: ${failedResponses.length}/2, Error: "${failedResponses[0]?.body?.error}"`
    );

    // 9. Inspect Database State
    const updatedProduce = await prisma.produce.findUnique({
      where: { id: produceItem.id },
    });

    const stockIsZero = updatedProduce.quantity === 0;
    const statusIsOutOfStock = updatedProduce.status === 'OUT_OF_STOCK';

    recordTest(
      '6. Produce quantity in database is exactly 0 (no negative stock)',
      stockIsZero,
      `Current DB Quantity: ${updatedProduce.quantity}`
    );

    recordTest(
      '7. Produce status automatically updated to OUT_OF_STOCK',
      statusIsOutOfStock,
      `Current DB Status: ${updatedProduce.status}`
    );

    // 10. Check total order records created
    const totalOrdersCreated = await prisma.order.count({
      where: {
        retailerId: { in: [retailerUserA.retailer.id, retailerUserB.retailer.id] },
      },
    });

    recordTest(
      '8. Exactly 1 Order record persisted in database',
      totalOrdersCreated === 1,
      `Total DB Orders: ${totalOrdersCreated}`
    );

    // 11. Attempt a 3rd subsequent order when stock is 0
    const resC = await request('POST', '/api/orders', orderPayload, {
      Authorization: `Bearer ${tokenA}`,
    });

    const thirdOrderRejected = resC.status === 400 && resC.body?.success === false;
    recordTest(
      '9. Subsequent order request after stock exhaustion is rejected',
      thirdOrderRejected,
      `Status: ${resC.status}, Error: "${resC.body?.error}"`
    );

    // Cleanup test records
    await prisma.orderItem.deleteMany({
      where: { order: { retailer: { user: { email: { in: cleanupEmails } } } } },
    });
    await prisma.order.deleteMany({
      where: { retailer: { user: { email: { in: cleanupEmails } } } },
    });
    await prisma.produce.deleteMany({
      where: { id: produceItem.id },
    });
    await prisma.farmer.deleteMany({
      where: { user: { email: { in: cleanupEmails } } },
    });
    await prisma.retailer.deleteMany({
      where: { user: { email: { in: cleanupEmails } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: cleanupEmails } },
    });

    console.log('\n================================================================');
    const allPassed = results.every((r) => r.passed);
    if (allPassed) {
      console.log('🎉 ALL CONCURRENCY TEST ASSERTIONS PASSED SUCCESSFULLY!');
    } else {
      console.log('❌ SOME CONCURRENCY TESTS FAILED!');
    }
    console.log('================================================================\n');

    return allPassed;
  } catch (error) {
    console.error('❌ Test suite encountered unhandled error:', error);
    return false;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

// Execute directly if run with `node tests/inventory.transaction.test.js`
if (require.main === module) {
  runConcurrencyTest().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}

module.exports = { runConcurrencyTest };
