/* Shared hand-built card artwork for the homepage — one visual language
   (line weight, palette, letterpress framing) across every card we draw. */

export function PaperGrain({ id, className }: { id: string; className?: string }) {
  return (
    <svg width="100%" height="100%" className={`pointer-events-none ${className ?? ""}`} aria-hidden>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.42" />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter={`url(#${id})`} />
    </svg>
  );
}

export function WaxSeal({ className }: { className?: string }) {
  const blob =
    "M32 3c6 0 8 3.4 13 4.6 5 1.2 9 4 10.6 9 1.7 5.2-.8 8.6 0 13.6.7 4.7 4 8.2 2 13-2 4.9-6.2 6.3-10 9-3.9 2.7-6.3 6.6-11.8 6.6-5.4 0-8.2-3.6-12.9-5.4-4.8-1.8-9.5-2.5-11.8-7.3-2.2-4.7.6-8.5.2-13.5-.4-4.8-3-8.7-1-13.3 2-4.8 6.3-6 10.4-8.4C24.8 8.5 26.4 3 32 3Z";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <clipPath id="seal-clip">
        <path d={blob} />
      </clipPath>
      <path d={blob} fill="#A03053" stroke="#8C2247" strokeWidth="1.6" />
      {/* bottom shade + top light, clipped to the wax blob */}
      <g clipPath="url(#seal-clip)">
        <ellipse cx="34" cy="57" rx="26" ry="10" fill="#8C2247" opacity="0.5" />
        <ellipse cx="26" cy="9" rx="20" ry="7" fill="#D96A8E" opacity="0.55" />
      </g>
      <circle cx="32" cy="32" r="18.5" fill="none" stroke="#FBD3DF" strokeWidth="1.4" opacity="0.5" />
      <text
        x="32"
        y="41"
        textAnchor="middle"
        fontFamily="var(--font-caveat), serif"
        fontStyle="italic"
        fontWeight="600"
        fontSize="26"
        fill="#FBD3DF"
      >
        M
      </text>
    </svg>
  );
}

export function BirthdayCakeArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 110" fill="none" className={className} aria-hidden>
      {/* flame + halo */}
      <circle className="mtc-twinkle" cx="60" cy="16" r="9" fill="#E5B72E" opacity="0.18" />
      <path className="mtc-flame" d="M60 8c-3.6 5-4.4 8.2 0 11.2 4.4-3 3.6-6.2 0-11.2Z" fill="#E5B72E" />
      {/* striped candle */}
      <rect x="56.5" y="22" width="7" height="16" rx="2.4" fill="#fff" stroke="#B4375F" strokeWidth="2.6" />
      <path d="M57 28l6-3.4M57 34l6-3.4" stroke="#B4375F" strokeWidth="1.8" strokeLinecap="round" />
      {/* top tier with icing drips */}
      <rect x="38" y="42" width="44" height="20" rx="6" fill="#fff" stroke="#B4375F" strokeWidth="3" />
      <path
        d="M38 48q4 6 8.5 1t9 1 9-1 8.5 1 9-2"
        stroke="#B4375F"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M46 60v4M70 60v5" stroke="#B4375F" strokeWidth="2.4" strokeLinecap="round" />
      {/* cherry */}
      <circle cx="82" cy="40" r="4" fill="#B4375F" />
      <path d="M82 36c1-3 3-4 5-4" stroke="#B4375F" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* base tier with piped scallops */}
      <rect x="26" y="64" width="68" height="26" rx="7" fill="#FFE8F0" stroke="#B4375F" strokeWidth="3" />
      <path
        d="M26 70q6 7 12 0t12 0 12 0 12 0 12 0"
        stroke="#B4375F"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="44" cy="81" r="2.4" fill="#E5B72E" />
      <circle cx="60" cy="83" r="2.4" fill="#E5B72E" />
      <circle cx="76" cy="81" r="2.4" fill="#E5B72E" />
      {/* plate + crumbs */}
      <ellipse cx="60" cy="97" rx="42" ry="5.5" fill="#fff" stroke="#B4375F" strokeWidth="2.6" />
      <circle cx="20" cy="105" r="1.6" fill="#B4375F" opacity="0.5" />
      <circle cx="102" cy="104" r="1.4" fill="#E5B72E" opacity="0.7" />
    </svg>
  );
}

export function HeartArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 104" fill="none" className={className} aria-hidden>
      <path
        d="M60 88C33 68 21 52 21 38c0-12 9-21 21-21 8 0 14 4 18 12 4-8 10-12 18-12 12 0 21 9 21 21 0 14-12 30-39 50Z"
        fill="#FFE8F0"
        stroke="#B4375F"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="92" cy="20" r="3" fill="#E5B72E" />
    </svg>
  );
}

