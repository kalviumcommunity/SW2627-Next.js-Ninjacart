const { PrismaClient } = require('@prisma/client');

// Global PrismaClient singleton instance to prevent multiple client instances
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

module.exports = prisma;
