"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Heart,
  Play,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NO_PHRASES = [
  "No",
  "Are you sure?",
  "Really sure? 🥺",
  "Please reconsider…",
  "Look at me, I'm begging",
  "You're breaking my heart 💔",
  "I'll cry. A lot.",
  "Have mercy 😭",
  "OK fine just say yes already",
  "Last chance to make my day",
  "Pretty please with hearts on top",
];

const ACCEPTED_LINES = [
  "You just made me the happiest person on the internet.",
  "I knew you couldn't resist 💕",
  "Hearts are doing a happy dance right now.",
  "Best decision you've made all week.",
];

const SHARE_BASE_URL = "https://mewtrucard.com/will-you-be-my-valentine/";

interface DecodedPayload {
  f: string;
  t: string;
}

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const base64 = pad ? padded + "=".repeat(4 - pad) : padded;
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodePayload(from: string, to: string, nonce: string): string {
  const json = JSON.stringify({ f: from, t: to, n: nonce });
  return toBase64Url(json);
}

function decodePayload(encoded: string): DecodedPayload | null {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as Partial<DecodedPayload>;
    return {
      f: String(parsed.f || "").slice(0, 40),
      t: String(parsed.t || "").slice(0, 40),
    };
  } catch {
    return null;
  }
}

function makeNonce(): string {
  return Math.random().toString(36).slice(2, 8);
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"
      />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
      />
    </svg>
  );
}

interface ShareButtonsProps {
  shareUrl: string;
  message: string;
  copied: boolean;
  onCopy: () => void;
  size?: "sm" | "md";
}

