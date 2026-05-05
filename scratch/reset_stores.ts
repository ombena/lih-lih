import prisma from '../src/prismaClient';

async function main() {
  const result = await prisma.store.updateMany({
    data: { is_open: false },
  });
  console.log(`Successfully closed ${result.count} stores.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
