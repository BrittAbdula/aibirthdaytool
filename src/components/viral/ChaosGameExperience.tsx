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

interface DecodedPayload {
  f: string;
  t: string;
}

interface Difficulty {
  inline: boolean;
  hoverFlee: boolean;
  hoverRadius: number;
  jumpDistance: number;
}

export interface ChaosGameExperienceConfig {
  path: string;
  theme: "amber" | "mint" | "violet";
  creatorBadge: string;
  creatorHeading: string;
  creatorDescription: string;
  questionTemplate: string;
  yesLabel: string;
  noPhrases: string[];
  acceptedLines: string[];
  acceptedWord: string;
  acceptedShareTemplate: string;
  creatorShareTemplate: string;
  ctaHref: string;
  ctaLabel: string;
  previewGif: string;
  previewGifAlt: string;
  acceptedGif: string;
  acceptedGifAlt: string;
}

const THEME_STYLES = {
  amber: {
    shell: "from-amber-100 via-orange-50 to-yellow-50",
    glowA: "bg-orange-300/40",
    glowB: "bg-amber-300/35",
    glowC: "bg-yellow-200/45",
    accentText: "text-orange-700",
    accentTextHover: "hover:text-orange-900",
    buttonGradient: "from-orange-500 via-amber-500 to-yellow-400",
    pulse: "bg-orange-400/40",
  },
  mint: {
    shell: "from-emerald-100 via-teal-50 to-cyan-50",
    glowA: "bg-emerald-300/35",
    glowB: "bg-teal-300/35",
    glowC: "bg-cyan-200/45",
    accentText: "text-emerald-700",
    accentTextHover: "hover:text-emerald-900",
    buttonGradient: "from-emerald-500 via-teal-500 to-cyan-500",
    pulse: "bg-emerald-400/40",
  },
  violet: {
    shell: "from-violet-100 via-fuchsia-50 to-indigo-50",
    glowA: "bg-violet-300/40",
    glowB: "bg-fuchsia-300/35",
    glowC: "bg-indigo-200/45",
    accentText: "text-violet-700",
    accentTextHover: "hover:text-violet-900",
    buttonGradient: "from-violet-500 via-fuchsia-500 to-indigo-500",
    pulse: "bg-violet-400/40",
  },
} as const;

const DIFFICULTY_TIERS: Difficulty[] = [
  { inline: true, hoverFlee: false, hoverRadius: 0, jumpDistance: 0 },
  { inline: false, hoverFlee: false, hoverRadius: 0, jumpDistance: 160 },
  { inline: false, hoverFlee: true, hoverRadius: 70, jumpDistance: 280 },
  { inline: false, hoverFlee: true, hoverRadius: 120, jumpDistance: 420 },
  { inline: false, hoverFlee: true, hoverRadius: 180, jumpDistance: 0 },
];

const LEVEL_THRESHOLDS = [0, 3, 5, 7, 9];

interface FloatingHeartConfig {
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
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

function fillTemplate(template: string, name: string): string {
  return template.replace(/\{to\}/g, name || "you");
}

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
}

