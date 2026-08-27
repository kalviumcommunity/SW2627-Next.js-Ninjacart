const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const prisma = require('./src/config/db');

async function seed() {
  console.log('🌱 Starting Ninjacart database seeding...');

  try {
    const saltRounds = 10;
    const defaultPassword = 'Password@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    // ==========================================
    // 1. Seed Sample Farmers
    // ==========================================
    const farmersData = [
      {
        name: 'Ramesh Patel',
        email: 'ramesh.farmer@ninjacart.com',
        phone: '+91 98765 43210',
        location: 'Nashik, Maharashtra',
        bio: 'Specializing in fresh organic tomatoes, onions, and seasonal bell peppers with 15+ years experience.',
      },
      {
        name: 'Sunita Devi',
        email: 'sunita.farmer@ninjacart.com',
        phone: '+91 98123 45678',
        location: 'Shimla, Himachal Pradesh',
        bio: 'High altitude orchard producing premium Royal Delicious apples, plums, and cherries.',
      },
      {
        name: 'Gopal Reddy',
        email: 'gopal.farmer@ninjacart.com',
        phone: '+91 97654 32109',
        location: 'Kolar, Karnataka',
        bio: 'Hydroponic and open farm leafy greens, spinach, coriander, and organic carrots.',
      },
    ];

    const createdFarmers = [];

    for (const farmerInfo of farmersData) {
      let user = await prisma.user.findUnique({
        where: { email: farmerInfo.email },
        include: { farmer: true },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: farmerInfo.name,
            email: farmerInfo.email,
            password: hashedPassword,
            role: 'FARMER',
            farmer: {
              create: {
                phone: farmerInfo.phone,
                location: farmerInfo.location,
                bio: farmerInfo.bio,
              },
            },
          },
          include: { farmer: true },
        });
        console.log(`✅ Created Farmer: ${farmerInfo.name} (${farmerInfo.email})`);
      } else {
        console.log(`ℹ️ Farmer exists: ${farmerInfo.email}`);
      }

      createdFarmers.push(user.farmer);
    }

    // ==========================================
    // 2. Seed Sample Retailers
    // ==========================================
    const retailersData = [
      {
        name: 'Amrutha Suresh',
        email: 'retailer@ninjacart.com',
        storeName: 'FreshMart Supermarket',
        phone: '+91 91234 56780',
        location: 'Indiranagar, Bangalore',
      },
      {
        name: 'Karthik Rao',
        email: 'karthik.retailer@ninjacart.com',
        storeName: 'Green Grocery Hub',
        phone: '+91 92345 67891',
        location: 'Koramangala, Bangalore',
      },
    ];

    for (const retInfo of retailersData) {
      const existingRetailer = await prisma.user.findUnique({
        where: { email: retInfo.email },
      });

      if (!existingRetailer) {
        await prisma.user.create({
          data: {
            name: retInfo.name,
            email: retInfo.email,
            password: hashedPassword,
            role: 'RETAILER',
            retailer: {
              create: {
                storeName: retInfo.storeName,
                phone: retInfo.phone,
                location: retInfo.location,
              },
            },
          },
        });
        console.log(`✅ Created Retailer: ${retInfo.name} (${retInfo.email})`);
      } else {
        console.log(`ℹ️ Retailer exists: ${retInfo.email}`);
      }
    }

    // ==========================================
    // 3. Seed Diverse Sample Produce Items
    // ==========================================
    const sampleProduces = [
      {
        farmerIndex: 0,
        name: 'Organic Roma Tomatoes',
        description: 'Vine-ripened, farm-fresh juicy red Roma tomatoes. Ideal for retail stores and culinary supply.',
        category: 'VEGETABLES',
        price: 32.50,
        unit: 'kg',
        quantity: 500,
        minOrderQuantity: 10,
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerIndex: 0,
        name: 'Red Nashik Onions',
        description: 'Sun-cured medium to large grade Nashik red onions with exceptional shelf-life.',
        category: 'VEGETABLES',
        price: 28.00,
        unit: 'kg',
        quantity: 1200,
        minOrderQuantity: 25,
        imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerIndex: 0,
        name: 'Green Bell Peppers (Capsicum)',
        description: 'Crisp, thick-walled green capsicum harvested early morning.',
        category: 'VEGETABLES',
        price: 45.00,
        unit: 'kg',
        quantity: 300,
        minOrderQuantity: 5,
        imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerIndex: 1,
        name: 'Shimla Royal Delicious Apples',
        description: 'Sweet, aromatic, hand-picked A-grade red apples from Himachal orchards.',
        category: 'FRUITS',
        price: 120.00,
        unit: 'kg',
        quantity: 800,
        minOrderQuantity: 20,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerIndex: 1,
        name: 'Himachal Sweet Plums',
        description: 'Fresh succulent plums packed in protective crates for zero transit damage.',
        category: 'FRUITS',
        price: 95.00,
        unit: 'box',
        quantity: 80,
        minOrderQuantity: 2,
        imageUrl: 'https://images.unsplash.com/photo-1521995995252-94458cfca142?auto=format&fit=crop&w=800&q=80',
        status: 'LOW_STOCK',
      },
      {
        farmerIndex: 2,
        name: 'Hydroponic Baby Spinach',
        description: 'Pesticide-free, nutrient-rich crisp baby spinach leaves, washed and packed in 500g pouches.',
        category: 'HERBS',
        price: 60.00,
        unit: 'kg',
        quantity: 150,
        minOrderQuantity: 5,
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
      },
      {
        farmerIndex: 2,
        name: 'Fresh Kolar Carrots',
        description: 'Sweet, tender, bright orange washed carrots ready for supermarket display.',
        category: 'TUBERS',
        price: 38.00,
        unit: 'kg',
        quantity: 0,
        minOrderQuantity: 10,
        imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
        status: 'OUT_OF_STOCK',
      },
      {
        farmerIndex: 2,
        name: 'Organic Basmati Paddy Grain',
        description: 'Single-origin premium unpolished aromatic basmati grains.',
        category: 'GRAINS',
        price: 85.00,
        unit: 'bag',
        quantity: 450,
        minOrderQuantity: 5,
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
        status: 'AVAILABLE',
      },
    ];

    for (const item of sampleProduces) {
      const farmer = createdFarmers[item.farmerIndex];
      if (!farmer) continue;

      const existingProduce = await prisma.produce.findFirst({
        where: {
          farmerId: farmer.id,
          name: item.name,
        },
      });

      if (!existingProduce) {
        await prisma.produce.create({
          data: {
            farmerId: farmer.id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            unit: item.unit,
            quantity: item.quantity,
            minOrderQuantity: item.minOrderQuantity,
            imageUrl: item.imageUrl,
            status: item.status,
          },
        });
        console.log(`🥕 Seeded Produce: ${item.name} (${item.category}, ₹${item.price}/${item.unit})`);
      } else {
        console.log(`ℹ️ Produce already exists: ${item.name}`);
      }
    }

    // ==========================================
    // 4. Optional: Bulk Seed (100+ listings for load-testing)
    // ==========================================
    const isBulk = process.argv.includes('--bulk') || process.env.SEED_BULK === 'true';
    if (isBulk && createdFarmers.length > 0) {
      console.log('\n🌾 Generating 100+ bulk produce listings for load testing & pagination benchmark...');
      const produceTemplates = [
        { name: 'Organic Red Tomato', cat: 'VEGETABLES', unit: 'kg', basePrice: 30 },
        { name: 'Shimla Golden Apple', cat: 'FRUITS', unit: 'kg', basePrice: 110 },
        { name: 'Kolar Yellow Potato', cat: 'TUBERS', unit: 'kg', basePrice: 25 },
        { name: 'Fresh Mint Leaves', cat: 'HERBS', unit: 'bunch', basePrice: 15 },
        { name: 'Sona Masoori Rice', cat: 'GRAINS', unit: 'bag', basePrice: 70 },
        { name: 'Fresh Farm Milk', cat: 'DAIRY', unit: 'L', basePrice: 55 },
        { name: 'Organic Cauliflower', cat: 'VEGETABLES', unit: 'piece', basePrice: 35 },
        { name: 'Nashik Pomegranate', cat: 'FRUITS', unit: 'kg', basePrice: 140 },
        { name: 'Organic Ginger Root', cat: 'TUBERS', unit: 'kg', basePrice: 90 },
        { name: 'Fresh Coriander Bunch', cat: 'HERBS', unit: 'bunch', basePrice: 12 },
      ];

      const bulkData = [];
      for (let i = 1; i <= 100; i++) {
        const template = produceTemplates[i % produceTemplates.length];
        const farmer = createdFarmers[i % createdFarmers.length];
        const qty = i % 12 === 0 ? 0 : 50 + (i * 10);

        bulkData.push({
          farmerId: farmer.id,
          name: `${template.name} Lot #${i.toString().padStart(3, '0')}`,
          description: `Bulk harvest batch #${i} direct from ${farmer.location || 'registered farm'}.`,
          category: template.cat,
          price: parseFloat((template.basePrice + (i % 20) * 1.5).toFixed(2)),
          unit: template.unit,
          quantity: qty,
          minOrderQuantity: template.unit === 'bag' ? 2 : 5,
          status: qty === 0 ? 'OUT_OF_STOCK' : qty < 60 ? 'LOW_STOCK' : 'AVAILABLE',
          createdAt: new Date(Date.now() - i * 3600000), // Staggered hourly for index queries
        });
      }

      await prisma.produce.createMany({
        data: bulkData,
        skipDuplicates: true,
      });
      console.log(`✅ Successfully bulk seeded ${bulkData.length} produce listings!`);
    }

    console.log('\n=========================================');
    console.log('✅ Seeding completed successfully!');
    console.log('Default credentials for all seed accounts:');
    console.log('Password: Password@123');
    console.log('=========================================\n');
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
