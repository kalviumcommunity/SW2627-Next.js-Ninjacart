const { PrismaClient } = require('@prisma/client');

if (process.env.DATABASE_URL) {
  const databaseUrl = new URL(process.env.DATABASE_URL);
  if (!databaseUrl.searchParams.has('connection_limit')) {
    databaseUrl.searchParams.set('connection_limit', '5');
  }
  if (!databaseUrl.searchParams.has('pool_timeout')) {
    databaseUrl.searchParams.set('pool_timeout', '20');
  }
  process.env.DATABASE_URL = databaseUrl.toString();
}

// Global PrismaClient singleton instance to prevent multiple client instances
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
