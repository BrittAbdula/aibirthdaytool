'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from "@/lib/utils"
// removed unused Button import if not needed, or keep if standard
import confetti from "canvas-confetti"

interface CardDisplayProps {
  card: {
    cardId?: string
    cardType: string
    r2Url?: string
    svgContent?: string
  }
}

// Add optimized styles to the head
if (typeof document !== 'undefined' && !document.querySelector('#card-display-styles')) {
  const style = document.createElement('style');
  style.id = 'card-display-styles';
  style.textContent = `
    /* Dreamy Easing & Animations */
    :root {
      --ease-elastic: cubic-bezier(0.34, 1.56, 0.64, 1);
      --ease-soft: cubic-bezier(0.4, 0.0, 0.2, 1);
      --ease-dreamy: cubic-bezier(0.25, 0.1, 0.25, 1);
    }

    .no-touch-callout { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }

    /* Floating Heart/Star Particles */
    @keyframes float-particle {
      0% { transform: translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 0.8; }
      100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
    }
    
    @keyframes pulse-soft-glow {
      0%, 100% { box-shadow: 0 0 20px 5px rgba(255, 182, 193, 0.3); }
      50% { box-shadow: 0 0 30px 10px rgba(255, 223, 186, 0.5); }
    }

    /* Envelope Opening - Bouncier */
    @keyframes envelope-open-flap-dreamy {
      0% { transform: rotateX(0deg); }
      100% { transform: rotateX(-180deg); }
    }
    
    @keyframes envelope-slide-down-dreamy {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(150px); opacity: 0; }
    }

    /* Card Reveal - Magical Pop */
    @keyframes card-reveal-dreamy {
      0% { transform: translateY(100px) scale(0.8) rotate(-5deg); opacity: 0; }
      60% { transform: translateY(-20px) scale(1.05) rotate(2deg); opacity: 1; }
      100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
    }

    .animate-envelope-open-flap-dreamy {
      animation: envelope-open-flap-dreamy 1.2s var(--ease-elastic) forwards;
      transform-origin: top;
      will-change: transform;
    }
    
    .animate-envelope-slide-down-dreamy {
      animation: envelope-slide-down-dreamy 1.2s var(--ease-soft) forwards;
      will-change: transform, opacity;
    }

    .animate-card-reveal-dreamy {
      animation: card-reveal-dreamy 1.5s var(--ease-elastic) forwards;
      will-change: transform, opacity;
    }

    /* Cute Wiggle Interaction */
    @keyframes wiggle-cute {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-3deg); }
      75% { transform: rotate(3deg); }
    }
    
    .animate-wiggle-cute {
      animation: wiggle-cute 0.5s ease-in-out infinite;
    }

    /* Soft Floating */
    @keyframes float-dreamy {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }

    .animate-float-dreamy {
      animation: float-dreamy 5s ease-in-out infinite;
    }

    .perspective-1000 { perspective: 1000px; }
    .perspective-envelope { perspective: 1200px; }
    .transform-style-3d { transform-style: preserve-3d; }
    
    /* Dreamy Shadows */
    .shadow-envelope-dreamy {
      box-shadow: 0 20px 50px -10px rgba(255, 105, 180, 0.15), 0 10px 20px -5px rgba(255, 182, 193, 0.2);
    }
    
    .shadow-card-dreamy {
      box-shadow: 0 25px 60px -12px rgba(147, 112, 219, 0.25);
    }
    
    /* Magic Burst */
    @keyframes magic-burst-ring {
      0% { width: 0; height: 0; opacity: 1; border-width: 20px; }
      100% { width: 500px; height: 500px; opacity: 0; border-width: 0px; }
    }
    
    /* Frosted Glass */
    .glass-morphism {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
  `;
  document.head.appendChild(style);
}

// Subtle Sparkle Component - minimal and elegant
const SubtleSparkles = () => {
  const sparkles = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    left: `${15 + Math.random() * 70}%`,
    top: `${10 + Math.random() * 80}%`,
    size: Math.random() * 4 + 3 + 'px',
    duration: Math.random() * 3 + 4 + 's',
    delay: Math.random() * 3 + 's',
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white/60"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animation: `twinkle ${s.duration} ease-in-out infinite`,
            animationDelay: s.delay,
            boxShadow: '0 0 6px 2px rgba(255,255,255,0.4)'
          }}
        />
      ))}
    </div>
  );
};

