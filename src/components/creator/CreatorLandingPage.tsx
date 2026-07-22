'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarDays, Check, FileSpreadsheet, Palette, Users } from 'lucide-react';
import { trackMonetizationEvent } from '@/lib/monetization-client';

export interface CreatorLandingContent {
  source: string;
  eyebrow: string;
  title: string;
  description: string;
  proof: string;
  workflowTitle: string;
  workflowDescription: string;
  cardImages: { src: string; alt: string }[];
}

const workflow = [
  { icon: Users, title: 'Keep one reliable roster', description: 'Add names and annual dates manually or import a CSV.' },
  { icon: CalendarDays, title: 'See the next 30 days', description: 'Work from a clear queue instead of scattered calendar notes.' },
  { icon: Palette, title: 'Reuse your brand direction', description: 'Save the organization name, tone, and primary color once.' },
  { icon: FileSpreadsheet, title: 'Generate and export a batch', description: 'Personalize each card, retry failures, and export a delivery manifest.' },
];

export function CreatorLandingPage({ content }: { content: CreatorLandingContent }) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    trackMonetizationEvent({
      eventType: 'creator_landing_view',
      source: content.source,
      path: window.location.pathname,
    });
  }, [content.source]);

  return (
    <main className="overflow-hidden bg-[#FFFDFC] text-[#202A3D]">
      <section className="relative min-h-[calc(100svh-4rem)] border-b border-[#E8CDD6] bg-[#FFF8F6]">
        <div className="absolute inset-y-0 right-0 hidden w-[46%] bg-[#F5E2E7] lg:block" />
        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative z-10 max-w-2xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">MewTruCard Creator Pro</p>
            <p className="mt-5 text-sm font-semibold text-[#725261]">{content.eyebrow}</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-[1.06] sm:text-6xl lg:text-6xl">{content.title}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#596174] sm:text-lg sm:leading-8">{content.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/creator/" className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary/90 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                Build your free roster <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/pricing/" className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#CFAEBA] bg-white px-6 text-sm font-semibold text-[#4B4050] hover:bg-[#FFF3F5]">
                See Creator Pro pricing
              </Link>
            </div>
            <p className="mt-5 text-sm text-[#725F68]">{content.proof}</p>
          </motion.div>

          <div className="relative min-h-[430px] lg:min-h-[620px]" aria-label="Personalized team card examples">
            {content.cardImages.slice(0, 3).map((image, index) => {
              const positions = [
                'left-[2%] top-[12%] w-[45%] -rotate-6',
                'left-[29%] top-[3%] z-20 w-[46%] rotate-1',
                'right-[0%] top-[18%] w-[43%] rotate-6',
              ];
              return (
                <motion.div
                  key={image.src}
                  initial={reduceMotion ? false : { opacity: 0, y: 28, rotate: index === 0 ? -10 : index === 2 ? 10 : 0 }}
                  animate={{ opacity: 1, y: 0, rotate: index === 0 ? -6 : index === 2 ? 6 : 1 }}
                  transition={{ delay: 0.16 + index * 0.09, duration: 0.58 }}
                  whileHover={reduceMotion ? undefined : { y: -8, rotate: index === 0 ? -3 : index === 2 ? 3 : 0 }}
                  className={`absolute ${positions[index]} rounded-md border border-white/90 bg-white p-2 shadow-[0_24px_60px_rgba(71,45,57,0.22)]`}
                >
                  <Image src={image.src} alt={image.alt} width={480} height={700} priority className="h-auto w-full rounded-sm object-contain" />
                </motion.div>
              );
            })}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.45 }}
              className="absolute bottom-3 left-1/2 z-30 w-[min(92%,530px)] -translate-x-1/2 border-y border-[#CFAEBA] bg-white/95 px-5 py-4 shadow-xl backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Upcoming queue</p>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div><p className="font-semibold">3 team moments this month</p><p className="mt-1 text-xs text-[#687084]">Roster → brand preset → personalized batch</p></div>
                <span className="rounded-full bg-[#FFF0F4] px-3 py-1 text-xs font-semibold text-primary">Ready to preview</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E8CDD6] bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:px-8">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">One working loop</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-5xl">{content.workflowTitle}</h2>
            <p className="mt-5 text-base leading-7 text-[#596174]">{content.workflowDescription}</p>
          </div>
          <div className="divide-y divide-[#E8CDD6] border-y border-[#E8CDD6]">
            {workflow.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={reduceMotion ? false : { opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="grid gap-4 py-7 sm:grid-cols-[48px_1fr]"
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <div><h3 className="text-lg font-semibold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#687084]">{step.description}</p></div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[#E8CDD6] bg-[#202A3D] py-16 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F7B6C9]">Free proof before payment</p>
            <h2 className="mt-4 font-serif text-3xl font-semibold sm:text-5xl">See the workflow with your own people first.</h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-[#E2E6EE]">
            {['Save up to 3 recipients free.', 'Generate one real personalized batch preview.', 'Subscribe only when you need the full batch, export, and repeat use.'].map((line) => <p key={line} className="flex gap-3"><Check className="mt-1 h-4 w-4 shrink-0 text-[#F7B6C9]" />{line}</p>)}
          </div>
        </div>
      </section>

      <section className="bg-[#FFF8F6] px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">$6.99 per month · cancel anytime</p>
        <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold sm:text-6xl">Make recurring team moments a system, not a scramble.</h2>
        <Link href="/creator/" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-7 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary/90 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
          Start with a free batch preview <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
