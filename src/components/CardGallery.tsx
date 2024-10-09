import { getRecentCards, Card } from '@/lib/cards';
import ImageViewer from './ImageViewer';
import { extractSvgFromResponse } from '@/lib/utils';

export default async function CardGallery({ wishCardType }: { wishCardType: string|null }) {
  const cards: Card[] = await getRecentCards(1, 12, wishCardType);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const svgContent = extractSvgFromResponse(card.responseContent);
        return (
          <div key={card.id} className="border rounded-lg shadow-lg flex items-center justify-center p-4" style={{ minHeight: '300px' }}>
            <div className="w-full h-full flex items-center justify-center">
              <ImageViewer svgContent={svgContent} alt={`Card ${card.cardType} `} />
            </div>
          </div>
        );
      })}
    </div>
  );
}