import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const settlements = [
    { name: 'Москва', latitude: 55.7558, longitude: 37.6173 },
    { name: 'Санкт-Петербург', latitude: 59.9311, longitude: 30.3609 },
    { name: 'Казань', latitude: 55.8304, longitude: 49.0661 },
    { name: 'Сочи', latitude: 43.5855, longitude: 39.7231 },
    { name: 'Новосибирск', latitude: 55.0084, longitude: 82.9357 },
    { name: 'Екатеринбург', latitude: 56.8389, longitude: 60.6057 },
  ];

  console.log('Seeding settlements...');

  for (const settlement of settlements) {
    await prisma.settlement.upsert({
      where: { id: settlement.name }, // This is just a placeholder, id is CUID
      update: {},
      create: {
        name: settlement.name,
        latitude: settlement.latitude,
        longitude: settlement.longitude,
        isActive: true,
      },
    });
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
