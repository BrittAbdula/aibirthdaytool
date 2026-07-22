'use client'

import { useEffect, useState } from 'react'
import type { RecipientTheme } from '@/lib/recipient-themes'

interface Particle {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 6 + 4,
    duration: Math.random() * 12 + 15,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.3 + 0.15,
  }))
}

function particleGlyph(theme: RecipientTheme, index: number): React.ReactNode {
  switch (theme.particle) {
    case 'rain-to-light':
      // Sorry: gentle drops in the upper journey that soften into light flecks
      return index % 3 === 0 ? (
        <span style={{ color: theme.accent }} className="opacity-70">✦</span>
      ) : (
        <span
          className="inline-block rounded-full"
          style={{ width: 3, height: 10, background: `${theme.accent}55`, borderRadius: 9999 }}
        />
      )
    case 'confetti':
      return (
        <span
          className="inline-block rounded-sm"
          style={{
            width: 6,
            height: 6,
            background: index % 3 === 0 ? '#e5b72e' : index % 3 === 1 ? '#b4375f' : '#b1a0ff',
            transform: 'rotate(20deg)',
          }}
        />
      )
    case 'hearts':
      return <span style={{ color: theme.accent }}>{index % 2 === 0 ? '♥' : '♡'}</span>
    case 'sparkles':
      return <span style={{ color: index % 2 === 0 ? '#e5b72e' : theme.accent }}>✦</span>
    case 'petals':
    default:
      return (
        <span
          className="inline-block rounded-full"
          style={{ width: 6, height: 4, background: `${theme.accent}44`, borderRadius: '60% 40% 60% 40%' }}
        />
      )
  }
}

export default function MomentBackground({ theme }: { theme: RecipientTheme }) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setParticles(generateParticles(14))
    setMounted(true)
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: theme.baseGradient }} />

      {/* Soft bokeh orbs */}
      <div
        className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full animate-pulse motion-reduce:animate-none"
        style={{
          background: `radial-gradient(circle, ${theme.orbs[0]} 0%, transparent 70%)`,
          filter: 'blur(40px)',
          animationDuration: '4s',
        }}
      />
      <div
        className="absolute top-[60%] right-[10%] w-[250px] h-[250px] rounded-full animate-pulse motion-reduce:animate-none"
        style={{
          background: `radial-gradient(circle, ${theme.orbs[1]} 0%, transparent 70%)`,
          filter: 'blur(50px)',
          animationDuration: '5s',
          animationDelay: '1s',
        }}
      />
      <div
        className="absolute bottom-[20%] left-[5%] w-[200px] h-[200px] rounded-full animate-pulse motion-reduce:animate-none"
        style={{
          background: `radial-gradient(circle, ${theme.orbs[2]} 0%, transparent 70%)`,
          filter: 'blur(35px)',
          animationDelay: '2s',
          animationDuration: '6s',
        }}
      />

      {/* Drifting particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden motion-reduce:hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: '-20px',
                fontSize: `${p.size + 6}px`,
                opacity: p.opacity,
                animation: `moment-drift ${p.duration}s linear ${p.delay}s infinite`,
              }}
            >
              {particleGlyph(theme, p.id)}
            </div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes moment-drift {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(30px) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes floatGentle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float-dreamy,
          .animate-wiggle-cute {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
