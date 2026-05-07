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

  // 3. Create Laghouat Stores (10 Stores)
  const laghouatStores = [
    { name: "Laghouat Grill", tags: "Grillade,Traditionnel", lat: 33.8016, lng: 2.8711 },
    { name: "Wahat Food", tags: "Fast Food,Burgers", lat: 33.8025, lng: 2.8735 },
    { name: "L'Oasis Gourmande", tags: "Crêpes,Desserts", lat: 33.7995, lng: 2.8695 },
    { name: "Le Palmier", tags: "Pizza,Général", lat: 33.8040, lng: 2.8680 },
    { name: "Atlas Snack", tags: "Sandwich,Tacos", lat: 33.7980, lng: 2.8750 },
    { name: "Cyber Café & Food", tags: "Boissons,Snack", lat: 33.8060, lng: 2.8720 },
    { name: "Restaurant El Mordjene", tags: "Traditionnel,Couscous", lat: 33.8000, lng: 2.8780 },
    { name: "Pizzeria Sidi El Hakem", tags: "Pizza", lat: 33.8030, lng: 2.8650 },
    { name: "Cafétéria de la Gare", tags: "Café,Petit Déjeuner", lat: 33.8075, lng: 2.8700 },
    { name: "Fast Food Al-Qods", tags: "Burgers,Frites", lat: 33.7960, lng: 2.8740 },
  ];

  for (let i = 0; i < laghouatStores.length; i++) {
    const s = laghouatStores[i];
    const phone = `055500000${i}`;
    const existing = await prisma.store.findUnique({ where: { phone_number: phone } });
    
    if (!existing) {
      await prisma.store.create({
        data: {
          name: s.name,
          phone_number: phone,
          lat: s.lat,
          lng: s.lng,
          wilaya: "Laghouat",
          baladia: "Laghouat",
          street: "Quartier Administratif",
          is_open: true,
          image_url: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000&sig=${i}`,
          rating: 4.0 + (Math.random() * 1.0),
          tags: s.tags,
          menu_items: {
            create: [
              { name: "Plat du jour", price: 600, category: "Plats" },
              { name: "Canette Boisson", price: 100, category: "Boissons" }
            ]
          }
        }
      });
      console.log(`✅ Created Store: ${s.name} (Laghouat)`);
    }
  }

  // 4. Create Test Driver
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

  // 5. Create Test Client
  const client = await prisma.client.findUnique({ where: { phone_number: "0666112233" } });
  if (!client) {
    await prisma.client.create({
      data: {
        name: "Amine",
        phone_number: "0666112233",
        default_lat: 33.8016,
        default_lng: 2.8711
      }
    });
    console.log(`✅ Created Client: Amine (Laghouat)`);
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