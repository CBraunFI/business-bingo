import { prisma } from './prisma';
import { v4 as uuidv4 } from 'uuid';

const defaultTerms = [
  'Agilität', 'Synergie', 'Roadmap', 'Mehrwert', 'Skalierung', 'Touchpoint', 'Hebel', 'Quickwin', 'Alignment', 'Priorisierung',
  'Onboarding', 'Rollout', 'Nachhaltigkeit', 'Transparenz', 'Befähigung', 'Resilienz', 'Governance', 'Schnittstellen', 'Stakeholder', 'Ressourcen',
  'Commitment', 'Ownership', 'Deliverable', 'Milestone', 'Sprint', 'Backlog', 'Retrospektive', 'Discovery', 'Blueprint', 'Benchmark',
  'Best-Practice', 'Deep-Dive', 'Holistik', 'Friktion', 'Adoption', 'Framing', 'Fokus', 'Konsistenz', 'Effizienz', 'Effektivität',
  'Wertschöpfung', 'Kollaboration', 'Verantwortlichkeit', 'Leitplanken', 'Roadblocking', 'Bottleneck', 'Buy-in', 'Parität', 'Orchestrierung', 'Priorität',
  'Delegation', 'Eskalation', 'Kapazitäten', 'Erwartungsmanagement', 'Qualitätssicherung', 'Compliance', 'Datenschutz', 'Skalierbarkeit', 'Standardisierung', 'Modularität',
  'Interoperabilität', 'Fachlichkeit', 'Umsetzungsstärke', 'Zielbild', 'Zielkonflikt', 'Ambiguität', 'Vereinfachung', 'Komplexität', 'Redundanz', 'Schnittmenge',
  'Verantwortungsübergabe', 'Befund', 'Hypothese', 'Wirksamkeit', 'Kennzahl', 'KPI', 'OKR', 'Ownership-Mindset', 'Business-Case', 'Nutzenversprechen',
  'Produkt-Markt-Fit', 'Kundenzentrierung', 'Nutzerreise', 'Personas', 'Painpoints', 'Enablement', 'Upskilling', 'Rollenklärung', 'Wirklogik', 'Skalierungslogik',
  'Wir müssen die PS auf die Straße bringen', 'Wer ist da im Lead', 'Das nehmen wir mal mit', 'Lass uns das parken', 'Das zahlt aufs Konto ein',
  'Low-Hanging-Fruits zuerst', 'Da sehe ich noch Luft nach oben', 'Wir drehen am richtigen Hebel', 'Das ist kein Rocket Science', 'Lass uns da noch mal drüber schlafen'
];

export async function createDefaultTerms(gameId: string): Promise<void> {
  const terms = defaultTerms.map(text => ({
    id: uuidv4(),
    gameId,
    text,
    enabled: true,
    source: 'default' as const
  }));

  await prisma.term.createMany({
    data: terms
  });
}

export async function generateBingoCard(gameId: string, playerId: string): Promise<void> {
  console.log(`Generating card for player ${playerId} in game ${gameId}`);

  // Get enabled terms for the game
  const enabledTerms = await prisma.term.findMany({
    where: {
      gameId,
      enabled: true
    }
  });

  console.log(`Found ${enabledTerms.length} enabled terms`);

  if (enabledTerms.length < 25) {
    console.error(`Not enough terms: ${enabledTerms.length} < 25`);
    throw new Error('Not enough enabled terms to generate a card');
  }

  // Shuffle and pick 25 terms
  const shuffled = [...enabledTerms].sort(() => Math.random() - 0.5);
  const selectedTerms = shuffled.slice(0, 25);

  // Create card
  console.log(`Creating card for player ${playerId}`);
  const card = await prisma.card.create({
    data: {
      gameId,
      playerId
    }
  });
  console.log(`Card created with ID: ${card.id}`);

  // Create card cells
  const cells = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const termIndex = row * 5 + col;
      cells.push({
        id: uuidv4(),
        cardId: card.id,
        row,
        col,
        termId: selectedTerms[termIndex].id
      });
    }
  }

  console.log(`Creating ${cells.length} card cells`);
  await prisma.cardCell.createMany({
    data: cells
  });
  console.log(`Card generation completed for player ${playerId}`);
}

export async function checkBingo(cardId: string): Promise<boolean> {
  const cells = await prisma.cardCell.findMany({
    where: {
      cardId
    },
    orderBy: [
      { row: 'asc' },
      { col: 'asc' }
    ]
  });

  // Create 5x5 grid
  const grid: boolean[][] = Array(5).fill(null).map(() => Array(5).fill(false));

  for (const cell of cells) {
    grid[cell.row][cell.col] = !!cell.markedByPlayerId;
  }

  // Check rows
  for (let row = 0; row < 5; row++) {
    if (grid[row].every(marked => marked)) {
      return true;
    }
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    if (grid.every(row => row[col])) {
      return true;
    }
  }

  // Check diagonals
  if (grid.every((row, i) => row[i])) {
    return true;
  }

  if (grid.every((row, i) => row[4 - i])) {
    return true;
  }

  return false;
}

export async function toggleCell(cellId: string, playerId: string): Promise<{ isBingo: boolean; cardId: string; marked: boolean }> {
  const cell = await prisma.cardCell.findUnique({
    where: { id: cellId },
    include: {
      card: true
    }
  });

  if (!cell) {
    throw new Error('Cell not found');
  }

  if (cell.card.playerId !== playerId) {
    throw new Error('Not authorized to mark this cell');
  }

  // Toggle the cell
  const isMarked = !!cell.markedByPlayerId;
  const newMarkedState = !isMarked;
  await prisma.cardCell.update({
    where: { id: cellId },
    data: {
      markedByPlayerId: newMarkedState ? playerId : null,
      markedAt: newMarkedState ? new Date() : null
    }
  });

  // Check for bingo
  const isBingo = await checkBingo(cell.cardId);

  return { isBingo, cardId: cell.cardId, marked: newMarkedState };
}