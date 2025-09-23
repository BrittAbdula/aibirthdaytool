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
    /* Performance optimized animations using transform3d and will-change */
    .no-touch-callout { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }
    @keyframes sparkle-float {
      0%, 100% { transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotate(0deg); opacity: 1; }
      25% { transform: translate3d(0px, -10px, 0px) scale3d(1.2, 1.2, 1) rotate(90deg); opacity: 0.8; }
      50% { transform: translate3d(0px, 5px, 0px) scale3d(0.8, 0.8, 1) rotate(180deg); opacity: 1; }
      75% { transform: translate3d(0px, -5px, 0px) scale3d(1.1, 1.1, 1) rotate(270deg); opacity: 0.9; }
    }
    @keyframes ribbon-fall {
      0% { transform: translate3d(0px, -20px, 0px) rotate(0deg) scale3d(1, 1, 1); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translate3d(0px, 100vh, 0px) rotate(720deg) scale3d(0.5, 0.5, 1); opacity: 0; }
    }
    @keyframes sparkle-dance {
      0%, 100% { transform: scale3d(1, 1, 1) rotate(0deg); opacity: 1; }
      25% { transform: scale3d(1.3, 1.3, 1) rotate(90deg); opacity: 0.7; }
      50% { transform: scale3d(0.7, 0.7, 1) rotate(180deg); opacity: 1; }
      75% { transform: scale3d(1.1, 1.1, 1) rotate(270deg); opacity: 0.8; }
    }
    @keyframes magic-trail {
      0% { transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotate(45deg); opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 0.6; }
      100% { transform: translate3d(0px, -50px, 0px) scale3d(0, 0, 1) rotate(225deg); opacity: 0; }
    }
    @keyframes celebration-burst {
      0% { transform: scale3d(0, 0, 1) rotate(0deg); opacity: 1; }
      50% { transform: scale3d(2, 2, 1) rotate(180deg); opacity: 0.8; }
      100% { transform: scale3d(0, 0, 1) rotate(360deg); opacity: 0; }
    }
    @keyframes float-heart {
      0%, 100% { transform: translate3d(0px, 0px, 0px) rotate(0deg) scale3d(1, 1, 1); opacity: 0.7; }
      33% { transform: translate3d(5px, -15px, 0px) rotate(10deg) scale3d(1.1, 1.1, 1); opacity: 1; }
      66% { transform: translate3d(-5px, 8px, 0px) rotate(-5deg) scale3d(0.9, 0.9, 1); opacity: 0.8; }
    }
    @keyframes gentle-bounce {
      0%, 100% { transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1); }
      50% { transform: translate3d(0px, -3px, 0px) scale3d(1.02, 1.02, 1); }
    }
    @keyframes shimmer {
      0% { transform: translate3d(-100%, 0px, 0px); }
      100% { transform: translate3d(100%, 0px, 0px); }
    }
    @keyframes slow-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes ping-slow {
      0% { transform: scale3d(1, 1, 1); opacity: 1; }
      75%, 100% { transform: scale3d(2, 2, 1); opacity: 0; }
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes shake {
      0%, 100% { transform: translate3d(0px, 0px, 0px) rotate(0deg); }
      10% { transform: translate3d(-0.5px, -0.3px, 0px) rotate(-0.2deg); }
      20% { transform: translate3d(0.5px, 0.3px, 0px) rotate(0.2deg); }
      30% { transform: translate3d(-0.3px, -0.5px, 0px) rotate(-0.1deg); }
      40% { transform: translate3d(0.3px, 0.5px, 0px) rotate(0.1deg); }
      50% { transform: translate3d(-0.3px, -0.3px, 0px) rotate(-0.1deg); }
      60% { transform: translate3d(0.3px, 0.3px, 0px) rotate(0.1deg); }
      70% { transform: translate3d(-0.5px, -0.3px, 0px) rotate(-0.2deg); }
      80% { transform: translate3d(0.5px, 0.3px, 0px) rotate(0.2deg); }
      90% { transform: translate3d(-0.3px, -0.5px, 0px) rotate(-0.1deg); }
    }
    @keyframes shake-gentle {
      0%, 100% { transform: translate3d(0px, 0px, 0px) rotate(0deg); }
      25% { transform: translate3d(-0.2px, -0.1px, 0px) rotate(-0.05deg); }
      75% { transform: translate3d(0.2px, 0.1px, 0px) rotate(0.05deg); }
    }
    @keyframes shake-fade {
      0% { transform: translate3d(-0.3px, -0.2px, 0px) rotate(-0.1deg); opacity: 1; }
      100% { transform: translate3d(0px, 0px, 0px) rotate(0deg); opacity: 1; }
    }
    
    /* Envelope opening animation - optimized for performance */
    @keyframes envelope-open {
      0% { transform: translate3d(0px, 0px, 0px) rotateX(0deg) scale3d(1, 1, 1); }
      100% { transform: translate3d(0px, 0px, 0px) rotateX(-180deg) scale3d(1.1, 1.1, 1); }
    }
    @keyframes envelope-slide-out {
      0% { transform: translate3d(0px, 0px, 0px) rotate(0deg) scale3d(1, 1, 1); opacity: 1; }
      100% { transform: translate3d(0px, -120%, 0px) rotate(0deg) scale3d(1.1, 1.1, 1); opacity: 1; }
    }
    @keyframes envelope-fade-out {
      0% { transform: translate3d(0px, -32px, 0px) rotate(3deg) scale3d(0.9, 0.9, 1); opacity: 1; }
      100% { transform: translate3d(0px, -64px, 0px) rotate(6deg) scale3d(0.8, 0.8, 1); opacity: 0; }
    }
    @keyframes card-reveal {
      0% { transform: translate3d(0px, 8px, 0px) scale3d(0.9, 0.9, 1); opacity: 0; }
      100% { transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1); opacity: 1; }
    }
    
    /* Animation classes with performance optimizations */
    .animate-sparkle-float { 
      animation: sparkle-float 3s ease-in-out infinite; 
      will-change: transform, opacity;
    }
    .animate-ribbon-fall { 
      animation: ribbon-fall 4s linear infinite; 
      will-change: transform, opacity;
    }
    .animate-sparkle-dance { 
      animation: sparkle-dance 2.5s ease-in-out infinite; 
      will-change: transform, opacity;
    }
    .animate-magic-trail { 
      animation: magic-trail 2s ease-out infinite; 
      will-change: transform, opacity;
    }
    .animate-celebration-burst { 
      animation: celebration-burst 1.5s ease-out infinite; 
      will-change: transform, opacity;
    }
    .animate-float-heart { 
      animation: float-heart 4s ease-in-out infinite; 
      will-change: transform, opacity;
    }
    .animate-gentle-bounce { 
      animation: gentle-bounce 2s ease-in-out infinite; 
      will-change: transform;
    }
    .animate-shimmer { 
      animation: shimmer 2s linear infinite; 
      will-change: transform;
    }
    .animate-slow-spin { 
      animation: slow-spin 10s linear infinite; 
      will-change: transform;
    }
    .animate-ping-slow { 
      animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; 
      will-change: transform, opacity;
    }
    .animate-pulse-slow { 
      animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; 
      will-change: opacity;
    }
    .animate-shake { 
      animation: shake 1.2s ease-in-out infinite; 
      will-change: transform;
    }
    .animate-shake-gentle { 
      animation: shake-gentle 2s ease-in-out infinite; 
      will-change: transform;
    }
    .animate-shake-fade { 
      animation: shake-fade 1s ease-out forwards; 
      will-change: transform;
    }
    .animate-envelope-open { 
      animation: envelope-open 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; 
      will-change: transform;
    }
    .animate-envelope-slide-out { 
      animation: envelope-slide-out 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; 
      will-change: transform, opacity;
    }
    .animate-envelope-fade-out { 
      animation: envelope-fade-out 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; 
      will-change: transform, opacity;
    }
    .animate-card-reveal { 
      animation: card-reveal 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; 
      will-change: transform, opacity;
    }
    
    /* Performance optimizations */
    .perspective-1000 { perspective: 1000px; }
    .perspective-envelope { perspective: 800px; }
    .transform-style-3d { transform-style: preserve-3d; }
    .backface-hidden { backface-visibility: hidden; }
    .gpu-optimized { 
      transform: translate3d(0, 0, 0); 
      will-change: transform; 
    }
    .group:hover .animate-sparkle-float { animation-duration: 1.5s; }
    .group:hover .animate-float-heart { animation-duration: 2s; }
  `;
  document.head.appendChild(style);
}

export default function CardDisplay({ card }: CardDisplayProps) {
  const [stage, setStage] = useState<'initial' | 'opening' | 'revealing' | 'final'>('initial')
  const [showEnvelope, setShowEnvelope] = useState(true)
  const [showCard, setShowCard] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])
  const [ribbonParticles, setRibbonParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([])
  const [isHovering, setIsHovering] = useState(false)
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const motionRafRef = useRef<number | null>(null)
  
  // 长按充能状态
  const [isCharging, setIsCharging] = useState(false)
  const [chargeProgress, setChargeProgress] = useState(0)
  const [unlockMethod, setUnlockMethod] = useState<'longpress' | 'shake' | null>(null)
  const chargeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const chargeStartRef = useRef<number>(0)
  
  // 摇一摇检测状态
  const [shakeCount, setShakeCount] = useState(0)
  const [isShaking, setIsShaking] = useState(false)
  const [shakeIntensity, setShakeIntensity] = useState<'normal' | 'gentle' | 'fading'>('normal')
  const lastShakeRef = useRef<number>(0)
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shakeThreshold = 15 // 摇动强度阈值
  const shakeRequiredCount = 3 // 需要摇动次数

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

  // Generate floating sparkles - optimized with reduced count
  const generateSparkles = useCallback(() => {
    const newSparkles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i, // Use timestamp for unique IDs
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setSparkles(newSparkles);
    
    // Use requestAnimationFrame for cleanup
    setTimeout(() => {
      requestAnimationFrame(() => setSparkles([]));
    }, 3500);
  }, []);

  // Generate ribbon particles - optimized with reduced count
  const generateRibbonParticles = useCallback(() => {
    const colors = ["#FFB6C1", "#DDA0DD", "#F0E68C", "#98FB98", "#87CEEB"];
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i, // Use timestamp for unique IDs
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2.5,
    }));
    setRibbonParticles(newParticles);
    
    // Use requestAnimationFrame for cleanup
    setTimeout(() => {
      requestAnimationFrame(() => setRibbonParticles([]));
    }, 4000);
  }, []);

  // 初始的两边confetti效果（刚打开时）
  const triggerInitialConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1", "#FFB6C1", "#DDA0DD", "#F0E68C"];

    // 中心爆发
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });

    // 持续的两边喷射效果
    function continuousFrame() {
      if (Date.now() > end) return;

      // 左边喷射
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
        shapes: ['star', 'circle'],
        scalar: 0.8,
      });
      
      // 右边喷射
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
        shapes: ['star', 'circle'],
        scalar: 0.8,
      });

      // 偶尔的顶部爆发
      if (Math.random() < 0.3) {
        confetti({
          particleCount: 15,
          spread: 100,
          startVelocity: 45,
          origin: { x: Math.random(), y: 0.1 },
          colors: colors,
          shapes: ['star'],
          scalar: 1.2,
        });
      }

      requestAnimationFrame(continuousFrame);
    }

    continuousFrame();
  }, []);

  // Enhanced confetti effects
  const triggerConfetti = useCallback(() => {
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1", "#FFB6C1", "#DDA0DD", "#F0E68C"];
    
    const patterns = [
      // Pattern 1: Heart burst
      () => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#FFB6C1", "#FF69B4", "#DDA0DD"],
          shapes: ['star'],
          scalar: 1.2,
        });
        setTimeout(() => {
      confetti({
            particleCount: 30,
            spread: 80,
            origin: { y: 0.4 },
        colors: colors,
            shapes: ['star'],
            scalar: 0.8,
          });
        }, 300);
      },
      // Pattern 2: Rainbow cascade
      () => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 25,
              spread: 50,
              origin: { x: 0.2 + (i * 0.3), y: 0.3 },
              colors: colors.slice(i * 2, i * 2 + 3),
              shapes: ['circle', 'square'],
              scalar: 1.0,
            });
          }, i * 200);
        }
      },
      // Pattern 3: Spiral celebration
      () => {
      confetti({
          particleCount: 80,
          spread: 360,
          origin: { y: 0.5 },
        colors: colors,
          shapes: ['star', 'circle'],
          scalar: 0.9,
          startVelocity: 30,
        });
      },
    ];

    const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
    selectedPattern();

    // 减少粒子效果触发概率，提升性能
    if (Math.random() < 0.4) generateSparkles();
    if (Math.random() < 0.3) generateRibbonParticles();
  }, [generateSparkles, generateRibbonParticles]);

  // 设备运动检测（摇一摇）
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
        if (now - lastShakeRef.current > 200) {
          lastShakeRef.current = now;
          setShakeCount(prev => {
            const newCount = prev + 1;
            
            if (newCount === 1) {
              setIsShaking(true);
              setUnlockMethod('shake');
              setShakeIntensity('normal');
            }
            
            if (newCount >= shakeRequiredCount) {
              // 开始渐变停止动画
              setShakeIntensity('gentle');
              setTimeout(() => setShakeIntensity('fading'), 300);
              
              setTimeout(() => {
                setIsShaking(false);
                // 直接触发动画序列，避免依赖问题
                setStage('opening')
                
                const animationSequence = [
                  { delay: 1200, action: () => setStage('revealing') },
                  { delay: 3000, action: () => setStage('final') },
                  { delay: 4200, action: () => setShowEnvelope(false) },
                  { delay: 5000, action: () => {
                    setShowCard(true)
                    requestAnimationFrame(() => {
                      triggerInitialConfetti()
                      setTimeout(() => triggerConfetti(), 500)
                    })
                  }}
                ]
                
                animationSequence.forEach(({ delay, action }) => {
                  setTimeout(() => requestAnimationFrame(action), delay)
                })
              }, 800);
              return 0;
            }
            
            return newCount;
          });
          
          // 清除之前的超时
          if (shakeTimeoutRef.current) {
            clearTimeout(shakeTimeoutRef.current);
          }
          
          // 设置新的超时来逐渐停止摇动
          shakeTimeoutRef.current = setTimeout(() => {
            setShakeCount(prev => {
              const newCount = prev > 0 ? Math.max(0, prev - 0.5) : 0;
              
              // 如果摇动计数变低，开始渐变停止动画
              if (newCount <= 1 && isShaking) {
                setShakeIntensity('gentle');
                setTimeout(() => {
                  setShakeIntensity('fading');
                  setTimeout(() => {
                    setIsShaking(false);
                    setUnlockMethod(null);
                  }, 1000);
                }, 500);
              }
              
              return newCount;
            });
          }, 2000);
        }
      }
      
      lastX = x;
      lastY = y;
      lastZ = z;
    };

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceMotionEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        } catch (error) {
          console.log('Device motion permission denied');
        }
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, [stage, shakeThreshold, shakeRequiredCount, triggerInitialConfetti, triggerConfetti, isShaking])

  // 清理计时器
  useEffect(() => {
    return () => {
      if (chargeTimerRef.current) {
        clearInterval(chargeTimerRef.current);
      }
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, [])

  // Handle card mouse movement for 3D effect
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateX = (e.clientY - centerY) / 10;
    const rotateY = (centerX - e.clientX) / 10;
    
    setCardRotation({ x: rotateX, y: rotateY });
  };

  const handleCardMouseLeave = () => {
    setCardRotation({ x: 0, y: 0 });
    setIsHovering(false);
  };

  // Only allow confetti after the card is shown
  const handleCardClick = useCallback(() => {
    if (!showCard) return;
    triggerConfetti();
  }, [showCard, triggerConfetti]);

  // 长按充能处理函数
  const startCharging = () => {
    if (stage !== 'initial' || isCharging) return;
    
    setIsCharging(true);
    setUnlockMethod('longpress');
    setChargeProgress(0);
    chargeStartRef.current = Date.now();
    
    const chargeDuration = 2500;
    const updateInterval = 50;
    
    chargeTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - chargeStartRef.current;
      const progress = Math.min((elapsed / chargeDuration) * 100, 100);
      
      setChargeProgress(progress);
      
      if (progress >= 100) {
        if (chargeTimerRef.current) {
          clearInterval(chargeTimerRef.current);
        }
        setIsCharging(false);
        setTimeout(() => handleOpenClick(), 200);
      }
    }, updateInterval);
  };

  const stopCharging = () => {
    if (!isCharging) return;
    
    if (chargeTimerRef.current) {
      clearInterval(chargeTimerRef.current);
    }
    
    setIsCharging(false);
    
    const fadeOut = setInterval(() => {
      setChargeProgress(prev => {
        const newProgress = prev - 5;
        if (newProgress <= 0) {
          clearInterval(fadeOut);
          setUnlockMethod(null);
          return 0;
        }
        return newProgress;
      });
    }, 100);
  };

  const handleOpenClick = useCallback(() => {
    // 使用requestAnimationFrame优化动画时序
    setStage('opening')
    
    // 优化时序，减少状态更新频率
    const animationSequence = [
      { delay: 1200, action: () => setStage('revealing') },
      { delay: 3000, action: () => setStage('final') },
      { delay: 4200, action: () => setShowEnvelope(false) },
      { delay: 5000, action: () => {
        setShowCard(true)
        // 使用requestAnimationFrame确保DOM更新后再触发动画
        requestAnimationFrame(() => {
          triggerInitialConfetti()
          setTimeout(() => triggerConfetti(), 500)
        })
      }}
    ]
    
    animationSequence.forEach(({ delay, action }) => {
      setTimeout(() => requestAnimationFrame(action), delay)
    })
  }, [triggerInitialConfetti, triggerConfetti])

  // Mobile device motion → wobble the card
  useEffect(() => {
    if (!showCard) return;

    let lastX = 0;
    let lastY = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const x = acc.x ?? 0; // left/right
      const y = acc.y ?? 0; // up/down

      // Map acceleration to small rotations; smooth with simple damping
      const targetRotateX = Math.max(-10, Math.min(10, -y * 2));
      const targetRotateY = Math.max(-10, Math.min(10, x * 2));

      // Basic low-pass filter
      lastX = lastX + (targetRotateX - lastX) * 0.2;
      lastY = lastY + (targetRotateY - lastY) * 0.2;

      if (motionRafRef.current) cancelAnimationFrame(motionRafRef.current);
      motionRafRef.current = requestAnimationFrame(() => {
        setCardRotation({ x: lastX, y: lastY });
      });
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      if (motionRafRef.current) cancelAnimationFrame(motionRafRef.current);
    };
  }, [showCard])

  if (!imageSrc) {
    return (
      <div className="w-full flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[80vh] flex items-center justify-center">
      {/* Final Card Display */}
      <div className={cn(
        "transition-all duration-1000 w-full perspective-1000",
        !showEnvelope ? "opacity-100 scale-100" : "opacity-0 scale-90"
      )}>
        <div className="w-full mx-auto relative">
          <div className={cn(
            "gpu-optimized",
            showCard ? 'animate-card-reveal' : 'opacity-0 scale-90 translate-y-8'
          )}>
            <div className="relative w-full max-w-[400px] mx-auto">
              <div 
                ref={cardRef}
                className={cn(
                  "relative aspect-[2/3] overflow-hidden bg-transparent transform-gpu transition-all duration-300 cursor-pointer group",
                  isShaking && shakeIntensity === 'normal' ? "animate-shake" : "",
                  isShaking && shakeIntensity === 'gentle' ? "animate-shake-gentle" : "",
                  isShaking && shakeIntensity === 'fading' ? "animate-shake-fade" : ""
                )}
                style={{ 
                  maxHeight: '70vh',
                  transform: `perspective(1000px) rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
                  boxShadow: isHovering 
                    ? '0 25px 50px rgba(167, 134, 255, 0.35), 0 0 24px rgba(167, 134, 255, 0.25), 0 10px 25px rgba(255, 192, 203, 0.15)'
                    : '0 0 10px rgba(167, 134, 255, 0.12), 0 8px 20px rgba(0, 0, 0, 0.08)'
                }}
                onMouseMove={handleCardMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={handleCardMouseLeave}
                onClick={handleCardClick}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-purple-200/20 to-blue-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
                
                {isVideo(imageSrc) ? (
                  <video
                    src={imageSrc}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  >
                    <source src={imageSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Image
                    src={imageSrc}
                    alt={`${card.cardType} card `}
                    fill
                    priority
                    className="transition-all duration-500 group-hover:scale-105 object-cover"
                    unoptimized
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
                
                {isHovering && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping gpu-optimized"
                        style={{
                          left: `${20 + (i * 12)}%`,
                          top: `${15 + Math.sin(i) * 20}%`,
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: '2s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Envelope with Long Press & Shake */}
      {showEnvelope && (
        <div className={cn(
          "absolute inset-0 w-full perspective-envelope flex items-center justify-center",
          stage === 'initial' ? "cursor-pointer" : ""
        )}>
          <div className="w-full max-w-[500px] px-4">
            {stage === 'initial' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 space-y-4">
                <div className="text-center space-y-2 mb-4">
                  <p className="text-sm text-[#a786ff] font-medium animate-pulse">
                    {unlockMethod === 'shake' ? (
                      <>🤳 Keep shaking... ({shakeCount}/{shakeRequiredCount})</>
                    ) : unlockMethod === 'longpress' ? (
                      <>⏳ Keep holding...</>
                    ) : (
                      <>📱 Shake your device or long press to open</>
                    )}
                  </p>
                  {!unlockMethod && (
                    <p className="text-xs text-gray-500">
                      ✨ Choose your magical way to unlock
                    </p>
                  )}
                </div>

                <div
                  onMouseDown={startCharging}
                  onMouseUp={stopCharging}
                  onMouseLeave={stopCharging}
                  onTouchStart={startCharging}
                  onTouchEnd={stopCharging}
                  onContextMenu={(e) => { e.preventDefault(); }}
                  className={cn(
                    "group relative transform transition-all duration-500 hover:scale-110 focus:outline-none cursor-pointer select-none no-touch-callout",
                    isCharging ? "scale-105" : "animate-gentle-bounce",
                    isShaking && shakeIntensity === 'normal' ? "animate-shake" : "",
                    isShaking && shakeIntensity === 'gentle' ? "animate-shake-gentle" : "",
                    isShaking && shakeIntensity === 'fading' ? "animate-shake-fade" : ""
                  )}
                >
                  <div className="absolute inset-0 rounded-full animate-ping-slow bg-[#a786ff]/20" />
                  <div className="absolute inset-[-8px] rounded-full animate-pulse-slow bg-[#a786ff]/10" />
                  <div className="absolute inset-[-16px] rounded-full animate-ping bg-[#FFB6C1]/15" style={{ animationDuration: '3s' }} />
                  
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    {(isCharging || chargeProgress > 0) && (
                      <div className="absolute inset-0 rounded-full">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                          <circle
                            cx="72"
                            cy="72"
                            r="68"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="72"
                            cy="72"
                            r="68"
                            fill="none"
                            stroke="url(#chargeGradient)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 68}`}
                            strokeDashoffset={`${2 * Math.PI * 68 * (1 - chargeProgress / 100)}`}
                            className="transition-all duration-100 ease-out"
                          />
                          <defs>
                            <linearGradient id="chargeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#FF69B4" />
                              <stop offset="50%" stopColor="#FFB6C1" />
                              <stop offset="100%" stopColor="#FFC0CB" />
                            </linearGradient>
                          </defs>
                        </svg>
                        {isCharging && (
                          <div className="absolute inset-0 rounded-full bg-[#a786ff]/20 animate-pulse blur-sm"></div>
                        )}
                      </div>
                    )}

                    {isShaking && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {[...Array(shakeRequiredCount)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-3 h-3 rounded-full transition-all duration-300",
                              i < shakeCount 
                                ? "bg-[#a786ff] scale-110 animate-pulse" 
                                : "bg-white/30 scale-100"
                            )}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className={cn(
                      "absolute inset-2 rounded-full bg-gradient-to-br from-[#a786ff]/95 via-[#b19bff]/90 to-[#a786ff]/95 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_8px_32px_rgba(167,134,255,0.4)] backdrop-blur-sm transition-all duration-500",
                      isCharging ? "shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_12px_48px_rgba(167,134,255,0.8)] scale-105" : "group-hover:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_12px_48px_rgba(167,134,255,0.6)]"
                    )}></div>
                    
                    <div className={cn(
                      "absolute inset-4 rounded-full border-2 border-dashed border-white/40 transition-all duration-500 animate-slow-spin",
                      isCharging ? "border-white/70 rotate-[20deg]" : "group-hover:border-white/60 group-hover:rotate-[20deg]"
                    )}></div>
                    
                    <div className={cn(
                      "relative text-center transition-transform duration-500 z-10",
                      isCharging ? "scale-110" : "group-hover:scale-110"
                    )}>
                      <div className="text-[0.8rem] uppercase tracking-[0.2em] font-bold text-[#FFC0CB] 
                        [text-shadow:2px_2px_2px_rgba(0,0,0,0.4),-1px_-1px_1px_rgba(255,255,255,0.3)]">
                        {card.cardType}
                      </div>
                      <div className="text-[0.6rem] text-white/80 mt-1 transition-colors duration-300">
                        {new Date().toLocaleDateString()}
                      </div>
                      
                      {isCharging ? (
                        <div className="mt-2 text-[#FFC0CB] text-xs font-semibold">
                          <div className="animate-pulse">⚡ Charging...</div>
                          <div className="text-[0.5rem] mt-1 text-[#FF69B4]">{Math.round(chargeProgress)}%</div>
                        </div>
                      ) : unlockMethod === 'shake' ? (
                        <div className="mt-2 text-[#FFC0CB] text-xs font-semibold animate-bounce">
                          <span>🤳 Shake me!</span>
                        </div>
                      ) : (
                        <div className="mt-2 text-[#FFC0CB] text-xs font-semibold">
                          <div className="flex items-center justify-center gap-1">
                            <span className="animate-pulse">✨</span>
                            <span>Hold or Shake</span>
                            <span className="animate-pulse">✨</span>
                          </div>
                          <div className="mt-1 text-[0.5rem] flex items-center justify-center gap-1">
                            <span className="animate-bounce">📱</span>
                            <span className="animate-ping">🎁</span>
                      </div>
                      </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Envelope */}
            <div className={cn(
              "relative w-full aspect-[3/4] bg-gradient-to-br from-[#FFE5E5] via-[#FFEBEE] to-[#FFC0CB] rounded-lg shadow-xl gpu-optimized",
              stage === 'initial' ? "opacity-100" : "",
              stage === 'opening' ? "animate-envelope-open" : "",
              stage === 'revealing' ? "animate-envelope-slide-out" : "",
              stage === 'final' ? "animate-envelope-fade-out" : ""
            )}>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60"></div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl opacity-40 transform transition-all duration-1000">
                <span className="text-[#a786ff] animate-pulse" style={{ animationDuration: '3s' }}>💗</span>
              </div>

              <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                <div className="font-serif text-2xl tracking-widest text-[#a786ff]/50 transition-all duration-500" 
                     style={{ 
                       fontStyle: 'italic',
                       textShadow: '1px 1px 2px rgba(255,192,203,0.3)'
                     }}>
                  MewTruCard
                </div>
                <div className="w-40 h-px mx-auto mt-3 bg-gradient-to-r from-transparent via-[#a786ff]/40 to-transparent relative">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#a786ff]/60 rounded-full animate-pulse"></div>
                </div>
                <div className="mt-2 text-xs text-[#a786ff]/30 tracking-wider">
                  Special Delivery ✉️
                </div>
              </div>

              <div className={cn(
                "absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#FFC0CB] via-[#FFD1DC] to-[#FFE5E5] rounded-t-lg origin-top z-20 backface-hidden shadow-lg gpu-optimized",
                stage === 'initial' ? "" : "",
                stage === 'opening' ? "animate-envelope-open" : "",
                stage === 'revealing' ? "animate-envelope-open" : ""
              )}>
                <div className={cn(
                  "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 bg-gradient-to-br from-[#a786ff] via-[#b19bff] to-[#a786ff] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_4px_12px_rgba(167,134,255,0.4)] flex items-center justify-center transition-all duration-500 transform-gpu",
                  stage === 'initial' ? "opacity-100 scale-100 rotate-0" : "",
                  stage === 'opening' ? "opacity-80 scale-110 rotate-45" : "",
                  stage === 'revealing' ? "opacity-0 scale-150 rotate-90" : ""
                )}>
                  <span className="text-white text-xl drop-shadow-sm relative z-10">♥</span>
                </div>
              </div>
              
              <div className={cn(
                "absolute inset-4 bg-transparent rounded-lg shadow-inner transition-all duration-1000 transform-gpu",
                stage === 'revealing' 
                  ? "translate-y-[-120%] rotate-0 scale-110" 
                  : "translate-y-0 rotate-2"
              )}>
                <div className={cn(
                  "w-full h-full transition-opacity duration-500 rounded-lg overflow-hidden",
                  stage === 'revealing' ? "opacity-100" : "opacity-0"
                )}>
                  {isVideo(imageSrc) ? (
                    <video
                      src={imageSrc}
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-contain"
                    >
                      <source src={imageSrc} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={imageSrc}
                      alt={`${card.cardType} card preview`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Decorative Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {sparkles.map((sparkle) => (
                <div
                  key={sparkle.id}
                  className="absolute w-2 h-2 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full animate-sparkle-float shadow-sm"
                  style={{
                    left: `${sparkle.x}%`,
                    top: `${sparkle.y}%`,
                    animationDelay: `${sparkle.delay}s`,
                  }}
                />
              ))}

              {ribbonParticles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute w-1 h-4 rounded-full animate-ribbon-fall opacity-80"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    backgroundColor: particle.color,
                    animationDelay: `${particle.delay}s`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}

              {(stage === 'revealing' || stage === 'final') && [...Array(6)].map((_, i) => (
                <div
                  key={`original-${i}`}
                  className="absolute w-1.5 h-1.5 bg-gradient-to-br from-[#FFB1C1] to-[#DDA0DD] rounded-full animate-sparkle-dance shadow-sm gpu-optimized"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
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