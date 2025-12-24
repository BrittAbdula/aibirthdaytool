'use client'

import { useEffect, useState } from 'react'

interface Snowflake {
  id: number
  x: number
  size: number
  duration: number
  delay: number
  opacity: number
  type: 'snowflake' | 'star' | 'dot'
}

function generateSnowflakes(count: number): Snowflake[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: Math.random() * 6 + 4,
    duration: Math.random() * 12 + 15,
    delay: Math.random() * 8,
    opacity: Math.random() * 0.3 + 0.15,
    type: Math.random() > 0.7 ? 'star' : Math.random() > 0.4 ? 'snowflake' : 'dot'
  }))
}

export default function ChristmasBackground() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSnowflakes(generateSnowflakes(15))
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient - elegant Christmas palette */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(196, 30, 58, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(45, 90, 63, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(255, 250, 240, 1) 0%, rgba(253, 245, 230, 1) 100%)
          `
        }}
      />

      {/* Soft bokeh orbs */}
      <div 
        className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(196, 30, 58, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animationDuration: '4s'
        }}
      />
      <div 
        className="absolute top-[60%] right-[10%] w-[250px] h-[250px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(45, 90, 63, 0.15) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDuration: '5s',
          animationDelay: '1s'
        }}
      />
      <div 
        className="absolute bottom-[20%] left-[5%] w-[200px] h-[200px] rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(218, 165, 32, 0.1) 0%, transparent 70%)',
          filter: 'blur(35px)',
          animationDuration: '6s',
          animationDelay: '2s'
        }}
      />

      {/* Snowfall */}
      <div className="absolute inset-0 overflow-hidden">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute"
            style={{
              left: `${flake.x}%`,
              top: '-20px',
              fontSize: `${flake.size}px`,
              opacity: flake.opacity,
              animation: `snowfall ${flake.duration}s linear ${flake.delay}s infinite`,
            }}
          >
            {flake.type === 'snowflake' ? (
              <span className="text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">❄</span>
            ) : flake.type === 'star' ? (
              <span className="text-[#daa520] drop-shadow-[0_0_3px_rgba(218,165,32,0.6)]">✦</span>
            ) : (
              <span 
                className="inline-block rounded-full bg-white"
                style={{ 
                  width: `${flake.size * 0.4}px`, 
                  height: `${flake.size * 0.4}px`,
                  boxShadow: '0 0 4px rgba(255,255,255,0.9)'
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#2d5a3f]">
          <path
            d="M0,0 Q30,20 20,50 Q10,30 0,20 Z"
            fill="currentColor"
          />
          <circle cx="15" cy="25" r="3" fill="#c41e3a" opacity="0.6" />
          <circle cx="25" cy="15" r="2" fill="#daa520" opacity="0.5" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 opacity-20 rotate-90">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#2d5a3f]">
          <path
            d="M0,0 Q30,20 20,50 Q10,30 0,20 Z"
            fill="currentColor"
          />
          <circle cx="15" cy="25" r="3" fill="#c41e3a" opacity="0.6" />
          <circle cx="25" cy="15" r="2" fill="#daa520" opacity="0.5" />
        </svg>
      </div>

      {/* Floating holly leaves */}
      <div className="absolute bottom-[15%] right-[8%] animate-[floatGentle_4s_ease-in-out_infinite]">
        <span className="text-3xl opacity-40 drop-shadow-md">🍃</span>
      </div>
      <div className="absolute top-[25%] left-[5%] animate-[floatGentle_5s_ease-in-out_infinite_0.5s]">
        <span className="text-2xl opacity-30">🌿</span>
      </div>

      {/* Subtle sparkle overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMC41IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] opacity-40" />

      {/* Christmas animation styles */}
      <style jsx global>{`
        @keyframes snowfall {
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
            transform: translateY(100vh) translateX(30px) rotate(360deg);
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

        /* Ensure animations work with opacity-0 initial state */
        .animate-\\[fadeUp_0\\.8s_ease-out_forwards\\],
        .animate-\\[fadeUp_0\\.8s_ease-out_0\\.3s_forwards\\],
        .animate-\\[fadeUp_0\\.8s_ease-out_0\\.5s_forwards\\],
        .animate-\\[fadeUp_0\\.8s_ease-out_0\\.8s_forwards\\],
        .animate-\\[fadeUp_0\\.8s_ease-out_0\\.9s_forwards\\],
        .animate-\\[fadeUp_0\\.8s_ease-out_1s_forwards\\] {
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  )
}

