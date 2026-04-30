import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config'; 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create O'Tacos Djelfa
  const otacos = await prisma.store.findUnique({ where: { phone_number: "0555123456" } });
  if (!otacos) {
    await prisma.store.create({
      data: {
        name: "O'Tacos Djelfa",
        phone_number: "0555123456",
        lat: 34.6728,
        lng: 3.2500,
        wilaya: "Djelfa",
        baladia: "Djelfa",
        street: "Centre Ville",
        is_open: true,
        image_url: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&q=80&w=1000",
        rating: 4.5,
        prep_time: "15-20 min",
        tags: "Tacos,Pizza,Burgers,Général",
        menu_items: {
          create: [
            { name: "Tacos Poulet (Size M)", description: "Sauce fromagère, frites", price: 400, category: "Tacos" },
            { name: "Tacos Viande Hachée (Size L)", description: "Sauce algérienne, frites", price: 550, category: "Tacos" },
            { name: "Pizza Carrée", description: "Tomate, fromage, olives", price: 150, category: "Pizza" },
            { name: "Canette Coca-Cola", price: 100, category: "Boissons" }
          ]
        }
      }
    });
    console.log(`✅ Created Store: O'Tacos Djelfa`);
  }

  // 2. Create Pizzeria Bella
  const bella = await prisma.store.findUnique({ where: { phone_number: "0555998877" } });
  if (!bella) {
    await prisma.store.create({
      data: {
        name: "Pizzeria Bella",
        phone_number: "0555998877",
        lat: 34.6710,
        lng: 3.2515,
        wilaya: "Djelfa",
        baladia: "Djelfa",
        street: "Rue de la Liberté",
        image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1000",
        rating: 4.8,
        prep_time: "20-30 min",
        is_open: true,
        tags: "Pizza,Italien,Salades",
        menu_items: {
          create: [
            { name: "Pizza Margherita", description: "Tomate, mozzarella, basilic", price: 600, category: "Pizza" },
            { name: "Pizza Quatre Saisons", description: "Champignons, jambon, olives, artichauts", price: 850, category: "Pizza" },
            { name: "Salade César", description: "Poulet grillé, croûtons, parmesan", price: 450, category: "Salades" }
          ]
        }
      }
    });
    console.log(`✅ Created Store: Pizzeria Bella`);
  }

  // 3. Create Test Driver
  const driver = await prisma.driver.findUnique({ where: { phone_number: "0777987654" } });
  if (!driver) {
    await prisma.driver.create({
      data: {
        name: "Karim Delivery",
        phone_number: "0777987654",
        plate_number: "17-12345-120",
        id_card_number: "1029384756",
        license_number: "PC-998877"
      }
    });
    console.log(`✅ Created Driver: Karim Delivery`);
  }

  // 4. Create Test Client
  const client = await prisma.client.findUnique({ where: { phone_number: "0666112233" } });
  if (!client) {
    await prisma.client.create({
      data: {
        name: "Amine",
        phone_number: "0666112233",
        default_lat: 34.6750,
        default_lng: 3.2520
      }
    });
    console.log(`✅ Created Client: Amine`);
  }

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });