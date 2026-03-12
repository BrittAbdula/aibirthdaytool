"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import confetti from "canvas-confetti";
import { RefreshCcw, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViralMicrositeConfig } from "@/lib/viral-microsites";

interface ViralMicrositeProps {
  config: ViralMicrositeConfig;
}

const THEME_STYLES = {
  rose: {
    shell: "from-rose-100 via-pink-50 to-orange-50 text-rose-950",
    accent: "text-rose-600",
    chip: "bg-white/70 text-rose-700 border border-rose-200/70",
    panel: "bg-white/70 border border-white/80 shadow-[0_25px_80px_rgba(244,114,182,0.18)]",
    primary:
      "bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white shadow-[0_14px_30px_rgba(244,114,182,0.35)] hover:scale-[1.02]",
    secondary:
      "bg-white/85 text-rose-700 border border-rose-200 hover:bg-rose-50",
    link: "text-rose-700 hover:text-rose-800",
  },
  amber: {
    shell: "from-amber-100 via-orange-50 to-yellow-50 text-amber-950",
    accent: "text-orange-600",
    chip: "bg-white/70 text-orange-700 border border-orange-200/70",
    panel: "bg-white/75 border border-white/80 shadow-[0_25px_80px_rgba(251,146,60,0.18)]",
    primary:
      "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white shadow-[0_14px_30px_rgba(251,146,60,0.32)] hover:scale-[1.02]",
    secondary:
      "bg-white/85 text-orange-700 border border-orange-200 hover:bg-orange-50",
    link: "text-orange-700 hover:text-orange-800",
  },
  mint: {
    shell: "from-emerald-100 via-teal-50 to-cyan-50 text-slate-900",
    accent: "text-emerald-600",
    chip: "bg-white/70 text-emerald-700 border border-emerald-200/70",
    panel: "bg-white/75 border border-white/80 shadow-[0_25px_80px_rgba(16,185,129,0.16)]",
    primary:
      "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-[0_14px_30px_rgba(16,185,129,0.28)] hover:scale-[1.02]",
    secondary:
      "bg-white/85 text-emerald-700 border border-emerald-200 hover:bg-emerald-50",
    link: "text-emerald-700 hover:text-emerald-800",
  },
  violet: {
    shell: "from-violet-100 via-fuchsia-50 to-indigo-50 text-slate-900",
    accent: "text-violet-600",
    chip: "bg-white/70 text-violet-700 border border-violet-200/70",
    panel: "bg-white/75 border border-white/80 shadow-[0_25px_80px_rgba(139,92,246,0.18)]",
    primary:
      "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 text-white shadow-[0_14px_30px_rgba(139,92,246,0.32)] hover:scale-[1.02]",
    secondary:
      "bg-white/85 text-violet-700 border border-violet-200 hover:bg-violet-50",
    link: "text-violet-700 hover:text-violet-800",
  },
} as const;

export default function ViralMicrosite({ config }: ViralMicrositeProps) {
  const styles = THEME_STYLES[config.theme];
  const [secondaryCount, setSecondaryCount] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const secondaryLabel = useMemo(() => {
    if (secondaryCount === 0) {
      return config.secondaryLabel;
    }

    return config.secondaryPhrases[Math.min(secondaryCount, config.secondaryPhrases.length - 1)];
  }, [config.secondaryLabel, config.secondaryPhrases, secondaryCount]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const moveSecondaryButton = () => {
    const container = containerRef.current;
    if (!container) return;

    const maxX = Math.min(container.clientWidth * 0.28, 150);
    const maxY = Math.min(container.clientHeight * 0.18, 110);
    const nextX = Math.round(Math.random() * maxX * 2 - maxX);
    const nextY = Math.round(Math.random() * maxY * 2 - maxY);
    setButtonPosition({ x: nextX, y: nextY });
  };

  const handleAccept = () => {
    setAccepted(true);
    confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.58 },
    });
  };

  const handleSecondary = () => {
    setSecondaryCount((count) => count + 1);
    moveSecondaryButton();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: config.shareTitle,
          url: config.shareUrl,
        });
        return;
      } catch (error) {
        // Fall through to clipboard copy.
      }
    }

    try {
      await navigator.clipboard.writeText(config.shareUrl);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy share link", error);
    }
  };

  const resetState = () => {
    setAccepted(false);
    setSecondaryCount(0);
    setButtonPosition({ x: 0, y: 0 });
  };

  return (
    <main
      className={cn(
        "relative min-h-screen overflow-hidden bg-gradient-to-br",
        styles.shell
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-4%] h-60 w-60 rounded-full bg-white/45 blur-3xl" />
        <div className="absolute bottom-[-8%] right-[-4%] h-72 w-72 rounded-full bg-white/35 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-5 py-8 sm:px-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className={cn("text-sm font-semibold", styles.link)}>
            MewTruCard
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
              styles.chip
            )}
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Link copied" : "Share"}
          </button>
        </div>

        <div
          className={cn(
            "grid items-center gap-8 rounded-[32px] p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10",
            styles.panel
          )}
        >
          <div className="space-y-6">
            <span className={cn("inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]", styles.chip)}>
              {config.eyebrow}
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                {accepted ? config.acceptedTitle : config.prompt}
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
                {accepted ? config.acceptedBody : config.description}
              </p>
              {accepted && config.acceptedCaption ? (
                <p className={cn("text-sm font-medium sm:text-base", styles.accent)}>
                  {config.acceptedCaption}
                </p>
              ) : null}
            </div>

            <div
              ref={containerRef}
              className="relative flex min-h-[136px] flex-wrap items-center gap-4 overflow-visible"
            >
              <button
                type="button"
                onClick={accepted ? resetState : handleAccept}
                className={cn(
                  "inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-base font-semibold transition duration-200",
                  styles.primary
                )}
              >
                {accepted ? config.replayLabel : config.primaryLabel}
              </button>

              {!accepted ? (
                <button
                  type="button"
                  onClick={handleSecondary}
                  onMouseEnter={() => {
                    if (secondaryCount > 0) moveSecondaryButton();
                  }}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-base font-semibold transition duration-200",
                    styles.secondary
                  )}
                  style={{
                    transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
                  }}
                >
                  {secondaryLabel || config.secondaryLabel}
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <Link
                href={config.primaryCta.href}
                className={cn("font-semibold underline decoration-2 underline-offset-4", styles.link)}
              >
                {config.primaryCta.label}
              </Link>
              {config.secondaryCta ? (
                <Link
                  href={config.secondaryCta.href}
                  className="font-medium text-slate-500 underline decoration-slate-300 underline-offset-4"
                >
                  {config.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-5">
            <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-white/70 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/75 to-transparent" />
              <Image
                src={config.imageUrl}
                alt={config.imageAlt}
                width={720}
                height={720}
                className="mx-auto aspect-square max-h-[360px] w-full rounded-[24px] object-contain"
              />
            </div>

            <div className="rounded-full bg-white/75 px-5 py-3 text-sm text-slate-600 shadow-sm">
              Built as a shareable moment on <span className={cn("font-semibold", styles.accent)}>MewTruCard</span>
            </div>

            {accepted ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={config.primaryCta.href}
                  className={cn(
                    "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition",
                    styles.primary
                  )}
                >
                  {config.primaryCta.label}
                </Link>
                {config.secondaryCta ? (
                  <Link
                    href={config.secondaryCta.href}
                    className={cn(
                      "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition",
                      styles.secondary
                    )}
                  >
                    {config.secondaryCta.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>Made for surprise links, playful asks, and shareable moments.</span>
          <button
            type="button"
            onClick={resetState}
            className="inline-flex items-center gap-2 font-medium text-slate-500 hover:text-slate-700"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>
    </main>
  );
}
