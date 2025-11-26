import { prisma } from '@/lib/prisma';

async function main() {
  const batchSize = 100;
  let totalUpdated = 0;

  while (true) {
    const batch = await prisma.editedCard.findMany({
      where: { model: null },
      select: { id: true, originalCardId: true },
      take: batchSize,
    });

    if (batch.length === 0) {
      break;
    }

    const originalIds = batch.map(card => card.originalCardId);
    const logs = await prisma.apiLog.findMany({
      where: { cardId: { in: originalIds } },
      select: { cardId: true, promptVersion: true },
    });
    const logMap = new Map(logs.map(log => [log.cardId, log.promptVersion]));

    await Promise.all(
      batch.map(async card => {
        const promptVersion = logMap.get(card.originalCardId);
        if (!promptVersion) return;
        await prisma.editedCard.update({
          where: { id: card.id },
          data: { model: promptVersion },
        });
        totalUpdated += 1;
      })
    );
  }

  console.log(`Backfilled ${totalUpdated} edited cards with model data.`);
}

main()
  .catch(error => {
    console.error('Backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
