const path = require('path');
const fs = require('fs');

// Load environment variables from .env
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.warn('\n⚠️  [WARN] backend/.env file not found.');
  console.warn('ℹ️  Please create backend/.env by copying backend/.env.example:');
  console.warn('   cp backend/.env.example backend/.env');
  console.warn('   And configure your DATABASE_URL and JWT_SECRET.\n');
}

require('dotenv').config({ path: envPath });

// Fallback defaults for local development if not specified
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev_jwt_secret_ninjacart_fallback_2026';
  console.warn('⚠️  JWT_SECRET not set in environment. Using development fallback secret.');
}

const app = require('./app');
const prisma = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🚀 Ninjacart Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);

  // Verify PostgreSQL connectivity on startup
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Prisma.');
  } catch (dbError) {
    console.warn('\n⚠️  [DATABASE WARNING] Could not connect to PostgreSQL database.');
    console.warn(`ℹ️  Ensure your DATABASE_URL in backend/.env uses the current external connection string from your database provider:`);
    console.warn(`   DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[db]?schema=public"`);
    if (dbError.code === 'P1001') {
      console.warn('   The configured database host is unreachable. Confirm the Render database is running and copy its current External Database URL.');
    }
    console.warn(`   Error Details: ${dbError.message}\n`);
  }
});

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('\nShutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process terminated.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = server;