function ShareButtons({ shareUrl, message, copied, onCopy }: ShareButtonsProps) {
  const whatsappText = `${message} ${shareUrl}`.trim();
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
  const telegramHref = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(message)}`;
  const base =
    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onCopy}
        className={cn(base, "bg-white text-rose-700 shadow-sm hover:bg-rose-100")}
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

export default function ChaosGameExperience({
  config,
}: {
  config: ChaosGameExperienceConfig;
}) {
  const theme = THEME_STYLES[config.theme];
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
  const secondaryLabel =
    config.noPhrases[Math.min(noClicks, config.noPhrases.length - 1)];
  const acceptedLine = useMemo(
    () => config.acceptedLines[Math.floor(Math.random() * config.acceptedLines.length)],
    [config.acceptedLines]
  );

  const sharePath = useMemo(() => {
    const f = fromName.trim();
    const t = toName.trim();
    if (!f && !t) return config.path;
    return `${config.path}?v=${encodePayload(f, t, nonce)}`;
  }, [fromName, toName, nonce, config.path]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `https://mewtrucard.com${sharePath}`;
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
        return { x: minX + Math.random() * rangeX, y: minY + Math.random() * rangeY };
      }

      const baseX = base?.x ?? minX + rangeX / 2;
      const baseY = base?.y ?? minY + rangeY / 2;
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = tier.jumpDistance * (0.55 + Math.random() * 0.45);
        const cx = Math.max(minX, Math.min(maxX, baseX + Math.cos(angle) * dist));
        const cy = Math.max(minY, Math.min(maxY, baseY + Math.sin(angle) * dist));
        if (Math.hypot(cx - baseX, cy - baseY) > 40) return { x: cx, y: cy };
      }
      return { x: minX + Math.random() * rangeX, y: minY + Math.random() * rangeY };
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
    router.push(config.path);
  };

  const creatorShareMessage = fillTemplate(config.creatorShareTemplate, toName.trim());
  const acceptedShareMessage = fillTemplate(config.acceptedShareTemplate, displayTo);

  return (
    <main
      className={cn(
        "relative h-[100dvh] w-screen overflow-hidden bg-gradient-to-br text-slate-900",
        theme.shell
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute -left-32 top-[-20%] h-[420px] w-[420px] rounded-full blur-3xl",
            theme.glowA
          )}
        />
        <div
          className={cn(
            "absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full blur-3xl",
            theme.glowB
          )}
        />
        <div
          className={cn(
            "absolute bottom-[-25%] left-1/3 h-[420px] w-[420px] rounded-full blur-3xl",
            theme.glowC
          )}
        />
        {heartBackground.map((heart, i) => (
          <Heart
            key={i}
            className="chaos-bg-heart absolute bottom-[-40px] fill-rose-400/60 text-rose-400/60"
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
          className={cn("text-sm font-semibold transition", theme.accentText, theme.accentTextHover)}
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
                  {config.creatorBadge}
                </span>
                <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-rose-950 sm:text-5xl md:text-6xl">
                  {config.creatorHeading}
                </h1>
                <p className="max-w-xl text-base leading-7 text-rose-900/80 sm:text-lg">
                  {config.creatorDescription}
                </p>

                <div className="space-y-3 rounded-3xl border border-white/70 bg-white/75 p-5 shadow-[0_24px_80px_rgba(244,114,182,0.18)] backdrop-blur">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider text-rose-700/80">
                        Your name
                      </span>
                      <Input
                        value={fromName}
                        onChange={(e) => setFromName(e.target.value.slice(0, 40))}
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
                        onChange={(e) => setToName(e.target.value.slice(0, 40))}
                        placeholder="Emma"
                        className="h-11 rounded-xl border-rose-200 bg-white text-base"
                      />
                    </label>
                  </div>

                  <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-rose-700/80">
                      Your shareable link
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-rose-900">{shareUrl}</p>
                    <div className="mt-3 space-y-3">
                      <ShareButtons
                        shareUrl={shareUrl}
                        message={creatorShareMessage}
                        copied={copied}
                        onCopy={handleCopy}
                      />
                      <Link
                        href={toName.trim() ? sharePath : config.path}
                        aria-disabled={!toName.trim()}
                        onClick={(e) => {
                          if (!toName.trim()) e.preventDefault();
                        }}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(244,114,182,0.35)] transition hover:scale-[1.02]",
                          !toName.trim() && "pointer-events-none opacity-50"
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
                    href={config.ctaHref}
                    className="inline-flex items-center gap-1 font-semibold text-rose-700 underline decoration-2 underline-offset-4 hover:text-rose-900"
                  >
                    {config.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
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
                  src={config.previewGif}
                  alt={config.previewGifAlt}
                  width={360}
                  height={360}
                  unoptimized
                  className="h-48 w-48 rounded-3xl object-contain sm:h-56 sm:w-56"
                />
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700/70">
                    {fromName.trim() ? `From ${fromName.trim()}` : "From a secret admirer"}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-rose-950 sm:text-4xl">
                    {fillTemplate(config.questionTemplate, toName.trim() || "Valentine")}
                  </h2>
                </div>
              </div>
            </div>
          </motion.section>
        ) : !accepted ? (
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
                src={config.previewGif}
                alt={config.previewGifAlt}
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
              {fillTemplate(config.questionTemplate, displayTo || "you")}
            </h1>

            <div className="relative mt-10 flex w-full flex-wrap items-center justify-center gap-6">
              <motion.button
                type="button"
                onClick={handleYesClick}
                animate={{ scale: yesScale }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={cn(
                  "relative inline-flex min-h-14 items-center justify-center rounded-full bg-gradient-to-r px-10 py-4 text-xl font-bold text-white shadow-[0_18px_50px_rgba(99,102,241,0.3)] transition hover:brightness-110 sm:text-2xl",
                  theme.buttonGradient
                )}
                style={{ transformOrigin: "center" }}
              >
                <span className={cn("absolute inset-0 -z-10 animate-pulse rounded-full blur-xl", theme.pulse)} />
                {config.yesLabel}
              </motion.button>

              {(difficulty.inline || noPos === null) && (
                <motion.button
                  ref={noButtonRef}
                  type="button"
                  onClick={handleNoClick}
                  onMouseEnter={difficulty.hoverFlee ? moveNoFromHover : undefined}
                  onTouchStart={difficulty.hoverFlee ? moveNoFromHover : undefined}
                  animate={{ scale: noScale, opacity: noOpacity }}
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-rose-200 bg-white/80 px-7 py-3 text-base font-semibold text-rose-700 shadow-sm backdrop-blur transition hover:bg-white sm:text-lg"
                >
                  {secondaryLabel}
                </motion.button>
              )}
            </div>

            {!(difficulty.inline || noPos === null) && noPos && (
              <motion.button
                ref={noButtonRef}
                type="button"
                onClick={handleNoClick}
                onMouseEnter={difficulty.hoverFlee ? moveNoFromHover : undefined}
                onTouchStart={difficulty.hoverFlee ? moveNoFromHover : undefined}
                animate={{ x: noPos.x, y: noPos.y, scale: noScale, opacity: noOpacity }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="fixed left-0 top-0 z-40 inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-full border border-rose-200 bg-white/85 px-6 py-3 text-base font-semibold text-rose-700 shadow-md backdrop-blur"
                style={{ transformOrigin: "center" }}
              >
                {secondaryLabel}
              </motion.button>
            )}
          </motion.section>
        ) : (
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
                src={config.acceptedGif}
                alt={config.acceptedGifAlt}
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
                {config.acceptedWord}
              </span>
            </h1>

            <p className="mt-3 max-w-xl text-base leading-7 text-rose-900/80 sm:text-lg">
              {displayFrom
                ? `${displayFrom} is doing a happy dance somewhere. ${acceptedLine}`
                : acceptedLine}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={config.ctaHref}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-7 py-3.5 text-base font-bold text-white shadow-[0_18px_40px_rgba(244,114,182,0.4)] transition hover:scale-[1.02]"
              >
                <Sparkles className="h-4 w-4" />
                {config.ctaLabel}
              </Link>
            </div>

            <div className="mt-5 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700/70">
                Share the moment
              </span>
              <ShareButtons
                shareUrl={shareUrl}
                message={acceptedShareMessage}
                copied={copied}
                onCopy={handleCopy}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-rose-700/80">
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-1.5 font-semibold underline decoration-2 underline-offset-4 transition hover:text-rose-900"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Play again
              </button>
              <button
                type="button"
                onClick={goToCreator}
                className="font-medium underline decoration-rose-300 underline-offset-4 hover:text-rose-900"
              >
                Make your own
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes chaos-float-up {
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
        .chaos-bg-heart {
          animation-name: chaos-float-up;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          will-change: transform, opacity;
        }
      `}</style>
    </main>
  );
}