export function OliveBranchArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 104" fill="none" className={className} aria-hidden>
      <path
        d="M36 88C54 72 68 54 84 22"
        stroke="#B4375F"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="46" cy="62" rx="15" ry="6.5" fill="#FFE8F0" stroke="#B4375F" strokeWidth="3" transform="rotate(-30 46 62)" />
      <ellipse cx="80" cy="52" rx="14" ry="6" fill="#FFE8F0" stroke="#B4375F" strokeWidth="3" transform="rotate(-64 80 52)" />
      <ellipse cx="58" cy="34" rx="13" ry="5.5" fill="#FFE8F0" stroke="#B4375F" strokeWidth="3" transform="rotate(-24 58 34)" />
      <circle cx="90" cy="16" r="3.2" fill="#E5B72E" />
    </svg>
  );
}

export function RingsArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 104" fill="none" className={className} aria-hidden>
      <circle cx="47" cy="62" r="22" stroke="#B4375F" strokeWidth="3" fill="none" />
      <circle cx="73" cy="62" r="22" stroke="#B4375F" strokeWidth="3" fill="none" />
      <path className="mtc-twinkle" d="M73 22l-7 8 7 8 7-8-7-8Z" fill="#E5B72E" stroke="#B4375F" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

export function FountainPenArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 210 48" fill="none" className={className} aria-hidden>
      {/* nib */}
      <path d="M6 24 L40 14 L40 34 Z" fill="#E5B72E" stroke="#B98D1F" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 24 L36 24" stroke="#8C6B14" strokeWidth="1.6" strokeLinecap="round" />
      {/* grip + body */}
      <rect x="34" y="13" width="22" height="22" rx="6" fill="#3A465E" />
      <rect x="52" y="10" width="112" height="28" rx="14" fill="#232E45" />
      {/* gold ring + clip */}
      <rect x="160" y="10" width="7" height="28" fill="#E5B72E" />
      <rect x="170" y="10" width="34" height="28" rx="14" fill="#232E45" />
      <rect x="192" y="4" width="5" height="22" rx="2.5" fill="#E5B72E" />
      {/* subtle top highlight */}
      <rect x="56" y="14" width="100" height="4" rx="2" fill="#FFFFFF" opacity="0.12" />
    </svg>
  );
}

export function SealedEnvelopeArt({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <div className="relative aspect-[8/5] w-full overflow-hidden rounded-2xl bg-[#F6B0C3] shadow-[10px_24px_44px_-18px_rgba(140,34,71,0.45)]">
        <svg
          viewBox="0 0 100 62"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="sendoff-flap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCCBD8" />
              <stop offset="100%" stopColor="#F3A6BC" />
            </linearGradient>
          </defs>
          {/* bottom side creases */}
          <path d="M0 62 L50 36 L100 62" fill="none" stroke="#E795AE" strokeWidth="0.9" opacity="0.7" />
          {/* closed flap folding down over the front */}
          <path d="M0 0 H100 L51.5 35 Q50 36 48.5 35 Z" fill="url(#sendoff-flap)" />
          <path d="M0 0 L50 36 L100 0" fill="none" stroke="#DE7F9C" strokeWidth="1" opacity="0.8" />
        </svg>
        <PaperGrain id="grain-sendoff" className="absolute inset-0 opacity-[0.35]" />
      </div>
      <div className="absolute left-1/2 top-[56%] w-[17%] -translate-x-1/2 -translate-y-1/2">
        <WaxSeal className="mtc-breathe w-full drop-shadow-[1px_4px_6px_rgba(140,34,71,0.4)]" />
      </div>
    </div>
  );
}

export function GiftArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 104" fill="none" className={className} aria-hidden>
      <rect x="34" y="46" width="52" height="38" rx="5" fill="#fff" stroke="#B4375F" strokeWidth="3" />
      <rect x="28" y="34" width="64" height="14" rx="4" fill="#FFE8F0" stroke="#B4375F" strokeWidth="3" />
      <path d="M60 48v36" stroke="#B4375F" strokeWidth="3" />
      <path
        d="M60 32c-12-2-16-10-10-14 5-3 10 4 10 14Zm0 0c12-2 16-10 10-14-5-3-10 4-10 14Z"
        fill="#FFE8F0"
        stroke="#B4375F"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="68" r="2.4" fill="#E5B72E" />
      <circle cx="74" cy="68" r="2.4" fill="#E5B72E" />
    </svg>
  );
}

export function BalloonsArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 104" fill="none" className={className} aria-hidden>
      <ellipse cx="38" cy="34" rx="14" ry="17" fill="#FFE8F0" stroke="#B4375F" strokeWidth="3" />
      <ellipse cx="68" cy="24" rx="13" ry="16" fill="#fff" stroke="#B4375F" strokeWidth="3" />
      <ellipse cx="90" cy="42" rx="11" ry="13" fill="#F9E9BC" stroke="#B4375F" strokeWidth="3" />
      <path d="M38 51l-3 5h6l-3-5ZM68 40l-3 5h6l-3-5ZM90 55l-3 5h6l-3-5Z" fill="#B4375F" />
      <path
        d="M38 56C44 72 54 80 60 90M68 45c-2 17-6 31-8 45M90 60C80 74 68 82 60 90"
        stroke="#B4375F"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M54 92c4-3 8-3 12 0" stroke="#B4375F" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function BrushUnderline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 12" fill="none" className={className} aria-hidden preserveAspectRatio="none">
      <path
        d="M4 8c40-4 90-5 212-2"
        stroke="#B4375F"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
