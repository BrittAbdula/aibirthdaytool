import { prisma } from '@/lib/prisma';
import { deleteR2ObjectByUrl } from '@/lib/r2';

const BATCH_SIZE = 50;

async function processBatch() {
  const cards = await prisma.editedCard.findMany({
    where: { model: null },
    select: { id: true, r2Url: true },
    take: BATCH_SIZE,
  });

  if (cards.length === 0) {
    return false;
  }

  await Promise.all(
    cards.map(async card => {
      if (card.r2Url) {
        await deleteR2ObjectByUrl(card.r2Url);
      }
    })
  );

  await prisma.editedCard.deleteMany({
    where: {
      id: {
        in: cards.map(card => card.id),
      },
    },
  });

  console.log(`Deleted ${cards.length} edited cards lacking model info.`);
  return true;
}

async function main() {
  let hasMore = true;
  while (hasMore) {
    hasMore = await processBatch();
  }
  console.log('Cleanup complete.');
}

main()
  .catch(error => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
