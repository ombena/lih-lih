import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const stores = await prisma.store.findMany();
  console.log('Stores in DB:', stores.map(s => ({ id: s.id, name: s.name, phone: s.phone_number })));
  await prisma.$disconnect();
  await pool.end();
}

main();
