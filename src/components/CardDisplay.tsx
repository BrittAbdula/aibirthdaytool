'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"

interface CardDisplayProps {
  card: {
    cardId?: string
    cardType: string
    r2Url?: string
    svgContent?: string
  }
}

export default function CardDisplay({ card }: CardDisplayProps) {
  const [stage, setStage] = useState<'initial' | 'opening' | 'revealing' | 'final'>('initial')
  const [showEnvelope, setShowEnvelope] = useState(true)
  const [showCard, setShowCard] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
 
  // Set image source from props on component mount
  useEffect(() => {
    if (card.svgContent) {
      // Create a data URL from SVG content
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.svgContent)}`
      setImageSrc(svgDataUrl)
    } else if (card.r2Url) {
      setImageSrc(card.r2Url)
    }
  }, [card.r2Url, card.svgContent])

  // Original confetti effect
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

  const handleOpenClick = () => {
    setStage('opening')
    setTimeout(() => {
      setStage('revealing')
      setTimeout(() => {
        setStage('final')
        setTimeout(() => {
          setShowEnvelope(false)
          // Start the original card animation after envelope disappears
          setTimeout(() => {
            setShowCard(true)
            triggerConfetti()
          }, 500)
        }, 1000)
      }, 1500)
    }, 1000)
  }

  if (!imageSrc) {
    return (
      <div className="w-full flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[80vh] flex items-center justify-center">
      {/* Final Card Display (visible after envelope disappears) */}
      <div className={cn(
        "transition-all duration-1000 w-full",
        !showEnvelope ? "opacity-100 scale-100" : "opacity-0 scale-90",
        stage === 'final' ? "transform-none" : ""
      )}>
        <div className="w-full mx-auto">
          <div className={`transition-all duration-1000 ease-out ${
            showCard ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}>
            <div className="relative w-full max-w-[400px] mx-auto">
              <div 
                className="relative aspect-[2/3] rounded-lg overflow-hidden"
                style={{ maxHeight: '70vh' }}
              >
                <Image
                  src={imageSrc}
                  alt={`${card.cardType} card `}
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
      </div>

      {/* Envelope Animation Container */}
      {showEnvelope && (
        <div className={cn(
          "absolute inset-0 w-full perspective-envelope flex items-center justify-center",
          stage === 'initial' ? "cursor-pointer" : ""
        )}>
          <div className="w-full max-w-[500px] px-4">
            {/* Open Button (only shown in initial stage) */}
            {stage === 'initial' && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <button
                  onClick={handleOpenClick}
                  className="group relative transform transition-all duration-300 hover:scale-105 focus:outline-none"
                >
                  {/* Pulsing ring animation */}
                  <div className="absolute inset-0 rounded-full animate-ping-slow bg-[#a786ff]/20" />
                  <div className="absolute inset-[-8px] rounded-full animate-pulse-slow bg-[#a786ff]/10" />
                  
                  {/* Postmark Stamp */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#a786ff]/90 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] backdrop-blur-sm group-hover:bg-[#a786ff] transition-all duration-300 group-hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_0_30px_rgba(167,134,255,0.6)]"></div>
                    <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/30 group-hover:border-white/50 transition-all duration-300 group-hover:rotate-[15deg]"></div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#b19bff]/50 to-[#a786ff] opacity-90 group-hover:opacity-100"></div>
                    <div className="relative text-center transform group-hover:scale-105 transition-transform duration-300">
                      <div className="text-[0.8rem] uppercase tracking-[0.2em] font-bold text-[#FFC0CB] 
                        [text-shadow:1px_1px_1px_rgba(0,0,0,0.3),-1px_-1px_1px_rgba(255,255,255,0.2)]">
                        {card.cardType}
                      </div>
                      <div className="text-[0.6rem] text-white/70 mt-1 group-hover:text-white/80">
                        {new Date().toLocaleDateString()}
                      </div>
                      <div className="mt-2 text-[#FFC0CB] text-xs font-medium flex items-center justify-center gap-1
                        [text-shadow:1px_1px_1px_rgba(0,0,0,0.2),-1px_-1px_1px_rgba(255,255,255,0.1)]">
                        <span> Click to Open</span>
                      </div>
                      <div className="mt-2 text-[#FFC0CB] text-xs font-medium flex items-center justify-center gap-1
                        [text-shadow:1px_1px_1px_rgba(0,0,0,0.2),-1px_-1px_1px_rgba(255,255,255,0.1)]">
                        <span className="animate-bounce">👆</span>
                        <span className="animate-ping">✨</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Envelope */}
            <div className={cn(
              "relative w-full aspect-[3/4] bg-gradient-to-br from-[#FFE5E5] to-[#FFC0CB] rounded-lg shadow-xl transition-all duration-1000 transform-style-3d",
              stage === 'opening' || stage === 'revealing' ? "transform-gpu -translate-y-20 scale-95" : "",
              stage === 'final' ? "opacity-0" : "opacity-100"
            )}>
              {/* Envelope Front Decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl opacity-30 transform rotate-0 transition-transform duration-500">
                <span className="text-[#a786ff]">💗</span>
              </div>

              {/* MewTruCard Text */}
              <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                <div className="font-serif text-2xl tracking-widest text-[#a786ff]/40" style={{ fontStyle: 'italic' }}>
                  MewTruCard
                </div>
                <div className="w-32 h-px mx-auto mt-2 bg-gradient-to-r from-transparent via-[#a786ff]/30 to-transparent" />
              </div>

              {/* Envelope Flap */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#FFC0CB] to-[#FFE5E5] rounded-t-lg origin-top transition-all duration-1000 z-20 backface-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#FFD1DC]/20 before:to-transparent before:rounded-t-lg",
                stage === 'initial' ? "transform-gpu rotate-0" : "",
                stage === 'opening' || stage === 'revealing' ? "transform-gpu -rotate-x-180" : ""
              )}>
                {/* Envelope Seal */}
                <div className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-8 bg-[#a786ff] rounded-full shadow-inner flex items-center justify-center transition-opacity duration-300",
                  stage !== 'initial' ? "opacity-0" : "opacity-100"
                )}>
                  <span className="text-white text-xl">♥</span>
                </div>
              </div>
              
              {/* Inner Shadow */}
              <div className="absolute inset-4 bg-[#FFF5F6]/50 rounded-lg" />
              
              {/* Card Preview in Envelope */}
              <div className={cn(
                "absolute inset-4 bg-white rounded-lg shadow-inner transition-all duration-1000 transform-gpu",
                stage === 'revealing' 
                  ? "translate-y-[-120%] rotate-0 scale-110" 
                  : "translate-y-0 rotate-2"
              )}>
                <div className={cn(
                  "w-full h-full transition-opacity duration-500 rounded-lg overflow-hidden",
                  stage === 'revealing' ? "opacity-100" : "opacity-0"
                )}>
                  <Image
                    src={imageSrc}
                    alt={`${card.cardType} card preview`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              {/* Envelope Interior */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F6] to-[#FFE5E5] rounded-lg -z-10" />
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Sparkles */}
              {(stage === 'revealing' || stage === 'final') && [...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-[#FFB1C1]/80 rounded-full animate-sparkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}