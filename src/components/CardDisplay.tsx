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
  const [imageSrc, setImageSrc] = useState<string>('')

  useEffect(() => {
    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.editedContent)}`
    setImageSrc(dataUrl)
    setTimeout(() => {
      setShowCard(true)
      triggerConfetti()
    }, 500)
  }, [card.editedContent])

  function triggerConfetti() {
    const end = Date.now() + 3 * 1000; // 3 seconds
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

  return (
    <div className="w-full max-w-2xl p-4">
      <div 
        className={`transition-all duration-1000 ease-out ${
          showCard ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
          <Image
            src={imageSrc}
            alt={`${card.cardType} card preview`}
            layout="fill"
            objectFit="contain"
            className="transition-transform duration-300 hover:scale-105"
            onClick={triggerConfetti}
          />
        </div>
      </div>      
    </div>
  )
}