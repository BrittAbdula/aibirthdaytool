'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

const FIRST_ACTIVE_DATE_KEY = 'mewtrucard.creatorFirstActiveDate';
const DISMISSED_KEY = 'mewtrucard.creatorNudgeDismissed';

export function RepeatCreatorNudge() {
  const { data: session } = useSession();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!session?.user || session.user.plan === 'PREMIUM') return;
    const today = new Date().toISOString().slice(0, 10);
    const firstActiveDate = window.localStorage.getItem(FIRST_ACTIVE_DATE_KEY);
    if (!firstActiveDate) {
      window.localStorage.setItem(FIRST_ACTIVE_DATE_KEY, today);
      return;
    }
    if (firstActiveDate !== today && window.localStorage.getItem(DISMISSED_KEY) !== 'true') {
      setVisible(true);
    }
  }, [session]);

  if (!visible) return null;

  return (
    <div className="mb-5 flex items-start justify-between gap-4 rounded-lg border border-[#E8CDD6] bg-[#FFF8F6] px-4 py-3 text-sm">
      <div>
        <p className="font-semibold text-[#202A3D]">Creating again?</p>
        <p className="mt-1 leading-6 text-[#687084]">Save recurring recipients and preview the next 30 days in the free Creator workspace.</p>
        <Link href="/creator/" className="mt-2 inline-flex items-center font-semibold text-primary hover:underline">Open Creator workspace <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
      </div>
      <button type="button" aria-label="Dismiss" className="rounded p-1 text-[#7B8292] hover:bg-white" onClick={() => {
        window.localStorage.setItem(DISMISSED_KEY, 'true');
        setVisible(false);
      }}><X className="h-4 w-4" /></button>
    </div>
  );
}
