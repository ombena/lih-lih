const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const order = await prisma.order.findFirst({
    where: { status: { not: 'Delivered' } },
    orderBy: { created_at: 'desc' }
  });

  if (!order) {
    console.log("No non-delivered orders found.");
    return;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { status: 'Delivered' }
  });

  console.log(`Order ${updatedOrder.id} marked as Delivered!`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
