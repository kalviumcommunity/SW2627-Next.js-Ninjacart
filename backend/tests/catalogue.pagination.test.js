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

async function runCataloguePaginationSuite() {
  console.log('\n========================================================================');
  console.log('🧪 Starting Day 3 Integration & Load Test: Catalogue, Pagination & Indexes');
  console.log('========================================================================\n');

  try {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test_jwt_secret_ninjacart_dev';
    }

    await prisma.$connect();
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    recordTest('1. Test Server initialized', true, `Port ${port}`);

    // Cleanup previous test data
    const testEmail = 'jovab_farmer_test@ninjacart.com';
    await prisma.produce.deleteMany({
      where: { farmer: { user: { email: testEmail } } },
    });
    await prisma.farmer.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });

    const hashedPassword = await bcrypt.hash('Password@123', 10);

    // 2. Create Farmer User
    const farmerUser = await prisma.user.create({
      data: {
        name: 'Jovab Test Farmer',
        email: testEmail,
        password: hashedPassword,
        role: 'FARMER',
        farmer: {
          create: {
            phone: '9876500001',
            location: 'Nashik Valley Farms',
            bio: 'Certified organic farmer producing premium seasonal crops.',
          },
        },
      },
      include: { farmer: true },
    });

    const farmerToken = generateToken(farmerUser);
    recordTest('2. Authenticated Farmer initialized', true, `Farmer ID: ${farmerUser.farmer.id}`);

    // 3. Integration Step: Create a new produce listing via POST /api/produce
    const newProducePayload = {
      name: 'Fresh Hydroponic Lettuce Green',
      description: 'Crisp green butterhead lettuce',
      category: 'HERBS',
      price: 45.0,
      unit: 'kg',
      quantity: 120,
      minOrderQuantity: 5,
      status: 'AVAILABLE',
    };

    const createRes = await request('POST', '/api/produce', newProducePayload, {
      Authorization: `Bearer ${farmerToken}`,
    });

    const createPassed = createRes.status === 201 && createRes.body.success === true && createRes.body.data?.id;
    recordTest(
      '3. Create Produce Listing via POST /api/produce',
      createPassed,
      `ID: ${createRes.body.data?.id}, Status: ${createRes.status}`
    );

    const createdId = createRes.body.data?.id;

    // 4. Confirm created listing appears in catalogue GET /api/produce/:id
    const detailRes = await request('GET', `/api/produce/${createdId}`);
    const detailPassed = detailRes.status === 200 && detailRes.body.data?.name === newProducePayload.name;
    recordTest(
      '4. Confirm listing details accessible via GET /api/produce/:id',
      detailPassed,
      `Retrieved Name: "${detailRes.body.data?.name}"`
    );

    // 5. Bulk Seed 105 Produce listings for Load & Index Verification (100+ items)
    console.log('\n📦 Seeding 105 produce listings for pagination and index benchmark...');
    const bulkProduces = [];
    const categories = ['VEGETABLES', 'FRUITS', 'GRAINS', 'TUBERS', 'HERBS'];

    for (let i = 1; i <= 105; i++) {
      bulkProduces.push({
        farmerId: farmerUser.farmer.id,
        name: `Bulk Test Crop Item #${i.toString().padStart(3, '0')}`,
        description: `Automated load-testing seed produce listing #${i}`,
        category: categories[i % categories.length],
        price: 20.0 + (i % 50),
        unit: i % 2 === 0 ? 'kg' : 'box',
        quantity: i * 5,
        minOrderQuantity: 2,
        status: i % 15 === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE',
        createdAt: new Date(Date.now() - i * 60000), // staggered timestamps for indexing
      });
    }

    await prisma.produce.createMany({
      data: bulkProduces,
    });
    recordTest('5. Bulk seeded 105 listings for pagination load test', true, 'Total seeded: 105 items');

    // 6. Verify Pagination Math: Page 1 with limit = 10
    const page1Res = await request('GET', `/api/produce?limit=10&page=1&farmerId=${farmerUser.farmer.id}`);
    const p1 = page1Res.body.data?.pagination;
    const items1 = page1Res.body.data?.produces;

    const page1Valid = page1Res.status === 200 &&
      items1.length === 10 &&
      p1.total >= 106 &&
      p1.page === 1 &&
      p1.limit === 10 &&
      p1.totalPages === Math.ceil(p1.total / 10) &&
      p1.hasMore === true;

    recordTest(
      '6. Pagination Math Page 1 (limit=10, page=1)',
      page1Valid,
      `Returned: ${items1.length} items, Total: ${p1.total}, TotalPages: ${p1.totalPages}, HasMore: ${p1.hasMore}`
    );

    // 7. Verify Pagination Math: Page 3 with limit = 20
    const page3Res = await request('GET', `/api/produce?limit=20&page=3&farmerId=${farmerUser.farmer.id}`);
    const p3 = page3Res.body.data?.pagination;
    const items3 = page3Res.body.data?.produces;

    const page3Valid = page3Res.status === 200 &&
      items3.length === 20 &&
      p3.page === 3 &&
      p3.limit === 20 &&
      p3.hasMore === true;

    recordTest(
      '7. Pagination Math Page 3 (limit=20, page=3)',
      page3Valid,
      `Returned: ${items3.length} items, Offset: 40-60`
    );

    // 8. Verify Last Page hasMore calculation (Page 11 with limit = 10)
    const lastPage = Math.ceil(p1.total / 10);
    const lastPageRes = await request('GET', `/api/produce?limit=10&page=${lastPage}&farmerId=${farmerUser.farmer.id}`);
    const pLast = lastPageRes.body.data?.pagination;
    const lastPageValid = lastPageRes.status === 200 && pLast.hasMore === false;

    recordTest(
      '8. Last Page hasMore calculation returns false',
      lastPageValid,
      `Last Page (${lastPage}) hasMore: ${pLast.hasMore}`
    );

    // 9. Load-test query performance on (status, createdAt) composite index
    console.log('\n⚡ Running 20 Rapid Pagination Benchmark Queries against indexed columns...');
    const benchmarkStarts = Date.now();
    const queryPromises = [];

    for (let q = 1; q <= 20; q++) {
      const pageNum = (q % 5) + 1;
      queryPromises.push(
        request('GET', `/api/produce?status=AVAILABLE&sortBy=createdAt&order=desc&limit=15&page=${pageNum}`)
      );
    }

    const responses = await Promise.all(queryPromises);
    const totalBenchmarkTime = Date.now() - benchmarkStarts;
    const avgResponseTime = (totalBenchmarkTime / 20).toFixed(2);
    const all200 = responses.every((r) => r.status === 200);

    const loadTestPassed = all200 && totalBenchmarkTime < 3000;
    recordTest(
      '9. Indexed Pagination Query Benchmark (20 concurrent requests)',
      loadTestPassed,
      `Total: ${totalBenchmarkTime}ms, Avg: ${avgResponseTime}ms/query (Target: < 150ms)`
    );

    // 10. Clean up test records
    await prisma.produce.deleteMany({
      where: { farmer: { user: { email: testEmail } } },
    });
    await prisma.farmer.deleteMany({
      where: { user: { email: testEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });

    console.log('\n========================================================================');
    const allPassed = results.every((r) => r.passed);
    if (allPassed) {
      console.log('🎉 ALL INTEGRATION & PAGINATION LOAD TESTS PASSED SUCCESSFULLY!');
    } else {
      console.log('❌ SOME INTEGRATION TESTS FAILED!');
    }
    console.log('========================================================================\n');

    return allPassed;
  } catch (error) {
    console.error('❌ Catalogue pagination test encountered unhandled error:', error);
    return false;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runCataloguePaginationSuite().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}

module.exports = { runCataloguePaginationSuite };