function ShareButtons({
  shareUrl,
  message,
  copied,
  onCopy,
  size = "sm",
}: ShareButtonsProps) {
  const whatsappText = `${message} ${shareUrl}`.trim();
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(message)}`;

  const base = cn(
    "inline-flex items-center gap-2 rounded-full font-semibold transition",
    size === "md" ? "px-5 py-2.5 text-sm sm:text-base" : "px-4 py-2 text-sm"
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          base,
          "bg-white text-rose-700 shadow-sm hover:bg-rose-100"
        )}
      >
        <Copy className="h-4 w-4" />
        {copied ? "Copied!" : "Copy link"}
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className={cn(
          base,
          "bg-[#25D366] text-white shadow-[0_8px_22px_rgba(37,211,102,0.35)] hover:brightness-110"
        )}
      >
        <WhatsAppIcon className="h-4 w-4" />
        WhatsApp
      </a>
      <a
        href={telegramHref}
        target="_blank"
        rel="noreferrer"
        className={cn(
          base,
          "bg-[#229ED9] text-white shadow-[0_8px_22px_rgba(34,158,217,0.35)] hover:brightness-110"
        )}
      >
        <TelegramIcon className="h-4 w-4" />
        Telegram
      </a>
    </div>
  );
}

interface Difficulty {
  inline: boolean;
  hoverFlee: boolean;
  hoverRadius: number;
  jumpDistance: number;
}

const DIFFICULTY_TIERS: Difficulty[] = [
  {
    inline: true,
    hoverFlee: false,
    hoverRadius: 0,
    jumpDistance: 0,
  },
  {
    inline: false,
    hoverFlee: false,
    hoverRadius: 0,
    jumpDistance: 160,
  },
  {
    inline: false,
    hoverFlee: true,
    hoverRadius: 70,
    jumpDistance: 280,
  },
  {
    inline: false,
    hoverFlee: true,
    hoverRadius: 120,
    jumpDistance: 420,
  },
  {
    inline: false,
    hoverFlee: true,
    hoverRadius: 180,
    jumpDistance: 0,
  },
];

const LEVEL_THRESHOLDS = [0, 3, 5, 7, 9];

function getDifficulty(clicks: number): Difficulty {
  let tier = DIFFICULTY_TIERS[0];
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (clicks >= LEVEL_THRESHOLDS[i]) tier = DIFFICULTY_TIERS[i];
  }
  return tier;
}

function fireHeartConfetti() {
  const heart = confetti.shapeFromText({ text: "💖", scalar: 2 });
  confetti({
    particleCount: 80,
    spread: 100,
    startVelocity: 45,
    origin: { y: 0.6 },
    scalar: 2,
    shapes: [heart],
    colors: ["#ff3d6b", "#ff7eb3", "#ffc1d9", "#ffd166"],
  });
  setTimeout(() => {
    confetti({
      particleCount: 60,
      spread: 120,
      startVelocity: 35,
      origin: { x: 0.2, y: 0.7 },
      shapes: [heart],
      scalar: 1.6,
      colors: ["#ff3d6b", "#ff7eb3", "#ffc1d9"],
    });
    confetti({
      particleCount: 60,
      spread: 120,
      startVelocity: 35,
      origin: { x: 0.8, y: 0.7 },
      shapes: [heart],
      scalar: 1.6,
      colors: ["#ff3d6b", "#ff7eb3", "#ffc1d9"],
    });
  }, 250);
}

interface FloatingHeartConfig {
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

function generateBackgroundHearts(count: number): FloatingHeartConfig[] {
  return Array.from({ length: count }).map((_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    return {
      left: `${(rand * 100).toFixed(2)}%`,
      size: 14 + Math.round(rand * 26),
      delay: `${(rand * 6).toFixed(2)}s`,
      duration: `${(8 + rand * 10).toFixed(2)}s`,
      opacity: 0.18 + rand * 0.22,
    };
  });
}

const VALENTINE_PATH = "/will-you-be-my-valentine/";

function clampPosition(
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number,
  margin = 24
) {
  if (typeof window === "undefined") return { x, y };
  const visW = w * scale;
  const visH = h * scale;
  const minX = margin - (w - visW) / 2;
  const maxX = window.innerWidth - margin - (w + visW) / 2;
  const minY = margin - (h - visH) / 2;
  const maxY = window.innerHeight - margin - (h + visH) / 2;
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y)),
  };
}

export default function ValentineExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const encoded = (params.get("v") || "").trim();
  const decoded = useMemo(
    () => (encoded ? decodePayload(encoded) : null),
    [encoded]
  );
  const legacyFrom = (params.get("from") || "").slice(0, 40);
  const legacyTo = (params.get("to") || "").slice(0, 40);
  const initialFrom = decoded?.f || legacyFrom;
  const initialTo = decoded?.t || legacyTo;

  const playingGame = Boolean(initialTo);

  const [fromName, setFromName] = useState(initialFrom);
  const [toName, setToName] = useState(initialTo);
  const [copied, setCopied] = useState(false);
  const [nonce] = useState(() => makeNonce());

  const displayTo = (playingGame ? initialTo : toName).trim();
  const displayFrom = (playingGame ? initialFrom : fromName).trim();

  const [noClicks, setNoClicks] = useState(0);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const [accepted, setAccepted] = useState(false);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  const heartBackground = useMemo(() => generateBackgroundHearts(22), []);

  const difficulty = useMemo(() => getDifficulty(noClicks), [noClicks]);

  const yesScale = 1 + Math.min(noClicks, 9) * 0.16;
  const noScale = Math.max(0.36, 1 - noClicks * 0.065);
  const noOpacity = Math.max(0.6, 1 - noClicks * 0.035);

  const secondaryLabel = NO_PHRASES[Math.min(noClicks, NO_PHRASES.length - 1)];

  const sharePath = useMemo(() => {
    const f = fromName.trim();
    const t = toName.trim();
    if (!f && !t) return VALENTINE_PATH;
    return `${VALENTINE_PATH}?v=${encodePayload(f, t, nonce)}`;
  }, [fromName, toName, nonce]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return `https://mewtrucard.com${sharePath}`;
    }
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  const computeNextPosition = useCallback(
    (
      forClicks: number,
      base: { x: number; y: number } | null
    ): { x: number; y: number } => {
      if (typeof window === "undefined") return { x: 0, y: 0 };
      const btn = noButtonRef.current;
      const w = btn?.offsetWidth ?? 120;
      const h = btn?.offsetHeight ?? 56;
      const scale = Math.max(0.36, 1 - forClicks * 0.065);
      const tier = getDifficulty(forClicks);
      const margin = 24;
      const visW = w * scale;
      const visH = h * scale;
      const minX = margin - (w - visW) / 2;
      const maxX = window.innerWidth - margin - (w + visW) / 2;
      const minY = margin - (h - visH) / 2;
      const maxY = window.innerHeight - margin - (h + visH) / 2;
      const rangeX = Math.max(1, maxX - minX);
      const rangeY = Math.max(1, maxY - minY);

      if (tier.jumpDistance === 0) {
        return {
          x: minX + Math.random() * rangeX,
          y: minY + Math.random() * rangeY,
        };
      }

      const baseX = base?.x ?? minX + rangeX / 2;
      const baseY = base?.y ?? minY + rangeY / 2;
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = tier.jumpDistance * (0.55 + Math.random() * 0.45);
        const cx = Math.max(
          minX,
          Math.min(maxX, baseX + Math.cos(angle) * dist)
        );
        const cy = Math.max(
          minY,
          Math.min(maxY, baseY + Math.sin(angle) * dist)
        );
        if (Math.hypot(cx - baseX, cy - baseY) > 40) {
          return { x: cx, y: cy };
        }
      }
      return {
        x: minX + Math.random() * rangeX,
        y: minY + Math.random() * rangeY,
      };
    },
    []
  );

  useEffect(() => {
    setNoClicks(0);
    setNoPos(null);
    setAccepted(false);
  }, [encoded, legacyFrom, legacyTo]);

  useEffect(() => {
    if (!playingGame || accepted) return;
    const tier = getDifficulty(noClicks);
    if (!tier.hoverFlee) return;
    const handler = (event: MouseEvent) => {
      const btn = noButtonRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(event.clientX - cx, event.clientY - cy);
      if (dist < tier.hoverRadius) {
        setNoPos((current) => computeNextPosition(noClicks, current));
      }
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [playingGame, accepted, noClicks, computeNextPosition]);

  useEffect(() => {
    const onResize = () => {
      setNoPos((current) => {
        if (!current) return current;
        const btn = noButtonRef.current;
        const w = btn?.offsetWidth ?? 120;
        const h = btn?.offsetHeight ?? 56;
        const scale = Math.max(0.36, 1 - noClicks * 0.065);
        return clampPosition(current.x, current.y, w, h, scale);
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [noClicks]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const handleNoClick = () => {
    const next = noClicks + 1;
    setNoClicks(next);
    const nextDiff = getDifficulty(next);
    if (nextDiff.inline) {
      setNoPos(null);
    } else {
      setNoPos((current) => computeNextPosition(next, current));
    }
  };

  const moveNoFromHover = () => {
    const tier = getDifficulty(noClicks);
    if (!tier.hoverFlee) return;
    setNoPos((current) => computeNextPosition(noClicks, current));
  };

  const handleYesClick = () => {
    setAccepted(true);
    fireHeartConfetti();
    setTimeout(fireHeartConfetti, 800);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  };

  const resetGame = () => {
    setAccepted(false);
    setNoClicks(0);
    setNoPos(null);
  };

  const goToCreator = () => {
    resetGame();
    router.push(VALENTINE_PATH);
  };

  return (
    <main className="valentine-shell relative h-[100dvh] w-screen overflow-hidden bg-gradient-to-br from-rose-100 via-pink-100 to-orange-50 text-rose-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-[-20%] h-[420px] w-[420px] rounded-full bg-rose-300/40 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full bg-pink-300/40 blur-3xl" />
        <div className="absolute bottom-[-25%] left-1/3 h-[420px] w-[420px] rounded-full bg-orange-200/50 blur-3xl" />
        {heartBackground.map((heart, i) => (
          <Heart
            key={i}
            className="valentine-bg-heart absolute bottom-[-40px] fill-rose-400/60 text-rose-400/60"
            style={{
              left: heart.left,
              width: heart.size,
              height: heart.size,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              opacity: heart.opacity,
            }}
          />
        ))}
      </div>

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="text-sm font-semibold text-rose-700 transition hover:text-rose-900"
        >
          MewTruCard
        </Link>
        {playingGame && !accepted ? (
          <button
            type="button"
            onClick={resetGame}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-rose-700 backdrop-blur transition hover:bg-white"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        ) : null}
      </header>

      <AnimatePresence mode="wait">
        {!playingGame ? (
          <CreatorView
            key="creator"
            fromName={fromName}
            toName={toName}
            shareUrl={shareUrl}
            sharePath={sharePath}
            copied={copied}
            onChangeFrom={setFromName}
            onChangeTo={setToName}
            onCopy={handleCopy}
          />
        ) : !accepted ? (
          <GameView
            key="game"
            displayFrom={displayFrom}
            displayTo={displayTo}
            yesScale={yesScale}
            noScale={noScale}
            noOpacity={noOpacity}
            noPos={noPos}
            secondaryLabel={secondaryLabel}
            difficulty={difficulty}
            onYes={handleYesClick}
            onNo={handleNoClick}
            onMoveNoHover={moveNoFromHover}
            noButtonRef={noButtonRef}
          />
        ) : (
          <AcceptedView
            key="accepted"
            displayFrom={displayFrom}
            displayTo={displayTo}
            shareUrl={shareUrl}
            copied={copied}
            onCopy={handleCopy}
            onReplay={resetGame}
            onBackToCreator={goToCreator}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes valentine-float-up {
          0% {
            transform: translateY(0) rotate(-8deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(-110vh) rotate(12deg) scale(1.1);
            opacity: 0;
          }
        }
        .valentine-bg-heart {
          animation-name: valentine-float-up;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          will-change: transform, opacity;
        }
        @keyframes valentine-heart-pop {
          0% {
            transform: scale(0.6) rotate(-12deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.1) rotate(6deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}

interface CreatorViewProps {
  fromName: string;
  toName: string;
  shareUrl: string;
  sharePath: string;
  copied: boolean;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
  onCopy: () => void;
}

function CreatorView({
  fromName,
  toName,
  shareUrl,
  sharePath,
  copied,
  onChangeFrom,
  onChangeTo,
  onCopy,
}: CreatorViewProps) {
  const canPreview = toName.trim().length > 0;
  const previewTo = toName.trim() || "Valentine";
  const previewFrom = fromName.trim();
  const shareMessage = canPreview
    ? `Will you be my Valentine, ${toName.trim()}?`
    : "Will you be my Valentine?";

  return (
    <motion.section
      key="creator"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      className="relative z-10 mx-auto flex h-[calc(100dvh-72px)] w-full max-w-6xl flex-col items-center justify-center px-5 pb-6 sm:px-8"
    >
      <div className="grid w-full items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive valentine link
          </span>
          <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-rose-950 sm:text-5xl md:text-6xl">
            Make a valentine ask they{" "}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              can&rsquo;t say no to.
            </span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-rose-900/80 sm:text-lg">
            Drop your name and theirs. We&rsquo;ll mint a shareable link with a
            playful game where the &ldquo;No&rdquo; button literally runs away.
            Spoiler: they say yes.
          </p>

          <div className="space-y-3 rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_24px_80px_rgba(244,114,182,0.18)] backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-700/80">
                  Your name
                </span>
                <Input
                  value={fromName}
                  onChange={(e) => onChangeFrom(e.target.value.slice(0, 40))}
                  placeholder="Alex"
                  className="h-11 rounded-xl border-rose-200 bg-white text-base"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-700/80">
                  Their name
                </span>
                <Input
                  value={toName}
                  onChange={(e) => onChangeTo(e.target.value.slice(0, 40))}
                  placeholder="Emma"
                  className="h-11 rounded-xl border-rose-200 bg-white text-base"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700/80">
                Your shareable link
              </p>
              <p className="mt-1 truncate text-sm font-medium text-rose-900">
                {shareUrl}
              </p>
              <div className="mt-3 space-y-3">
                <ShareButtons
                  shareUrl={shareUrl}
                  message={shareMessage}
                  copied={copied}
                  onCopy={onCopy}
                />
                <Link
                  href={canPreview ? sharePath : VALENTINE_PATH}
                  aria-disabled={!canPreview}
                  onClick={(e) => {
                    if (!canPreview) e.preventDefault();
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(244,114,182,0.35)] transition hover:scale-[1.02]",
                    !canPreview && "pointer-events-none opacity-50"
                  )}
                >
                  <Play className="h-4 w-4" />
                  Try the game
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-rose-900/80">
            <Link
              href="/valentine/"
              className="inline-flex items-center gap-1 font-semibold text-rose-700 underline decoration-2 underline-offset-4 hover:text-rose-900"
            >
              Create a full Valentine card <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/"
              className="font-medium text-rose-700/60 underline decoration-rose-300 underline-offset-4 hover:text-rose-800"
            >
              Back to MewTruCard
            </Link>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-4 rounded-[36px] border border-white/70 bg-white/65 p-6 shadow-[0_30px_100px_rgba(244,114,182,0.22)] backdrop-blur sm:p-8">
          <span className="self-start rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
            Live preview
          </span>
          <Image
            src="https://store.celeprime.com/cute-love-bear-roses-ou7zho5oosxnpo6k.gif"
            alt="Cute bear with roses"
            width={360}
            height={360}
            unoptimized
            className="h-48 w-48 rounded-3xl object-contain sm:h-56 sm:w-56"
          />
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700/70">
              {previewFrom ? `From ${previewFrom}` : "From a secret admirer"}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-rose-950 sm:text-4xl">
              Will you be my Valentine, {previewTo}?
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-6 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(244,114,182,0.35)]">
              Yes
            </span>
            <span className="rounded-full border border-rose-200 bg-white/70 px-6 py-2 text-sm font-semibold text-rose-700">
              No
            </span>
          </div>
          <p className="text-center text-xs text-rose-700/60">
            (The &ldquo;No&rdquo; button doesn&rsquo;t stay put for long.)
          </p>
        </div>
      </div>
    </motion.section>
  );
}

interface GameViewProps {
  displayFrom: string;
  displayTo: string;
  yesScale: number;
  noScale: number;
  noOpacity: number;
  noPos: { x: number; y: number } | null;
  secondaryLabel: string;
  difficulty: Difficulty;
  onYes: () => void;
  onNo: () => void;
  onMoveNoHover: () => void;
  noButtonRef: React.RefObject<HTMLButtonElement>;
}

function GameView({
  displayFrom,
  displayTo,
  yesScale,
  noScale,
  noOpacity,
  noPos,
  secondaryLabel,
  difficulty,
  onYes,
  onNo,
  onMoveNoHover,
  noButtonRef,
}: GameViewProps) {
  const safeTo = displayTo || "you";
  const showInlineNo = difficulty.inline || noPos === null;

  return (
    <motion.section
      key="game"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35 }}
      className="relative z-10 mx-auto flex h-[calc(100dvh-72px)] w-full max-w-4xl flex-col items-center justify-center px-5 pb-6 text-center sm:px-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 16 }}
        className="mb-5"
      >
        <Image
          src="https://store.celeprime.com/cute-love-bear-roses-ou7zho5oosxnpo6k.gif"
          alt="Cute bear with roses"
          width={240}
          height={240}
          unoptimized
          className="h-36 w-36 object-contain sm:h-48 sm:w-48"
        />
      </motion.div>

      {displayFrom ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.22em] text-rose-700/80 sm:text-base">
          A message from {displayFrom}
        </p>
      ) : null}

      <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-rose-950 sm:text-6xl md:text-7xl">
        Will you be my Valentine,{" "}
        <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
          {safeTo}
        </span>
        ?
      </h1>

      <div className="relative mt-10 flex w-full flex-wrap items-center justify-center gap-6">
        <motion.button
          type="button"
          onClick={onYes}
          animate={{ scale: yesScale }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative inline-flex min-h-14 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-10 py-4 text-xl font-bold text-white shadow-[0_18px_50px_rgba(244,114,182,0.4)] transition hover:brightness-110 sm:text-2xl"
          style={{ transformOrigin: "center" }}
        >
          <span className="absolute inset-0 -z-10 animate-pulse rounded-full bg-rose-400/40 blur-xl" />
          Yes 💕
        </motion.button>

        {showInlineNo ? (
          <motion.button
            ref={noButtonRef}
            type="button"
            onClick={onNo}
            onMouseEnter={difficulty.hoverFlee ? onMoveNoHover : undefined}
            onTouchStart={difficulty.hoverFlee ? onMoveNoHover : undefined}
            animate={{ scale: noScale, opacity: noOpacity }}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-rose-200 bg-white/80 px-7 py-3 text-base font-semibold text-rose-700 shadow-sm backdrop-blur transition hover:bg-white sm:text-lg"
          >
            {secondaryLabel}
          </motion.button>
        ) : null}
      </div>

      {!showInlineNo && noPos ? (
        <motion.button
          ref={noButtonRef}
          type="button"
          onClick={onNo}
          onMouseEnter={difficulty.hoverFlee ? onMoveNoHover : undefined}
          onTouchStart={difficulty.hoverFlee ? onMoveNoHover : undefined}
          animate={{
            x: noPos.x,
            y: noPos.y,
            scale: noScale,
            opacity: noOpacity,
          }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed left-0 top-0 z-40 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-rose-200 bg-white/85 px-6 py-3 text-base font-semibold text-rose-700 shadow-md backdrop-blur"
          style={{ transformOrigin: "center" }}
        >
          {secondaryLabel}
        </motion.button>
      ) : null}
    </motion.section>
  );
}

interface AcceptedViewProps {
  displayFrom: string;
  displayTo: string;
  shareUrl: string;
  copied: boolean;
  onCopy: () => void;
  onReplay: () => void;
  onBackToCreator: () => void;
}

function AcceptedView({
  displayFrom,
  displayTo,
  shareUrl,
  copied,
  onCopy,
  onReplay,
  onBackToCreator,
}: AcceptedViewProps) {
  const tagline = useMemo(
    () => ACCEPTED_LINES[Math.floor(Math.random() * ACCEPTED_LINES.length)],
    []
  );
  const shareMessage = displayTo
    ? `${displayTo} said YES to being my Valentine!`
    : "They said YES to being my Valentine!";

  return (
    <motion.section
      key="accepted"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 mx-auto flex h-[calc(100dvh-72px)] w-full max-w-3xl flex-col items-center justify-center px-5 pb-6 text-center sm:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-[420px] w-[420px] rounded-full bg-gradient-to-br from-rose-300/60 via-pink-200/60 to-orange-200/60 blur-3xl sm:h-[520px] sm:w-[520px]"
        />
      </div>

      <motion.div
        initial={{ scale: 0.5, rotate: -8, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="mb-4"
      >
        <Image
          src="/images/style-presets/bear-kiss-bear-kisses.gif"
          alt="Bears kissing"
          width={320}
          height={320}
          unoptimized
          priority
          className="h-48 w-48 object-contain drop-shadow-[0_20px_40px_rgba(244,114,182,0.35)] sm:h-60 sm:w-60"
        />
      </motion.div>

      <h1 className="text-balance text-4xl font-bold tracking-tight text-rose-950 sm:text-6xl">
        {displayTo ? `${displayTo} said` : "You said"}{" "}
        <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
          YES!
        </span>
      </h1>

      <p className="mt-3 max-w-xl text-base leading-7 text-rose-900/80 sm:text-lg">
        {displayFrom
          ? `${displayFrom} is doing a happy dance somewhere. ${tagline}`
          : tagline}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/valentine/"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-7 py-3.5 text-base font-bold text-white shadow-[0_18px_40px_rgba(244,114,182,0.4)] transition hover:scale-[1.02]"
        >
          <Sparkles className="h-4 w-4" />
          Make it official with a card
        </Link>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700/70">
          Share the moment
        </span>
        <ShareButtons
          shareUrl={shareUrl}
          message={shareMessage}
          copied={copied}
          onCopy={onCopy}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-rose-700/80">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center gap-1.5 font-semibold underline decoration-2 underline-offset-4 transition hover:text-rose-900"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Play again
        </button>
        <button
          type="button"
          onClick={onBackToCreator}
          className="font-medium underline decoration-rose-300 underline-offset-4 hover:text-rose-900"
        >
          Make your own
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => {
          const seed = (i * 7919) % 100;
          return (
            <Heart
              key={i}
              className="valentine-bg-heart absolute bottom-[-30px] fill-rose-400/70 text-rose-400/70"
              style={{
                left: `${seed}%`,
                width: 18 + (seed % 22),
                height: 18 + (seed % 22),
                animationDelay: `${(seed % 6) * 0.4}s`,
                animationDuration: `${6 + (seed % 5)}s`,
                opacity: 0.35,
              }}
            />
          );
        })}
      </div>
    </motion.section>
  );
}
