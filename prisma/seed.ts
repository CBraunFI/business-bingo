import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTerms = [
  // Einzelwörter (1-90)
  'Agilität',
  'Synergie',
  'Roadmap',
  'Mehrwert',
  'Skalierung',
  'Touchpoint',
  'Hebel',
  'Quickwin',
  'Alignment',
  'Priorisierung',
  'Onboarding',
  'Rollout',
  'Nachhaltigkeit',
  'Transparenz',
  'Befähigung',
  'Resilienz',
  'Governance',
  'Schnittstellen',
  'Stakeholder',
  'Ressourcen',
  'Commitment',
  'Ownership',
  'Deliverable',
  'Milestone',
  'Sprint',
  'Backlog',
  'Retrospektive',
  'Discovery',
  'Blueprint',
  'Benchmark',
  'Best-Practice',
  'Deep-Dive',
  'Holistik',
  'Friktion',
  'Adoption',
  'Framing',
  'Fokus',
  'Konsistenz',
  'Effizienz',
  'Effektivität',
  'Wertschöpfung',
  'Kollaboration',
  'Verantwortlichkeit',
  'Leitplanken',
  'Roadblocking',
  'Bottleneck',
  'Buy-in',
  'Parität',
  'Orchestrierung',
  'Priorität',
  'Delegation',
  'Eskalation',
  'Kapazitäten',
  'Erwartungsmanagement',
  'Qualitätssicherung',
  'Compliance',
  'Datenschutz',
  'Skalierbarkeit',
  'Standardisierung',
  'Modularität',
  'Interoperabilität',
  'Fachlichkeit',
  'Umsetzungsstärke',
  'Zielbild',
  'Zielkonflikt',
  'Ambiguität',
  'Vereinfachung',
  'Komplexität',
  'Redundanz',
  'Schnittmenge',
  'Verantwortungsübergabe',
  'Befund',
  'Hypothese',
  'Wirksamkeit',
  'Kennzahl',
  'KPI',
  'OKR',
  'Ownership-Mindset',
  'Business-Case',
  'Nutzenversprechen',
  'Produkt-Markt-Fit',
  'Kundenzentrierung',
  'Nutzerreise',
  'Personas',
  'Painpoints',
  'Enablement',
  'Upskilling',
  'Rollenklärung',
  'Wirklogik',
  'Skalierungslogik',

  // Phrasen (91-100)
  'Wir müssen die PS auf die Straße bringen',
  'Wer ist da im Lead',
  'Das nehmen wir mal mit',
  'Lass uns das parken',
  'Das zahlt aufs Konto ein',
  'Low-Hanging-Fruits zuerst',
  'Da sehe ich noch Luft nach oben',
  'Wir drehen am richtigen Hebel',
  'Das ist kein Rocket Science',
  'Lass uns da noch mal drüber schlafen'
];

async function main() {
  console.log('Start seeding...');

  // Clear existing default terms
  await prisma.term.deleteMany({
    where: {
      source: 'default'
    }
  });

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