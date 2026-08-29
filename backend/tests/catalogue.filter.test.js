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

async function runCatalogueFilterSuite() {
  console.log('\n========================================================================');
  console.log('🧪 Starting Tests: Catalogue Exclusions & Error Standardization');
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
    
    // Cleanup
    const testEmail = 'filter_farmer@ninjacart.com';
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
    const farmerUser = await prisma.user.create({
      data: {
        name: 'Filter Test Farmer',
        email: testEmail,
        password: hashedPassword,
        role: 'FARMER',
        farmer: {
          create: {
            phone: '9876500002',
            location: 'Filter Farms',
            bio: 'Test bio',
          },
        },
      },
      include: { farmer: true },
    });

    const farmerId = farmerUser.farmer.id;

    // Seed specific items
    await prisma.produce.createMany({
      data: [
        { farmerId, name: 'Available Item', category: 'VEGETABLES', price: 10, unit: 'kg', quantity: 100, minOrderQuantity: 1, status: 'AVAILABLE' },
        { farmerId, name: 'Low Stock Item', category: 'VEGETABLES', price: 15, unit: 'kg', quantity: 3, minOrderQuantity: 1, status: 'LOW_STOCK' },
        { farmerId, name: 'Zero Quantity Item', category: 'VEGETABLES', price: 20, unit: 'kg', quantity: 0, minOrderQuantity: 1, status: 'AVAILABLE' }, // Buggy state
        { farmerId, name: 'Out Of Stock Item', category: 'VEGETABLES', price: 25, unit: 'kg', quantity: 0, minOrderQuantity: 1, status: 'OUT_OF_STOCK' },
        { farmerId, name: 'Archived Item', category: 'VEGETABLES', price: 30, unit: 'kg', quantity: 50, minOrderQuantity: 1, status: 'ARCHIVED' },
      ],
    });

    // 1 & 2 & 3. Test Catalogue Fetch (No Farmer ID specified implies general catalogue)
    const catalogueRes = await request('GET', `/api/produce?limit=10&page=1`);
    const produces = catalogueRes.body.data?.produces || [];
    
    // Filter the items belonging to our test farmer just in case there are others in DB
    const myProduces = produces.filter(p => p.farmerId === farmerId);
    
    const hasAvailable = myProduces.some(p => p.name === 'Available Item');
    const hasLowStock = myProduces.some(p => p.name === 'Low Stock Item');
    const hasZeroQuantity = myProduces.some(p => p.name === 'Zero Quantity Item');
    const hasOutOfStock = myProduces.some(p => p.name === 'Out Of Stock Item');
    const hasArchived = myProduces.some(p => p.name === 'Archived Item');

    recordTest(
      '1, 2, 3. Catalogue excludes sold out and zero quantity items',
      hasAvailable && hasLowStock && !hasZeroQuantity && !hasOutOfStock && !hasArchived,
      `Returned matching items: ${myProduces.length}`
    );

    // 4. Test error standard 400 (Bad Request)
    const badRes = await request('POST', '/api/auth/register', { name: '' });
    recordTest(
      '4. Invalid request returns 400 with standard format',
      badRes.status === 400 && badRes.body.success === false && typeof badRes.body.error === 'string',
      `Status: ${badRes.status}, Error: ${badRes.body.error}`
    );

    // 5. Test error standard 409 (Conflict)
    const conflictRes = await request('POST', '/api/auth/register', {
      name: 'Duplicate',
      email: testEmail, // Existing email
      password: 'Password@123',
      role: 'FARMER'
    });
    recordTest(
      '5. Business conflict returns 409 with standard format',
      conflictRes.status === 409 && conflictRes.body.success === false,
      `Status: ${conflictRes.status}`
    );

    // 6. Test error standard 404 (Not Found)
    const notFoundRes = await request('GET', '/api/produce/invalid-uuid-format-or-missing');
    recordTest(
      '6. Missing resource returns 404 with standard format',
      notFoundRes.status === 404 && notFoundRes.body.success === false,
      `Status: ${notFoundRes.status}`
    );

    // Cleanup
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
      console.log('🎉 ALL EXCLUSION & ERROR STANDARDIZATION TESTS PASSED SUCCESSFULLY!');
    } else {
      console.log('❌ SOME TESTS FAILED!');
    }
    console.log('========================================================================\n');

    return allPassed;
  } catch (error) {
    console.error('❌ Test encountered unhandled error:', error);
    return false;
  } finally {
    if (server) {
      server.close();
    }
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runCatalogueFilterSuite().then((passed) => {
    process.exit(passed ? 0 : 1);
  });
}
