'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"
import { PaperGrain, WaxSeal } from '@/components/home/card-art'

interface CardDisplayProps {
  card: {
    cardId?: string
    cardType: string
    r2Url?: string
    svgContent?: string
  }
  recipientName?: string | null
}

/**
 * The opening ritual, in five acts:
 *   initial   — the envelope floats in a quiet spotlight; the seal glints.
 *   cracking  — the wax presses in, splits, shards fly, a ring of light blooms.
 *   opening   — the flap lifts and warm light leaks out; gold motes rise.
 *   rising    — the card ascends out of the light as the envelope sinks away.
 *   final     — the card floats in a breathing halo with a slow sheen.
 */
type Stage = 'initial' | 'cracking' | 'opening' | 'rising' | 'final'

if (typeof document !== 'undefined' && !document.querySelector('#card-display-styles')) {
  const style = document.createElement('style');
  style.id = 'card-display-styles';
  style.textContent = `
    :root {
      --ease-out-soft: cubic-bezier(0.4, 0.0, 0.2, 1);
      --ease-rise: cubic-bezier(0.16, 1, 0.3, 1);
    }

    .no-touch-callout { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; }

    /* ——— ambient stage ——— */
    @keyframes amb-drift {
      0%, 100% { transform: translateY(0); opacity: 0.25; }
      50% { transform: translateY(-16px); opacity: 0.7; }
    }
    @keyframes float-gentle {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .animate-float-gentle { animation: float-gentle 5.5s ease-in-out infinite; }
    @keyframes float-soul {
      0%, 100% { transform: translateY(0) rotate(-0.4deg); }
      50% { transform: translateY(-10px) rotate(0.5deg); }
    }

    @keyframes spot-breathe {
      0%, 100% { transform: scale(1); opacity: 0.75; }
      50% { transform: scale(1.08); opacity: 1; }
    }

    /* the seal glints while it waits */
    @keyframes seal-glint {
      0%, 78%, 100% { transform: translateX(-130%) rotate(18deg); }
      88% { transform: translateX(130%) rotate(18deg); }
    }
    @keyframes seal-ring-pulse {
      0% { transform: scale(1); opacity: 0.4; }
      75%, 100% { transform: scale(1.65); opacity: 0; }
    }
    @keyframes hint-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* ——— act 1: the crack ——— */
    @keyframes seal-press {
      0% { transform: scale(1); }
      45% { transform: scale(0.86); }
      100% { transform: scale(1.02); }
    }
    @keyframes seal-half-left {
      0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
      100% { transform: translate(-34px, 44px) rotate(-42deg); opacity: 0; }
    }
    @keyframes seal-half-right {
      0% { transform: translate(0,0) rotate(0deg); opacity: 1; }
      100% { transform: translate(30px, 38px) rotate(36deg); opacity: 0; }
    }
    @keyframes shard-fly {
      0% { transform: translate(0,0) scale(1); opacity: 1; }
      100% { transform: translate(var(--sx), var(--sy)) scale(0.4); opacity: 0; }
    }
    @keyframes ring-burst {
      0% { transform: scale(0.2); opacity: 0.9; }
      100% { transform: scale(3); opacity: 0; }
    }
    @keyframes envelope-jolt {
      0%, 100% { transform: translateY(0); }
      35% { transform: translateY(3px); }
      65% { transform: translateY(-2px); }
    }

    /* ——— act 2: light leaks out ——— */
    /* the flap lifts toward the viewer, then over the hinge — never through the envelope */
    @keyframes envelope-open-flap {
      0% { transform: rotateX(0deg); }
      100% { transform: rotateX(182deg); }
    }
    @keyframes glow-bloom {
      0% { opacity: 0; transform: scale(0.5); }
      60% { opacity: 0.95; }
      100% { opacity: 0.8; transform: scale(1.15); }
    }
    @keyframes mote-rise {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      15% { opacity: 0.9; }
      100% { transform: translateY(var(--my, -120px)) translateX(var(--mx, 0px)); opacity: 0; }
    }

    /* ——— act 3: ascension ——— */
    @keyframes preview-ascend {
      0% { transform: translate(-50%, 0) rotate(0deg); }
      100% { transform: translate(-50%, -46%) rotate(-2deg); }
    }
    @keyframes envelope-sink {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(80px) scale(0.94); opacity: 0; }
    }
    @keyframes card-ascend {
      0% { transform: translateY(180px) scale(0.88) rotate(-2.5deg); opacity: 0; }
      55% { opacity: 1; }
      70% { transform: translateY(-16px) scale(1.03) rotate(1deg); }
      100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
    }

    /* ——— act 4: presence ——— */
    @keyframes halo-breathe {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.07); opacity: 1; }
    }
    @keyframes sheen-sweep {
      0%, 72%, 100% { transform: translateX(-160%) rotate(12deg); }
      86% { transform: translateX(160%) rotate(12deg); }
    }

    .animate-envelope-open-flap {
      animation: envelope-open-flap 1s var(--ease-out-soft) forwards;
      transform-origin: top;
      will-change: transform;
    }

    .perspective-envelope { perspective: 1200px; }
    .transform-style-3d { transform-style: preserve-3d; }

    @media (prefers-reduced-motion: reduce) {
      .ritual-anim, .animate-float-gentle, .animate-envelope-open-flap { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

/** Sparse gold dust that lives on the stage the whole time. */
const AMBIENT_MOTES = [
  { left: '8%', top: '18%', size: 5, dur: 7, delay: 0 },
  { left: '16%', top: '64%', size: 4, dur: 9, delay: 1.8 },
  { left: '28%', top: '34%', size: 3, dur: 8, delay: 3.1 },
  { left: '72%', top: '22%', size: 4, dur: 8.5, delay: 0.9 },
  { left: '84%', top: '58%', size: 5, dur: 7.5, delay: 2.4 },
  { left: '90%', top: '30%', size: 3, dur: 9.5, delay: 4.0 },
];

/** Wax shards that fly when the seal cracks. */
const SEAL_SHARDS = [
  { sx: '-42px', sy: '18px', size: 6, delay: 0 },
  { sx: '38px', sy: '10px', size: 5, delay: 0.02 },
  { sx: '-20px', sy: '-30px', size: 4, delay: 0.04 },
  { sx: '26px', sy: '-24px', size: 5, delay: 0.01 },
  { sx: '4px', sy: '40px', size: 4, delay: 0.05 },
];

/** Gold motes that rise out of the opened envelope. */
const RISING_MOTES = [
  { left: '34%', mx: '-14px', my: '-110px', size: 5, dur: 2.2, delay: 0 },
  { left: '46%', mx: '8px', my: '-150px', size: 4, dur: 2.6, delay: 0.25 },
  { left: '58%', mx: '18px', my: '-120px', size: 5, dur: 2.3, delay: 0.5 },
  { left: '40%', mx: '-22px', my: '-140px', size: 3, dur: 2.8, delay: 0.75 },
  { left: '64%', mx: '-6px', my: '-100px', size: 4, dur: 2.4, delay: 1.0 },
  { left: '52%', mx: '14px', my: '-160px', size: 3, dur: 3.0, delay: 1.25 },
];

export default function CardDisplay({ card, recipientName }: CardDisplayProps) {
  const [stage, setStage] = useState<Stage>('initial')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const lastShakeRef = useRef<number>(0)
  const shakeThreshold = 15

  const isVideo = (url?: string) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  useEffect(() => {
    if (card.svgContent) {
      setImageSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(card.svgContent)}`)
    } else if (card.r2Url) {
      setImageSrc(card.r2Url)
    }
  }, [card.r2Url, card.svgContent])

  // Two-beat confetti in the house palette: an upward fan, then a soft echo.
  const triggerConfetti = useCallback(() => {
    const colors = ["#B4375F", "#E5B72E", "#F8B7C7", "#B1A0FF", "#FFF3C4"];
    confetti({
      particleCount: 44,
      angle: 90,
      spread: 68,
      origin: { x: 0.5, y: 0.52 },
      colors,
      shapes: ['circle', 'square'],
      scalar: 0.85,
      gravity: 0.55,
      decay: 0.93,
      startVelocity: 34,
      ticks: 260,
    });
    setTimeout(() => {
      confetti({
        particleCount: 22,
        angle: 90,
        spread: 110,
        origin: { x: 0.5, y: 0.48 },
        colors,
        shapes: ['circle'],
        scalar: 0.6,
        gravity: 0.35,
        decay: 0.95,
        startVelocity: 16,
        ticks: 300,
      });
    }, 420);
  }, []);

  const handleOpen = useCallback(() => {
    if (stage !== 'initial') return;
    setStage('cracking');
    setTimeout(() => setStage('opening'), 520);
    setTimeout(() => setStage('rising'), 1750);
    setTimeout(() => {
      setStage('final');
      requestAnimationFrame(triggerConfetti);
      window.dispatchEvent(new CustomEvent('mtc:card-revealed'));
    }, 3150);
  }, [stage, triggerConfetti]);

  // Shake to open
  useEffect(() => {
    if (stage !== 'initial') return;
    let lastX = 0, lastY = 0, lastZ = 0;
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const a = event.accelerationIncludingGravity;
      if (!a) return;
      const delta = Math.abs((a.x ?? 0) - lastX) + Math.abs((a.y ?? 0) - lastY) + Math.abs((a.z ?? 0) - lastZ);
      if (delta > shakeThreshold) {
        const now = Date.now();
        if (now - lastShakeRef.current > 500) {
          lastShakeRef.current = now;
          handleOpen();
        }
      }
      lastX = a.x ?? 0; lastY = a.y ?? 0; lastZ = a.z ?? 0;
    };
    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        try {
          if ((await (DeviceMotionEvent as any).requestPermission()) === 'granted') {
            window.addEventListener('devicemotion', handleDeviceMotion);
          }
        } catch { /* denied */ }
      } else {
        window.addEventListener('devicemotion', handleDeviceMotion);
      }
    };
    requestPermission();
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, [stage, handleOpen]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCardRotation({
      x: (e.clientY - (rect.top + rect.height / 2)) / 25,
      y: ((rect.left + rect.width / 2) - e.clientX) / 25,
    });
  };

  if (!imageSrc) {
    return (
      <div className="w-full flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary/60"></div>
      </div>
    )
  }

  const opened = stage !== 'initial';
  const envelopeGone = stage === 'final';

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[80vh] flex items-center justify-center">
      {/* ambient gold dust, always on stage */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {AMBIENT_MOTES.map((m, i) => (
          <span
            key={i}
            className="ritual-anim absolute rounded-full bg-[#E5B72E]"
            style={{
              left: m.left, top: m.top, width: m.size, height: m.size,
              boxShadow: '0 0 8px 2px rgba(229,183,46,0.35)',
              animation: `amb-drift ${m.dur}s ease-in-out ${m.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ——— FINAL CARD ——— */}
      <div className={cn(
        "w-full relative z-10 transition-opacity duration-500",
        envelopeGone ? "opacity-100" : "opacity-0 pointer-events-none absolute"
      )}>
        <div className={cn("w-full mx-auto relative", envelopeGone && "ritual-anim")}
          style={envelopeGone ? { animation: 'card-ascend 1.5s var(--ease-rise) both' } : undefined}
        >
          <div className="relative w-full max-w-[400px] mx-auto animate-float-gentle">
            {/* breathing halo: blush core, gold rim */}
            <div
              aria-hidden
              className="ritual-anim absolute -inset-12 rounded-full"
              style={{
                background: 'radial-gradient(closest-side, rgba(248,183,199,0.55) 0%, rgba(229,183,46,0.18) 55%, transparent 75%)',
                animation: 'halo-breathe 5s ease-in-out infinite',
              }}
            />
            <div
              ref={cardRef}
              className="relative transform-gpu cursor-pointer rounded-xl bg-white p-2 ring-1 ring-[#F1D6DF] transition-all duration-300 shadow-[0_3px_5px_rgba(32,42,61,0.12),14px_26px_48px_-18px_rgba(140,34,71,0.4)]"
              style={{ transform: `perspective(1000px) rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)` }}
              onMouseMove={handleCardMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => { setCardRotation({ x: 0, y: 0 }); setIsHovering(false); }}
              onClick={triggerConfetti}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[#FFF8F6]">
                {isVideo(imageSrc) ? (
                  <video src={imageSrc} controls autoPlay muted loop className="w-full h-full object-cover">
                    <source src={imageSrc} type="video/mp4" />
                  </video>
                ) : (
                  <Image src={imageSrc} alt={`${card.cardType} card`} fill priority className="object-cover" unoptimized />
                )}
                {/* a slow light sweep across the kept card */}
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                  <div
                    className="ritual-anim absolute -inset-y-8 w-1/3"
                    style={{
                      background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)',
                      animation: 'sheen-sweep 7.5s ease-in-out 1.8s infinite',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ——— THE SEALED ENVELOPE ———
          Real anatomy: one body, three lower flaps meeting at an apex, and a
          top flap whose edges land on that same apex — so the closed envelope
          shows a single set of creases, and opening reveals a cream liner. */}
      {!envelopeGone && (
        <div className="absolute inset-0 w-full perspective-envelope flex items-center justify-center z-20">
          {/* spotlight behind the envelope */}
          <div
            aria-hidden
            className="ritual-anim pointer-events-none absolute h-[480px] w-[480px] rounded-full"
            style={{
              background: 'radial-gradient(closest-side, rgba(255,236,240,0.95) 0%, rgba(229,183,46,0.10) 55%, transparent 75%)',
              animation: 'spot-breathe 6s ease-in-out infinite',
            }}
          />
          <div
            className={cn(
              "relative w-full max-w-[420px] cursor-pointer",
              stage === 'initial' && "ritual-anim",
              stage === 'cracking' && "ritual-anim"
            )}
            style={
              stage === 'initial'
                ? { animation: 'float-soul 6.5s ease-in-out infinite' }
                : stage === 'cracking'
                  ? { animation: 'envelope-jolt 0.5s ease-out both' }
                  : stage === 'rising'
                    ? { animation: 'envelope-sink 1.4s var(--ease-out-soft) 0.35s both' }
                    : undefined
            }
            onClick={handleOpen}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            role="button"
            aria-label="Open your card"
          >
            <div className="relative aspect-[4/3] transform-style-3d">
              {/* body + liner (the inside you see once the flap lifts) */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl bg-[#FFF5F0] shadow-[10px_26px_54px_-18px_rgba(140,34,71,0.42)]">
                <svg width="100%" height="100%" aria-hidden className="absolute inset-0 opacity-70">
                  <pattern id="reveal-liner" width="14" height="14" patternUnits="userSpaceOnUse">
                    <circle cx="3" cy="3" r="1.1" fill="#E5B72E" opacity="0.35" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#reveal-liner)" />
                </svg>
                <div className="absolute inset-0 shadow-[inset_0_22px_30px_-16px_rgba(140,34,71,0.28)]" />
              </div>

              {/* warm light leaking from inside once the flap lifts */}
              <div
                aria-hidden
                className={cn("ritual-anim absolute left-1/2 top-[18%] z-[15] h-[52%] w-[88%] -translate-x-1/2 rounded-[50%]", !opened && "opacity-0")}
                style={{
                  background: 'radial-gradient(closest-side, rgba(255,243,196,0.95) 0%, rgba(248,183,199,0.45) 60%, transparent 80%)',
                  filter: 'blur(6px)',
                  animation: stage === 'opening' || stage === 'rising' ? 'glow-bloom 1.1s var(--ease-out-soft) 0.45s both' : undefined,
                }}
              />

              {/* gold motes rising out of the mouth */}
              {(stage === 'opening' || stage === 'rising') && (
                <div className="pointer-events-none absolute inset-0 z-[16]" aria-hidden>
                  {RISING_MOTES.map((m, i) => (
                    <span
                      key={i}
                      className="ritual-anim absolute top-[40%] rounded-full bg-[#E5B72E]"
                      style={{
                        left: m.left, width: m.size, height: m.size,
                        boxShadow: '0 0 10px 3px rgba(229,183,46,0.4)',
                        ['--mx' as any]: m.mx, ['--my' as any]: m.my,
                        animation: `mote-rise ${m.dur}s ease-out ${m.delay}s both`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* the card waiting inside, ascending with the light */}
              <div
                className="ritual-anim absolute left-1/2 top-[15%] z-10 w-[60%] -translate-x-1/2"
                style={
                  stage === 'opening' || stage === 'rising'
                    ? { animation: 'preview-ascend 1.6s var(--ease-rise) 0.75s both' }
                    : undefined
                }
              >
                <div className="relative rounded-lg bg-[#FFFEFB] p-2 shadow-[6px_10px_22px_-10px_rgba(32,42,61,0.35)] ring-1 ring-[#F1D6DF]">
                  <PaperGrain id="grain-reveal-card" className="absolute inset-0 rounded-lg opacity-[0.45]" />
                  <div className="relative flex aspect-[3/2] flex-col items-center justify-center rounded-md border border-[#E9D3A8]">
                    <p className="font-hand text-2xl leading-none text-[#525B70]">
                      {recipientName ? `For ${recipientName}.` : 'For you.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* lower flaps: left, right, bottom — meeting at the apex */}
              <div className="absolute inset-0 z-20 overflow-hidden rounded-2xl">
                <svg viewBox="0 0 100 75" preserveAspectRatio="none" className="h-full w-full">
                  <defs>
                    <linearGradient id="reveal-flap-l" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F9CAD5" />
                      <stop offset="100%" stopColor="#F3B2C1" />
                    </linearGradient>
                    <linearGradient id="reveal-flap-r" x1="1" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F8C5D1" />
                      <stop offset="100%" stopColor="#F1AEBE" />
                    </linearGradient>
                    <linearGradient id="reveal-flap-b" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F5B9C7" />
                      <stop offset="100%" stopColor="#F0A9BA" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,0 50,44 0,75" fill="url(#reveal-flap-l)" />
                  <polygon points="100,0 50,44 100,75" fill="url(#reveal-flap-r)" />
                  <polygon points="0,75 50,44 100,75" fill="url(#reveal-flap-b)" />
                  {/* creases: shadow, then highlight */}
                  <path d="M0 75 L50 44 L100 75" fill="none" stroke="#DC8AA3" strokeWidth="0.7" opacity="0.55" />
                  <path d="M0 74 L50 43.2 L100 74" fill="none" stroke="#FFE1E8" strokeWidth="0.6" opacity="0.8" />
                  <path d="M0 0 L50 44 L100 0" fill="none" stroke="#FFE6EC" strokeWidth="0.7" opacity="0.9" />
                </svg>
                <PaperGrain id="grain-reveal-pocket" className="absolute inset-0 opacity-[0.3]" />
              </div>

              {/* top flap — two faces, so lifting it reveals the liner underneath */}
              <div
                className={cn(
                  "absolute inset-x-0 top-0 z-30 h-[58.7%] transform-style-3d transition-transform duration-300 ease-out",
                  opened && "animate-envelope-open-flap"
                )}
                style={
                  opened
                    ? { animationDelay: '0.85s', transformOrigin: 'top', transform: 'rotateX(0deg)' }
                    : { transformOrigin: 'top', transform: isHovering ? 'rotateX(7deg)' : 'rotateX(0deg)' }
                }
              >
                {/* outside of the flap */}
                <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="absolute inset-0 h-full w-full drop-shadow-[0_6px_8px_rgba(140,34,71,0.18)] [backface-visibility:hidden]">
                  <defs>
                    <linearGradient id="reveal-flap-top" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FBD3DC" />
                      <stop offset="100%" stopColor="#F3B4C3" />
                    </linearGradient>
                  </defs>
                  <path d="M0 0 H100 L51.8 42.6 Q50 44.2 48.2 42.6 Z" fill="url(#reveal-flap-top)" />
                  <path d="M0 0 L50 43.4 L100 0" fill="none" stroke="#DC8AA3" strokeWidth="0.8" opacity="0.7" />
                </svg>
                {/* inside of the flap */}
                <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="absolute inset-0 h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <path d="M0 0 H100 L51.8 42.6 Q50 44.2 48.2 42.6 Z" fill="#FFF3EE" />
                  <path d="M0 0 L50 43.4 L100 0" fill="none" stroke="#F0CBB8" strokeWidth="0.8" opacity="0.8" />
                </svg>

                {/* the intact wax seal sits on the flap's tip — outermost, and it moves with the flap */}
                {stage === 'initial' && (
                  <div className="absolute left-1/2 top-full z-10 aspect-square w-[17%] -translate-x-1/2 -translate-y-1/2 [backface-visibility:hidden]">
                    <span
                      aria-hidden
                      className="ritual-anim absolute inset-0 rounded-full bg-primary/40"
                      style={{ animation: 'seal-ring-pulse 2.4s ease-out infinite' }}
                    />
                    <div className={cn("relative transition-transform duration-300", isHovering && "scale-110")}>
                      <WaxSeal className="w-full drop-shadow-[2px_6px_8px_rgba(140,34,71,0.4)]" />
                      {/* glint sweeping across the wax */}
                      <div aria-hidden className="absolute inset-[8%] overflow-hidden rounded-full">
                        <div
                          className="ritual-anim absolute -inset-y-2 w-1/3"
                          style={{
                            background: 'linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)',
                            animation: 'seal-glint 4.2s ease-in-out 1s infinite',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* the crack happens on the flap tip too — same plane as the wax, never behind it */}
                {(stage === 'cracking' || stage === 'opening') && (
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 aspect-square w-[17%] -translate-x-1/2 -translate-y-1/2 [backface-visibility:hidden]">
                    {/* ring of light from the break point */}
                    <span
                      aria-hidden
                      className="ritual-anim absolute inset-[-30%] rounded-full border-2 border-[#E5B72E]/70"
                      style={{ animation: 'ring-burst 0.7s ease-out 0.18s both' }}
                    />
                    <span
                      aria-hidden
                      className="ritual-anim absolute inset-[-30%] rounded-full border border-white/80"
                      style={{ animation: 'ring-burst 0.9s ease-out 0.26s both' }}
                    />
                    {/* the seal presses in, then splits */}
                    <div className="ritual-anim relative" style={{ animation: 'seal-press 0.34s ease-in both' }}>
                      <WaxSeal className="w-full opacity-0" />
                      <div className="absolute inset-0" style={{ clipPath: 'polygon(0 0, 56% 0, 44% 100%, 0 100%)' }}>
                        <div className="ritual-anim" style={{ animation: 'seal-half-left 0.85s ease-in 0.3s both' }}>
                          <WaxSeal className="w-full" />
                        </div>
                      </div>
                      <div className="absolute inset-0" style={{ clipPath: 'polygon(56% 0, 100% 0, 100% 100%, 44% 100%)' }}>
                        <div className="ritual-anim" style={{ animation: 'seal-half-right 0.8s ease-in 0.3s both' }}>
                          <WaxSeal className="w-full" />
                        </div>
                      </div>
                    </div>
                    {/* wax shards */}
                    {SEAL_SHARDS.map((sh, i) => (
                      <span
                        key={i}
                        aria-hidden
                        className="ritual-anim absolute left-1/2 top-1/2 rounded-[2px] bg-[#A03053]"
                        style={{
                          width: sh.size, height: sh.size,
                          ['--sx' as any]: sh.sx, ['--sy' as any]: sh.sy,
                          animation: `shard-fly 0.75s ease-out ${0.3 + sh.delay}s both`,
                        }}
                      />
                    ))}
                  </div>
              )}
              </div>

            </div>

            {/* Invitation */}
            {stage === 'initial' && (
              <div className="absolute -bottom-16 left-0 right-0 text-center">
                <p
                  className="ritual-anim inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-[#202A3D] shadow-sm ring-1 ring-[#F1D6DF] backdrop-blur"
                  style={{ animation: 'hint-in 0.8s ease-out 0.9s both' }}
                >
                  {recipientName ? `Sealed for ${recipientName} — break the wax` : 'Sealed for you — break the wax'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
