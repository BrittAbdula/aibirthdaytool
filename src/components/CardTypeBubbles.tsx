import React from 'react'
import Link from 'next/link'
import { CardType, getAllCardTypes, CardBadge } from '@/lib/card-config'

interface CardTypeBubblesProps {
  currentType: CardType;
}

// Badge color mapping for different badge types
const badgeStyles: Record<CardBadge, { bg: string, text: string, border: string, shadow: string }> = {
  hot: { 
    bg: 'bg-gradient-to-r from-orange-500 to-red-500', 
    text: 'text-white', 
    border: 'border-orange-500',
    shadow: 'shadow-orange-300'
  },
  new: { 
    bg: 'bg-gradient-to-r from-blue-500 to-indigo-500', 
    text: 'text-white', 
    border: 'border-blue-500',
    shadow: 'shadow-blue-300'
  },
  pop: { 
    bg: 'bg-gradient-to-r from-purple-500 to-pink-500', 
    text: 'text-white', 
    border: 'border-purple-500',
    shadow: 'shadow-purple-300'
  },
  trending: { 
    bg: 'bg-gradient-to-r from-green-500 to-teal-500', 
    text: 'text-white', 
    border: 'border-green-500',
    shadow: 'shadow-green-300'
  },
  special: { 
    bg: 'bg-gradient-to-r from-yellow-400 to-amber-500', 
    text: 'text-white', 
    border: 'border-yellow-400',
    shadow: 'shadow-yellow-300'
  },
  soon: { 
    bg: 'bg-gradient-to-r from-pink-300 to-rose-400', 
    text: 'text-white', 
    border: 'border-pink-400',
    shadow: 'shadow-pink-200'
  }
};

// Badge text translations
const badgeText: Record<CardBadge, string> = {
  hot: 'HOT',
  new: 'NEW',
  pop: 'POP',
  trending: 'TREND',
  special: 'SPECIAL',
  soon: 'SOON'
};

async function CardTypeBubbles({ currentType }: CardTypeBubblesProps) {
  // 获取所有卡片类型
  const allCardTypes = await getAllCardTypes();
  
  // 过滤掉当前类型
  const otherCardTypes = allCardTypes.filter(card => card.type !== currentType);
  
  // Priority sorting: cards with badges come first, ordered by badge type
  const priorityOrder: CardBadge[] = ['hot', 'soon', 'pop', 'trending', 'special', 'new'];
  const sorted = [...otherCardTypes].sort((a, b) => {
    // If both have badges, sort by priority
    if (a.badge && b.badge) {
      return priorityOrder.indexOf(a.badge) - priorityOrder.indexOf(b.badge);
    }
    // If only one has a badge, it comes first
    if (a.badge) return -1;
    if (b.badge) return 1;
    // Otherwise, random ordering
    return 0.5 - Math.random();
  });
  
  // Choose 10 cards, prioritizing ones with badges
  const selected = sorted.slice(0, 10);

  return (
    <div className="w-full py-2 sm:py-4">
      <div className="flex flex-wrap justify-center items-center px-2 sm:px-4">
        {selected.map((card) => {
          // Default bubble styling
          let cardClasses = "inline-block m-1 sm:m-2 px-3 sm:px-4 py-2 rounded-full border border-pink-300 hover:border-pink-500 transition-colors duration-300 text-pink-600 text-sm sm:text-base font-semibold";
          
          // Override with special styling if card has a badge
          if (card.badge && badgeStyles[card.badge]) {
            const style = badgeStyles[card.badge];
            cardClasses = `inline-block relative m-1 sm:m-2 px-3 sm:px-4 py-2 rounded-full border ${style.border} ${style.bg} ${style.text} text-sm sm:text-base font-bold shadow-md hover:shadow-lg ${style.shadow} transition-all duration-300 transform hover:scale-105`;
          }
          
          return (
            <Link 
              key={card.type} 
              href={`/${card.type}/`}
              className={cardClasses}
            >
              {card.label}
              {card.badge && (
                <span className="absolute -top-2 -right-2 bg-white text-xs px-1.5 py-0.5 rounded-full text-pink-600 font-bold border border-pink-300 shadow-sm">
                  {badgeText[card.badge]}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  )
}

export default CardTypeBubbles;