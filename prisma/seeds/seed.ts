import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; // Crucial: Loads your .env file into this script

// 1. Create a standard PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 2. Wrap the pool in the new Prisma PostgreSQL adapter
const adapter = new PrismaPg(pool);

// 3. Initialize Prisma Client with the mandatory adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create a Test Store with Menu Items
  // Using nested writes to create the store AND its menu items at the same time
  const store = await prisma.store.create({
    data: {
      name: "O'Tacos Djelfa",
      phone_number: "0555123456",
      lat: 34.6728, // Approx Djelfa coordinates
      lng: 3.2500,
      wilaya: "Djelfa",
      baladia: "Djelfa",
      street: "Centre Ville",
      menu_items: {
        create: [
          { name: "Tacos Poulet (Size M)", description: "Sauce fromagère, frites", price: 400 },
          { name: "Tacos Viande Hachée (Size L)", description: "Sauce algérienne, frites", price: 550 },
          { name: "Pizza Carrée", description: "Tomate, fromage, olives", price: 150 },
          { name: "Canette Coca-Cola", price: 100 }
        ]
      }
    }
  });
  console.log(`✅ Created Store: ${store.name} with 4 menu items.`);

  // 2. Create a Test Driver
  const driver = await prisma.driver.create({
    data: {
      name: "Karim Delivery",
      phone_number: "0777987654",
      plate_number: "17-12345-120", // Typical Algerian plate format
      id_card_number: "1029384756",
      license_number: "PC-998877",
      platform_debt: 0.0
    }
  });
  console.log(`✅ Created Driver: ${driver.name}`);

  // 3. Create a Test Client
  const client = await prisma.client.create({
    data: {
      name: "Amine",
      phone_number: "0666112233",
      default_lat: 34.6750,
      default_lng: 3.2520
    }
  });
  console.log(`✅ Created Client: ${client.name}`);

  console.log('🎉 Seeding finished successfully! Your database is ready.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Disconnect Prisma Client and close the pool when finished
    await prisma.$disconnect();
    await pool.end();
  });