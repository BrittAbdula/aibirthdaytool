import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  getCardStatusPollingDelay,
  getRetryAfterSeconds,
  isTerminalCardStatus,
} from '../src/lib/card-status';

assert.equal(isTerminalCardStatus('completed'), true);
assert.equal(isTerminalCardStatus('failed'), true);
assert.equal(isTerminalCardStatus('processing'), false);
assert.equal(isTerminalCardStatus('pending'), false);
assert.equal(isTerminalCardStatus(null), false);

assert.equal(getCardStatusPollingDelay(0), 1000);
assert.equal(getCardStatusPollingDelay(4999), 1000);
assert.equal(getCardStatusPollingDelay(5000), 3000);
assert.equal(getCardStatusPollingDelay(29999), 3000);
assert.equal(getCardStatusPollingDelay(30000), 5000);
assert.equal(getRetryAfterSeconds(0), 1);
assert.equal(getRetryAfterSeconds(5000), 3);
assert.equal(getRetryAfterSeconds(30000), 5);

const root = process.cwd();
const routeSource = readFileSync(join(root, 'src/app/api/card-status/route.ts'), 'utf8');
const terminalReturnIndex = routeSource.indexOf('isTerminalCardStatus(card.status)');
const firstProviderStatusIndex = routeSource.indexOf('await requestGptImage2Status');

assert.notEqual(terminalReturnIndex, -1, 'card-status route should check terminal DB status');
assert.notEqual(firstProviderStatusIndex, -1, 'card-status route should still contain provider status handling');
assert.ok(
  terminalReturnIndex < firstProviderStatusIndex,
  'terminal DB status should return before provider status calls'
);

console.log('card status polling helpers passed');
