import type { MonetizationEventInput } from '@/lib/monetization';

export function trackMonetizationEvent(input: MonetizationEventInput): void {
  fetch('/api/monetization-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    keepalive: true,
  }).catch(() => {
    // Analytics must never block checkout or card creation.
  });
}
