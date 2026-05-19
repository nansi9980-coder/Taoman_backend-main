import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.job.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.media.deleteMany();
  await prisma.serviceCard.deleteMany();
  await prisma.siteContent.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.themeSetting.deleteMany();
  await prisma.client.deleteMany();
  await prisma.message.deleteMany();
  await prisma.report.deleteMany();
  await prisma.backup.deleteMany();
  await prisma.log.deleteMany();
  await prisma.investment.deleteMany();

  // Delete all users except admin@taoman.com
  await prisma.user.deleteMany({
    where: {
      email: {
        not: 'admin@taoman.com',
      },
    },
  });

  console.log('✅ Database cleared successfully, admin preserved.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
