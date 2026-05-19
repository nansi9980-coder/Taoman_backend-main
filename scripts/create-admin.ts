import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@taoman.com';
  const password = 'admin'; // Mot de passe par défaut

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'admin',
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      role: 'admin',
    },
  });

  console.log('✅ Utilisateur admin créé ou mis à jour avec succès:');
  console.log('Email:', admin.email);
  console.log('Mot de passe:', password);
  console.log('Rôle:', admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
