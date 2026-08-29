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

async function runVerification() {
  console.log('\n======================================================');
  console.log('🧪 Starting Ninjacart Backend Verification Suite');
  console.log('======================================================\n');

  try {
    // 1. Start test server
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
    recordTest('1. Express server starts successfully', true, `Listening on port ${port}`);

    // 2. Test PostgreSQL connection via Prisma
    try {
      await prisma.$connect();
      recordTest('2. PostgreSQL connection works', true, 'Connected to DB');
    } catch (err) {
      recordTest('2. PostgreSQL connection works', false, err.message);
      throw err;
    }

    // Clean test database records for isolated testing
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.produce.deleteMany({});
    await prisma.farmer.deleteMany({});
    await prisma.retailer.deleteMany({});
    await prisma.user.deleteMany({});

    // 3. GET /api/health
    const healthRes = await request('GET', '/api/health');
    const healthValid = healthRes.status === 200 &&
      healthRes.body.success === true &&
      healthRes.body.data?.message === 'API is running';
    recordTest('3. Health check GET /api/health returns 200', healthValid, JSON.stringify(healthRes.body));

    // 4. Register FARMER works
    const farmerRegPayload = {
      name: 'Ramesh Patel',
      email: 'ramesh.farmer@example.com',
      password: 'FarmerSecurePass123',
      role: 'FARMER',
    };
    const regFarmerRes = await request('POST', '/api/auth/register', farmerRegPayload);
    const farmerCreated = regFarmerRes.status === 201 &&
      regFarmerRes.body.success === true &&
      regFarmerRes.body.data.role === 'FARMER' &&
      regFarmerRes.body.data.email === farmerRegPayload.email.toLowerCase() &&
      !regFarmerRes.body.data.password &&
      !regFarmerRes.body.data.passwordHash;
    recordTest('4. Register FARMER works with 201 and creates Farmer profile', farmerCreated, JSON.stringify(regFarmerRes.body));

    // Verify Farmer record in DB
    const dbFarmer = await prisma.farmer.findFirst({
      where: { user: { email: farmerRegPayload.email.toLowerCase() } },
    });
    recordTest('4b. Farmer profile record exists in database', !!dbFarmer, `Farmer ID: ${dbFarmer?.id}`);

    // 5. Register RETAILER works
    const retailerRegPayload = {
      name: 'Amrutha Suresh',
      email: 'amrutha.retailer@example.com',
      password: 'RetailerSecurePass123',
      role: 'RETAILER',
    };
    const regRetailerRes = await request('POST', '/api/auth/register', retailerRegPayload);
    const retailerCreated = regRetailerRes.status === 201 &&
      regRetailerRes.body.success === true &&
      regRetailerRes.body.data.role === 'RETAILER' &&
      regRetailerRes.body.data.email === retailerRegPayload.email.toLowerCase() &&
      !regRetailerRes.body.data.password &&
      !regRetailerRes.body.data.passwordHash;
    recordTest('5. Register RETAILER works with 201 and creates Retailer profile', retailerCreated, JSON.stringify(regRetailerRes.body));

    // Verify Retailer record in DB
    const dbRetailer = await prisma.retailer.findFirst({
      where: { user: { email: retailerRegPayload.email.toLowerCase() } },
    });
    recordTest('5b. Retailer profile record exists in database', !!dbRetailer, `Retailer ID: ${dbRetailer?.id}`);

    // 6. Duplicate email returns 409 Conflict
    const dupRes = await request('POST', '/api/auth/register', retailerRegPayload);
    const dupValid = dupRes.status === 409 &&
      dupRes.body.success === false &&
      dupRes.body.error === 'User with this email already exists';
    recordTest('6. Duplicate email returns 409 Conflict', dupValid, JSON.stringify(dupRes.body));

    // 7. Password is properly hashed in database
    const dbUser = await prisma.user.findUnique({
      where: { email: retailerRegPayload.email.toLowerCase() },
    });
    const isBcryptHash = dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$') || dbUser.password.startsWith('$2y$');
    const passwordMatchesHash = await bcrypt.compare(retailerRegPayload.password, dbUser.password);
    const plainTextNotSaved = dbUser.password !== retailerRegPayload.password;
    recordTest('7. Password is bcrypt hashed in database, never plain text', isBcryptHash && passwordMatchesHash && plainTextNotSaved, `Hash prefix: ${dbUser.password.substring(0, 7)}...`);

    // 8. Login with correct credentials returns JWT
    const loginRes = await request('POST', '/api/auth/login', {
      email: retailerRegPayload.email,
      password: retailerRegPayload.password,
    });
    const retailerToken = loginRes.body?.data?.token;
    const loginValid = loginRes.status === 200 &&
      loginRes.body.success === true &&
      !!retailerToken &&
      loginRes.body.data.role === 'RETAILER' &&
      loginRes.body.data.user?.email === retailerRegPayload.email.toLowerCase() &&
      !loginRes.body.data.user?.password;
    recordTest('8. Login with correct credentials returns JWT and user data', loginValid, `Token: ${retailerToken ? retailerToken.substring(0, 20) + '...' : 'none'}`);

    // Login for Farmer as well to get farmerToken
    const farmerLoginRes = await request('POST', '/api/auth/login', {
      email: farmerRegPayload.email,
      password: farmerRegPayload.password,
    });
    const farmerToken = farmerLoginRes.body?.data?.token;

    // 9. Login with wrong password returns 401
    const wrongPassRes = await request('POST', '/api/auth/login', {
      email: retailerRegPayload.email,
      password: 'WrongPassword999',
    });
    const wrongPassValid = wrongPassRes.status === 401 &&
      wrongPassRes.body.success === false &&
      wrongPassRes.body.error === 'Invalid email or password';
    recordTest('9. Login with wrong password returns 401', wrongPassValid, JSON.stringify(wrongPassRes.body));

    // 10. Login with nonexistent email returns 401
    const wrongEmailRes = await request('POST', '/api/auth/login', {
      email: 'nonexistent@example.com',
      password: 'anyPassword123',
    });
    const wrongEmailValid = wrongEmailRes.status === 401 &&
      wrongEmailRes.body.success === false &&
      wrongEmailRes.body.error === 'Invalid email or password';
    recordTest('10. Login with nonexistent email returns 401', wrongEmailValid, JSON.stringify(wrongEmailRes.body));

    // 11. Missing Authorization header returns 401
    const noAuthRes = await request('GET', '/api/auth/me');
    const noAuthValid = noAuthRes.status === 401 &&
      noAuthRes.body.success === false &&
      noAuthRes.body.error === 'No token provided';
    recordTest('11. Missing Authorization header returns 401', noAuthValid, JSON.stringify(noAuthRes.body));

    // 12. Invalid JWT returns 401
    const invalidAuthRes = await request('GET', '/api/auth/me', null, {
      Authorization: 'Bearer invalid.token.payload',
    });
    const invalidAuthValid = invalidAuthRes.status === 401 &&
      invalidAuthRes.body.success === false &&
      invalidAuthRes.body.error === 'Invalid or expired token';
    recordTest('12. Invalid JWT returns 401', invalidAuthValid, JSON.stringify(invalidAuthRes.body));

    // 13. Valid JWT populates req.user in GET /api/auth/me
    const meRes = await request('GET', '/api/auth/me', null, {
      Authorization: `Bearer ${retailerToken}`,
    });
    const meValid = meRes.status === 200 &&
      meRes.body.success === true &&
      meRes.body.data.email === retailerRegPayload.email.toLowerCase() &&
      meRes.body.data.role === 'RETAILER';
    recordTest('13. Valid JWT populates req.user in GET /api/auth/me', meValid, JSON.stringify(meRes.body));

    // 14. FARMER can access farmer-protected route
    const farmerAccessRes = await request('GET', '/api/test/farmer', null, {
      Authorization: `Bearer ${farmerToken}`,
    });
    const farmerAccessValid = farmerAccessRes.status === 200 &&
      farmerAccessRes.body.success === true &&
      farmerAccessRes.body.data.message === 'Farmer access granted';
    recordTest('14. FARMER can access farmer-protected route (/api/test/farmer)', farmerAccessValid, JSON.stringify(farmerAccessRes.body));

    // 15. RETAILER cannot access farmer-protected route (403 Forbidden)
    const retailerOnFarmerRouteRes = await request('GET', '/api/test/farmer', null, {
      Authorization: `Bearer ${retailerToken}`,
    });
    const retailerOnFarmerForbidden = retailerOnFarmerRouteRes.status === 403 &&
      retailerOnFarmerRouteRes.body.success === false &&
      retailerOnFarmerRouteRes.body.error === 'Forbidden: Insufficient permissions';
    recordTest('15. RETAILER cannot access farmer-protected route (returns 403)', retailerOnFarmerForbidden, JSON.stringify(retailerOnFarmerRouteRes.body));

    // 16. RETAILER can access retailer-protected route
    const retailerAccessRes = await request('GET', '/api/test/retailer', null, {
      Authorization: `Bearer ${retailerToken}`,
    });
    const retailerAccessValid = retailerAccessRes.status === 200 &&
      retailerAccessRes.body.success === true &&
      retailerAccessRes.body.data.message === 'Retailer access granted';
    recordTest('16. RETAILER can access retailer-protected route (/api/test/retailer)', retailerAccessValid, JSON.stringify(retailerAccessRes.body));

    // 17. FARMER cannot access retailer-protected route (403 Forbidden)
    const farmerOnRetailerRouteRes = await request('GET', '/api/test/retailer', null, {
      Authorization: `Bearer ${farmerToken}`,
    });
    const farmerOnRetailerForbidden = farmerOnRetailerRouteRes.status === 403 &&
      farmerOnRetailerRouteRes.body.success === false &&
      farmerOnRetailerRouteRes.body.error === 'Forbidden: Insufficient permissions';
    recordTest('17. FARMER cannot access retailer-protected route (returns 403)', farmerOnRetailerForbidden, JSON.stringify(farmerOnRetailerRouteRes.body));

    // 18. Validation errors on register
    const invalidRegRes = await request('POST', '/api/auth/register', {
      name: '',
      email: 'bad-email',
      password: '123',
      role: 'INVALID_ROLE',
    });
    const invalidRegValid = invalidRegRes.status === 400 && invalidRegRes.body.success === false;
    recordTest('18. Registration validation returns 400 with helpful error', invalidRegValid, JSON.stringify(invalidRegRes.body));

    // 19. All API responses follow consistent { success, data/error } schema
    const allConsistent = [healthRes, regFarmerRes, regRetailerRes, dupRes, loginRes, wrongPassRes, noAuthRes, invalidAuthRes, meRes, farmerAccessRes, retailerOnFarmerRouteRes].every((res) => {
      return typeof res.body === 'object' && ('success' in res.body) && (res.body.success === true ? 'data' in res.body : 'error' in res.body);
    });
    recordTest('19. All responses strictly adhere to { success, data/error } format', allConsistent, 'Schema consistency verified');

    console.log('\n======================================================');
    const total = results.length;
    const passed = results.filter((r) => r.passed).length;
    const failed = total - passed;
    console.log(`📊 Summary: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log('======================================================\n');

    if (failed > 0) {
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

runVerification();
