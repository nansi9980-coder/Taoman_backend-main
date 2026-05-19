const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const defaults = [
  {
    section: 'heroBanner',
    content: JSON.stringify({
      title: "Excellence",
      subtitle: "dans chaque service",
      description: "Taoman Groupe offre des services professionnels de qualité supérieure et des opportunités d'investissement transparentes pour votre réussite financière.",
      btn1: "Commencer à investir",
      btn2: "Voir nos services",
      imageCaption: "Nos équipes en action"
    }, null, 2)
  },
  {
    section: 'investmentStats',
    content: JSON.stringify([
      { label: 'FCFA Investis', value: '500K+', icon: '💰' },
      { label: 'Rendement Moyen', value: '150K/mois', icon: '📈' },
      { label: 'Délai Retour', value: '10 mois', icon: '⏱️' },
      { label: 'Retour Total Moyen', value: '2M FCFA', icon: '🎯' }
    ], null, 2)
  },
  {
    section: 'sectors',
    content: JSON.stringify([
      { title: 'BTP & Immobilier', icon: '🏗️', description: 'Projets de construction durable' },
      { title: 'Agro & Énergie', icon: '🌾', description: 'Agriculture moderne et énergies renouvelables' },
      { title: 'Transport & Logistique', icon: '🚛', description: 'Solutions logistiques intégrées' }
    ], null, 2)
  },
  {
    section: 'testimonials',
    content: JSON.stringify([
      {
        name: 'Jean Tchakondo',
        role: 'Investisseur Privé',
        comment: "Taoman Groupe offre une transparence exceptionnelle. J'ai augmenté mes revenus mensuels de manière constante."
      },
      {
        name: 'Marie Sefako',
        role: 'PDG - Groupe Import',
        comment: "Service d'entretien impeccable et équipe professionnelle. Je recommande vivement Taoman Groupe!"
      }
    ], null, 2)
  }
];

async function main() {
  for (const item of defaults) {
    await prisma.siteContent.upsert({
      where: { section: item.section },
      update: {},
      create: item,
    });
  }
  console.log('Seeded content');
}

main().catch(console.error).finally(() => prisma.$disconnect());
