import assert from 'node:assert/strict';

import {
  dedupeById,
  getCleanupCutoffDate,
  isEditedCardCleanupCandidate,
} from './cleanup-card-policy';
import { classifyStorageUrl } from '../src/lib/r2';

const now = new Date('2026-05-11T00:00:00.000Z');
const cutoff = getCleanupCutoffDate(now, 180);

assert.equal(cutoff.toISOString(), '2025-11-12T00:00:00.000Z');

const oldInactiveCard = {
  createdAt: new Date('2025-11-11T23:59:59.999Z'),
  deleted: false,
  customUrl: null,
  userPlan: 'FREE',
  actions: [] as string[],
};

assert.equal(isEditedCardCleanupCandidate(oldInactiveCard, cutoff), true);
assert.equal(
  isEditedCardCleanupCandidate({ ...oldInactiveCard, createdAt: cutoff }, cutoff),
  false
);
assert.equal(
  isEditedCardCleanupCandidate({ ...oldInactiveCard, actions: ['download'] }, cutoff),
  false
);
assert.equal(
  isEditedCardCleanupCandidate({ ...oldInactiveCard, customUrl: 'mom-birthday' }, cutoff),
  false
);
assert.equal(
  isEditedCardCleanupCandidate({ ...oldInactiveCard, userPlan: 'PREMIUM' }, cutoff),
  false
);

assert.deepEqual(
  dedupeById([
    { id: 'card-1', value: 'first' },
    { id: 'card-1', value: 'duplicate' },
    { id: 'card-2', value: 'second' },
  ]),
  [
    { id: 'card-1', value: 'first' },
    { id: 'card-2', value: 'second' },
  ]
);

assert.deepEqual(classifyStorageUrl('https://store.celeprime.com/cards/2026/05/11/card.svg'), {
  action: 'delete-r2',
  provider: 'r2',
  key: 'cards/2026/05/11/card.svg',
  canDeleteDatabase: true,
});

assert.deepEqual(
  classifyStorageUrl('https://store.celeprime.com/cdn-cgi/imagedelivery/hash/image-id/public'),
  {
    action: 'skip',
    provider: 'cloudflare-images',
    reason: 'Cloudflare Images deletion is not enabled for this cleanup job',
    canDeleteDatabase: false,
  }
);

assert.deepEqual(classifyStorageUrl('https://example.com/image.png'), {
  action: 'skip',
  provider: 'external',
  reason: 'URL is not managed by this storage cleanup',
  canDeleteDatabase: true,
});

assert.deepEqual(classifyStorageUrl('data:image/png;base64,abc'), {
  action: 'skip',
  provider: 'data-url',
  reason: 'Inline data URL has no remote object to delete',
  canDeleteDatabase: true,
});

assert.deepEqual(classifyStorageUrl('https://store.celeprime.com/card/birthday.svg'), {
  action: 'skip',
  provider: 'unsupported-managed-url',
  reason: 'Managed URL is outside cleanup-owned prefixes',
  canDeleteDatabase: false,
});

console.log('cleanup card policy helpers passed');