export default function CardDisplay({ card }: CardDisplayProps) {
  const [stage, setStage] = useState<'initial' | 'opening' | 'revealing' | 'final'>('initial')
  const [showEnvelope, setShowEnvelope] = useState(true)
  const [showCard, setShowCard] = useState(false)
  const [showBurst, setShowBurst] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  
  // Interaction states
  const [isHovering, setIsHovering] = useState(false)
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Interaction / Shake
  const [isInteracting, setIsInteracting] = useState(false)
  
  // Device Motion
  const lastShakeRef = useRef<number>(0)
  const shakeThreshold = 15

  // Helper function to determine if URL is a video
  const isVideo = (url?: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };
 
  // Set image source from props on component mount
  useEffect(() => {
    if (card.svgContent) {
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.svgContent)}`
      setImageSrc(svgDataUrl)
    } else if (card.r2Url) {
      setImageSrc(card.r2Url)
    }
  }, [card.r2Url, card.svgContent])

  // Elegant single confetti burst - simple and refined
  const triggerElegantConfetti = useCallback(() => {
    // Single elegant burst from center
    confetti({
      particleCount: 30,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: ["#c41e3a", "#2d5a3f", "#daa520", "#ffffff"],
      shapes: ['circle'],
      scalar: 0.8,
      gravity: 0.6,
      decay: 0.94,
      startVelocity: 25,
      ticks: 200
    });
  }, []);

  // Device Motion (Shake)
  useEffect(() => {
    if (stage !== 'initial') return;

    let lastX = 0, lastY = 0, lastZ = 0;
    
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;

      const x = acceleration.x ?? 0;
      const y = acceleration.y ?? 0;
      const z = acceleration.z ?? 0;
      
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);
      const totalDelta = deltaX + deltaY + deltaZ;
      
      if (totalDelta > shakeThreshold) {
        const now = Date.now();
        if (now - lastShakeRef.current > 500) {
          lastShakeRef.current = now;
          setIsInteracting(true);
          setTimeout(() => setIsInteracting(false), 800);
          handleOpen();
        }
      }
      
      lastX = x; lastY = y; lastZ = z;
    };

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        } catch (e) { console.log('Permission denied'); }
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    };

    requestPermission();
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, [stage]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = (e.clientY - centerY) / 25; // Gentler rotation
    const rotateY = (centerX - e.clientX) / 25;
    setCardRotation({ x: rotateX, y: rotateY });
  };

  const handleOpen = useCallback(() => {
    if (stage !== 'initial') return;
    setStage('opening');
    
    // Animation sequence
    setTimeout(() => {
        setStage('revealing');
        setShowBurst(true); // Trigger burst
    }, 800);
    
    setTimeout(() => {
      setStage('final');
      setShowEnvelope(false);
      setShowCard(true);
      setShowBurst(false); // End burst
      requestAnimationFrame(triggerElegantConfetti);
    }, 1800);
  }, [stage, triggerElegantConfetti]);

  if (!imageSrc) {
    return (
      <div className="w-full flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-300"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[80vh] flex items-center justify-center">
      {/* Light Burst Overlay */}
      {showBurst && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
           <div className="relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-pink-200/50 animate-[magic-burst-ring_0.8s_ease-out_forwards]"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-[20px] border-white/80 animate-[magic-burst-ring_1s_ease-out_0.1s_forwards]"></div>
           </div>
        </div>
      )}

      {/* FINAL CARD DISPLAY */}
      <div className={cn(
        "transition-all duration-1000 w-full perspective-1000 relative z-10",
        !showEnvelope ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
      )}>
        {/* Subtle Sparkles - minimal ambiance */}
        {showCard && <SubtleSparkles />}

        <div className={cn(
          "w-full mx-auto relative",
          showCard ? 'animate-card-reveal-dreamy' : 'opacity-0'
        )}>
           {/* Card Container with Soft Glow and Float */}
           <div className="relative w-full max-w-[400px] mx-auto animate-float-dreamy">
              {/* Back Glow - Stronger Halo */}
              <div className="absolute -inset-8 rounded-full bg-pink-300 blur-3xl opacity-60 animate-[pulse-soft-glow_4s_infinite]"></div>
              
              <div 
                ref={cardRef}
                className={cn(
                   "relative aspect-[2/3] transform-gpu transition-all duration-300 cursor-pointer shadow-card-dreamy rounded-xl overflow-hidden bg-white/40 backdrop-blur-md border border-white/60",
                )}
                style={{ 
                  transform: `perspective(1000px) rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
                  boxShadow: '0 0 50px 10px rgba(255, 192, 203, 0.5)' // Inline override for stronger halo
                }}
                onMouseMove={handleCardMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                  setCardRotation({ x: 0, y: 0 });
                  setIsHovering(false);
                }}
                onClick={triggerElegantConfetti}
              >
                {isVideo(imageSrc) ? (
                  <video
                    src={imageSrc}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover"
                  >
                    <source src={imageSrc} type="video/mp4" />
                  </video>
                ) : (
                  <Image
                    src={imageSrc}
                    alt={`${card.cardType} card`}
                    fill
                    priority
                    className="object-cover"
                    unoptimized
                  />
                )}
                
                {/* Dreamy Overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-100/20 via-transparent to-blue-100/20 mix-blend-overlay pointer-events-none"></div>
                
                {/* Subtle Grain */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
              </div>
           </div>
        </div>
      </div>

      {/* DREAMY ENVELOPE */}
      {showEnvelope && (
        <div className={cn(
          "absolute inset-0 w-full perspective-envelope flex items-center justify-center transition-opacity duration-1000 z-20",
          stage === 'final' ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div 
            className={cn(
              "relative w-full max-w-[450px] aspect-[4/3] transition-transform duration-500",
              isInteracting || isHovering ? "animate-wiggle-cute" : "animate-float-dreamy",
              stage === 'revealing' ? "animate-envelope-slide-down-dreamy" : ""
            )}
            onClick={handleOpen}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Envelope Body (Back) */}
            <div className="absolute inset-0 bg-[#fff0f5] rounded-xl shadow-envelope-dreamy border border-white/80"></div>
            
            {/* Card Preview Inside */}
            <div className={cn(
               "absolute top-2 left-4 right-4 bottom-2 bg-white shadow-sm transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
               stage === 'opening' || stage === 'revealing' ? "translate-y-[-15%]" : "translate-y-0"
            )}>
              <div className="w-full h-full bg-slate-50 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-pink-200 to-purple-200 opacity-30"></div>
                 {/* Sparkle Hint */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl animate-pulse">✨</div>
              </div>
            </div>

            {/* Envelope Front (Bottom) */}
            <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-[#fff5f8] rounded-b-xl shadow-sm z-20 border-t border-white/50 backdrop-blur-sm">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-100/30 rounded-b-xl"></div>
            </div>
            
            {/* Envelope Front (Sides) */}
             <div className="absolute inset-0 z-20 pointer-events-none">
                 <div className="absolute top-[40%] left-0 w-[50%] h-[60%] bg-[#fff0f5] origin-bottom-left skew-y-6 shadow-sm rounded-bl-xl border-r border-white/20"></div>
                 <div className="absolute top-[40%] right-0 w-[50%] h-[60%] bg-[#fff0f5] origin-bottom-right -skew-y-6 shadow-sm rounded-br-xl border-l border-white/20"></div>
             </div>

            {/* Top Flap */}
            <div className={cn(
              "absolute top-0 left-0 right-0 h-[50%] bg-[#ffe4e1] rounded-t-xl z-30 origin-top shadow-md transition-all duration-800 transform-style-3d",
              stage !== 'initial' ? "animate-envelope-open-flap-dreamy" : ""
            )}>
               {/* Flap Texture */}
               <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-t-xl"></div>
               
               {/* Cute Heart Seal */}
               <div className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 transition-all duration-300 z-40",
                  stage === 'initial' ? "scale-100 opacity-100" : "scale-0 opacity-0"
               )}>
                  <div className="relative group cursor-pointer">
                     {/* Pulse Ring */}
                     <div className="absolute inset-0 bg-pink-400 rounded-full animate-ping opacity-20"></div>
                     
                     {/* Heart Icon */}
                     <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full shadow-lg flex items-center justify-center border-4 border-white transform transition-transform group-hover:scale-110">
                        <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8 drop-shadow-sm">
                           <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                     </div>
                  </div>
               </div>
            </div>

            {/* Instruction Text */}
            {stage === 'initial' && (
              <div className="absolute -bottom-20 left-0 right-0 text-center animate-bounce">
                <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur text-pink-500 text-sm font-medium shadow-sm border border-pink-100">
                  <span>💌</span> Tap to open for a surprise! <span>✨</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}