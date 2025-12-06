'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

// Add optimized styles to the head
if (typeof document !== 'undefined' && !document.querySelector('#card-display-styles')) {
  const style = document.createElement('style');
  style.id = 'card-display-styles';
  style.textContent = `
    /* Apple-style Easing & Animations */
    :root {
      --ease-apple: cubic-bezier(0.25, 0.1, 0.25, 1);
      --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .no-touch-callout { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }

    /* Elegant Sparkle - subtle and slow */
    @keyframes sparkle-elegant {
      0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.4; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
    }

    /* Soft float */
    @keyframes float-gentle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    /* Envelope Opening - Physics based */
    @keyframes envelope-open-flap {
      0% { transform: rotateX(0deg); }
      100% { transform: rotateX(-180deg); }
    }
    
    @keyframes envelope-slide-down {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(100px); opacity: 0; }
    }

    /* Card Reveal - Smooth slide up */
    @keyframes card-reveal-elegant {
      0% { transform: translateY(100px) scale(0.95); opacity: 0; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }

    /* Classes */
    .animate-sparkle-elegant {
      animation: sparkle-elegant 4s ease-in-out infinite;
      will-change: transform, opacity;
    }
    
    .animate-float-gentle {
      animation: float-gentle 6s ease-in-out infinite;
      will-change: transform;
    }

    .animate-envelope-open-flap {
      animation: envelope-open-flap 0.8s var(--ease-apple) forwards;
      transform-origin: top;
      will-change: transform;
    }
    
    .animate-envelope-slide-down {
      animation: envelope-slide-down 1s var(--ease-apple) forwards;
      will-change: transform, opacity;
    }

    .animate-card-reveal-elegant {
      animation: card-reveal-elegant 1.2s var(--ease-apple) forwards;
      will-change: transform, opacity;
    }

    /* Shake Animation - More controlled */
    @keyframes shake-elegant {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-2deg); }
      75% { transform: rotate(2deg); }
    }
    
    .animate-shake-elegant {
      animation: shake-elegant 0.4s ease-in-out infinite;
    }

    .perspective-1000 { perspective: 1000px; }
    .perspective-envelope { perspective: 1200px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    
    /* Premium Shadows */
    .shadow-envelope {
      box-shadow: 0 20px 40px -5px rgba(0,0,0,0.1), 0 10px 20px -5px rgba(0,0,0,0.05);
    }
    
    .shadow-card-elegant {
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);
    }

    /* MAGIC EFFECTS */
    @keyframes aura-pulse {
      0%, 100% { box-shadow: 0 0 40px 10px rgba(255, 215, 0, 0.2); }
      50% { box-shadow: 0 0 60px 20px rgba(255, 215, 0, 0.4); }
    }

    @keyframes float-dust {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 0.8; }
      90% { opacity: 0.8; }
      100% { transform: translateY(-100px) translateX(20px); opacity: 0; }
    }

    @keyframes light-burst {
      0% { opacity: 0; transform: scale(0.5); }
      50% { opacity: 1; transform: scale(1.5); }
      100% { opacity: 0; transform: scale(2); }
    }

    .animate-aura-pulse {
      animation: aura-pulse 4s ease-in-out infinite;
    }

    .magic-particle {
      position: absolute;
      background: white;
      border-radius: 50%;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
}

// Magical Particle Component
const MagicalParticles = () => {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1 + 'px',
    duration: Math.random() * 5 + 5 + 's',
    delay: Math.random() * 5 + 's',
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="magic-particle opacity-0"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: `float-dust ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,215,0,0.5) 100%)',
            boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)'
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
  const [showBurst, setShowBurst] = useState(false) // New state for burst
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  
  // Interaction states
  const [isHovering, setIsHovering] = useState(false)
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  
  // Long press / Charging
  const [isCharging, setIsCharging] = useState(false)
  const [chargeProgress, setChargeProgress] = useState(0)
  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const chargeStartRef = useRef<number>(0)
  
  // Shake
  const [shakeCount, setShakeCount] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const lastShakeRef = useRef<number>(0)
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shakeThreshold = 15
  const shakeRequiredCount = 3

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

  // Minimalist Confetti
  const triggerConfetti = useCallback(() => {
    const end = Date.now() + 1000;
    const colors = ["#FFD700", "#C0C0C0", "#ffffff"]; // Gold, Silver, White

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
        shapes: ['circle', 'star'], // Added star for magic
        scalar: 0.8
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
        shapes: ['circle', 'star'],
        scalar: 0.8
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
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
        if (now - lastShakeRef.current > 300) {
          lastShakeRef.current = now;
          setShakeCount(prev => {
            const newCount = prev + 1;
            if (newCount === 1) setIsShaking(true);
            if (newCount >= shakeRequiredCount) {
              handleOpen();
              return 0;
            }
            return newCount;
          });
          
          if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
          shakeTimeoutRef.current = setTimeout(() => {
             setShakeCount(0);
             setIsShaking(false);
          }, 1500);
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
    const rotateX = (e.clientY - centerY) / 20;
    const rotateY = (centerX - e.clientX) / 20;
    setCardRotation({ x: rotateX, y: rotateY });
  };

  const startCharging = () => {
    if (stage !== 'initial' || isCharging) return;
    setIsCharging(true);
    setChargeProgress(0);
    chargeStartRef.current = Date.now();
    
    chargeTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - chargeStartRef.current;
      const progress = Math.min((elapsed / 1500) * 100, 100);
      setChargeProgress(progress);
      
      if (progress >= 100) {
        if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
        setIsCharging(false);
        handleOpen();
      }
    }, 16);
  };

  const stopCharging = () => {
    if (!isCharging) return;
    if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
    setIsCharging(false);
    setChargeProgress(0);
  };

  const handleOpen = useCallback(() => {
    setStage('opening');
    
    // Animation sequence
    setTimeout(() => {
        setStage('revealing');
        setShowBurst(true); // Trigger burst
    }, 600);
    
    setTimeout(() => {
      setStage('final');
      setShowEnvelope(false);
      setShowCard(true);
      setShowBurst(false); // End burst
      requestAnimationFrame(triggerConfetti);
    }, 1200);
  }, [triggerConfetti]);

  if (!imageSrc) {
    return (
      <div className="w-full flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-200"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[80vh] flex items-center justify-center">
      {/* Light Burst Overlay */}
      {showBurst && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0) 70%) animate-[light-burst_0.6s_ease-out_forwards]"></div>
        </div>
      )}

      {/* FINAL CARD DISPLAY */}
      <div className={cn(
        "transition-all duration-1000 w-full perspective-1000 relative z-10",
        !showEnvelope ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute"
      )}>
        {/* Magical Background Particles (Only when card is shown) */}
        {showCard && <MagicalParticles />}

        <div className={cn(
          "w-full mx-auto relative",
          showCard ? 'animate-card-reveal-elegant' : 'opacity-0'
        )}>
           {/* Card Container with Aura */}
           <div className="relative w-full max-w-[400px] mx-auto">
              <div className={cn(
                  "absolute inset-0 rounded-xl bg-amber-200/20 blur-2xl transform scale-110",
                  showCard ? "animate-aura-pulse" : "" 
              )}></div>

              <div 
                ref={cardRef}
                className={cn(
                   "relative aspect-[2/3] transform-gpu transition-all duration-300 cursor-pointer shadow-card-elegant rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm border border-white/50",
                   showCard ? "animate-aura-pulse" : "" // Double pulse for intensity
                )}
                style={{ 
                  transform: `perspective(1000px) rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
                }}
                onMouseMove={handleCardMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                  setCardRotation({ x: 0, y: 0 });
                  setIsHovering(false);
                }}
                onClick={triggerConfetti}
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
                
                {/* Light Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-60 pointer-events-none mix-blend-overlay"></div>
                
                {/* Sparkle Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
              </div>
           </div>
        </div>
      </div>

      {/* ENVELOPE */}
      {showEnvelope && (
        <div className={cn(
          "absolute inset-0 w-full perspective-envelope flex items-center justify-center transition-opacity duration-1000 z-20",
          stage === 'final' ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div 
            className={cn(
              "relative w-full max-w-[450px] aspect-[4/3] transition-transform duration-500",
              isShaking ? "animate-shake-elegant" : "animate-float-gentle",
              stage === 'revealing' ? "animate-envelope-slide-down" : ""
            )}
            onMouseDown={startCharging}
            onMouseUp={stopCharging}
            onMouseLeave={stopCharging}
            onTouchStart={startCharging}
            onTouchEnd={stopCharging}
          >
            {/* Envelope Body (Back) */}
            <div className="absolute inset-0 bg-[#f5f5f7] rounded-lg shadow-envelope border border-white/40"></div>
            
            {/* Card Preview Inside (Hidden initially) */}
            <div className={cn(
               "absolute top-2 left-4 right-4 bottom-2 bg-white shadow-sm transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
               stage === 'opening' || stage === 'revealing' ? "translate-y-[-10%]" : "translate-y-0"
            )}>
              <div className="w-full h-full bg-slate-100 overflow-hidden relative">
                 {/* Simplified abstract preview */}
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-50"></div>
                 {/* Magic hint inside */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <div className="w-20 h-20 bg-amber-100 rounded-full blur-xl"></div>
                 </div>
              </div>
            </div>

            {/* Envelope Body (Front - Bottom Fold) */}
            <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-[#ffffff] rounded-b-lg shadow-sm z-20 border-t border-slate-100 mask-image-linear-gradient-to-t">
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 rounded-b-lg"></div>
            </div>
            
            {/* Envelope Body (Front - Side Folds) */}
             <div className="absolute inset-0 z-20 pointer-events-none">
                 <div className="absolute top-[40%] left-0 w-[50%] h-[60%] bg-[#fafafa] origin-bottom-left skew-y-12 shadow-sm rounded-bl-lg"></div>
                 <div className="absolute top-[40%] right-0 w-[50%] h-[60%] bg-[#fafafa] origin-bottom-right -skew-y-12 shadow-sm rounded-br-lg"></div>
             </div>

            {/* Top Flap */}
            <div className={cn(
              "absolute top-0 left-0 right-0 h-[50%] bg-[#fbfbfd] rounded-t-lg z-30 origin-top shadow-md transition-all duration-800 transform-style-3d",
              stage !== 'initial' ? "animate-envelope-open-flap" : ""
            )}>
               {/* Flap Texture */}
               <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 opacity-50 rounded-t-lg"></div>
               
               {/* Wax Seal / Button */}
               <div className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 transition-all duration-300",
                  stage === 'initial' ? "scale-100 opacity-100" : "scale-50 opacity-0"
               )}>
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Ring for charging */}
                    {isCharging && (
                       <svg className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90">
                          <circle cx="50%" cy="50%" r="32" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                          <circle cx="50%" cy="50%" r="32" fill="none" stroke="#fbbf24" strokeWidth="2" 
                            strokeDasharray="201" strokeDashoffset={201 * (1 - chargeProgress / 100)} 
                            className="transition-all duration-75 ease-linear"
                            style={{ filter: 'drop-shadow(0 0 2px #fbbf24)' }}
                          />
                       </svg>
                    )}
                    
                    {/* Seal Body - Gold accent now */}
                    <div className={cn(
                       "w-14 h-14 rounded-full bg-gradient-to-br from-[#e2e2e2] to-[#ffffff] shadow-lg flex items-center justify-center border border-white/60 transform transition-transform group",
                       isCharging ? "scale-90" : "hover:scale-105"
                    )}>
                       <div className="text-2xl text-amber-500/80 font-serif italic group-hover:text-amber-500 transition-colors">M</div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Instruction Text */}
            {stage === 'initial' && (
              <div className="absolute -bottom-16 left-0 right-0 text-center animate-pulse">
                <p className="text-sm font-medium text-slate-400 tracking-wide uppercase text-[10px] flex items-center justify-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-amber-400"></span>
                  {isCharging ? "Light the Magic" : "Hold to Open"}
                  <span className="inline-block w-1 h-1 rounded-full bg-amber-400"></span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}