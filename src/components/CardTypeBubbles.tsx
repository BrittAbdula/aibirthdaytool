import React from 'react'
import Link from 'next/link'
import { CardType, getAllCardTypes } from '@/lib/card-config'

interface CardTypeBubblesProps {
  currentType: CardType;
}

async function CardTypeBubbles({ currentType }: CardTypeBubblesProps) {
  // 获取所有卡片类型
  const allCardTypes = await getAllCardTypes();
  
  // 过滤掉当前类型
  const otherCardTypes = allCardTypes.filter(card => card.type !== currentType);
  
  // 随机排序并选择10个
  const shuffled = otherCardTypes.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 10);

  return (
    <div className="w-full py-2 sm:py-4">
      <div className="flex flex-wrap justify-center items-center px-2 sm:px-4">
        {selected.map((card) => (
          <Link 
            key={card.type} 
            href={`/${card.type}`}
            className="inline-block m-1 sm:m-2 px-3 sm:px-4 py-2 rounded-full border border-pink-300 hover:border-pink-500 transition-colors duration-300 text-pink-600 text-sm sm:text-base font-semibold"
          >
            {card.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default CardTypeBubbles;