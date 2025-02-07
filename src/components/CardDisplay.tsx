'use client'

import { useState, useEffect } from 'react'
import confetti from "canvas-confetti"
import Image from 'next/image'

interface EditedCardData {
  id: string
  cardType: string
  editedContent: string
}

export default function CardDisplay({ card }: { card: EditedCardData }) {
  const [showCard, setShowCard] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null) // 将初始值设为 null

  useEffect(() => {
    if (card.editedContent) {
      const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.editedContent)}`
      setImageSrc(dataUrl)
      setTimeout(() => {
        setShowCard(true)
        triggerConfetti()
      }, 500)
    }
  }, [card.editedContent])

  function triggerConfetti() {
    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    function frame() {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
      });

      requestAnimationFrame(frame);
    }

    frame();
  }

  if (!imageSrc) {
    return (
      <div className="w-full flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto">
      <div 
        className={`transition-all duration-1000 ease-out ${
          showCard ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <div className="relative w-full max-w-[400px] mx-auto">
          <div 
            className="relative aspect-[2/3] rounded-lg overflow-hidden"
            style={{ maxHeight: '70vh' }}
          >
            <Image
              src={imageSrc}
              alt={`${card.cardType} card preview`}
              fill
              priority
              className="transition-transform duration-300 hover:scale-102"
              onClick={triggerConfetti}
              unoptimized
            />
          </div>
        </div>
      </div>      
    </div>
  )
}