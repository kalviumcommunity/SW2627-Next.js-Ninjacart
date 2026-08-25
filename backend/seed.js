const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const prisma = require('./src/config/db');

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    const saltRounds = 10;
    const defaultPassword = 'Password@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // 1. Seed default Farmer
    const farmerEmail = 'farmer@ninjacart.com';
    const existingFarmer = await prisma.user.findUnique({
      where: { email: farmerEmail },
    });

    if (!existingFarmer) {
      const farmer = await prisma.user.create({
        data: {
          name: 'Ramesh Farmer',
          email: farmerEmail,
          password: hashedPassword,
          role: 'FARMER',
          farmer: {
            create: {},
          },
        },
      });
      console.log(`✅ Created Farmer: ${farmer.email} (Password: ${defaultPassword})`);
    } else {
      console.log(`ℹ️ Farmer already exists: ${farmerEmail}`);
    }

    // 2. Seed default Retailer
    const retailerEmail = 'retailer@ninjacart.com';
    const existingRetailer = await prisma.user.findUnique({
      where: { email: retailerEmail },
    });

    if (!existingRetailer) {
      const retailer = await prisma.user.create({
        data: {
          name: 'Amrutha Retailer',
          email: retailerEmail,
          password: hashedPassword,
          role: 'RETAILER',
          retailer: {
            create: {},
          },
        },
      });
      console.log(`✅ Created Retailer: ${retailer.email} (Password: ${defaultPassword})`);
    } else {
      console.log(`ℹ️ Retailer already exists: ${retailerEmail}`);
    }

    console.log('🌱 Seeding completed successfully.');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
