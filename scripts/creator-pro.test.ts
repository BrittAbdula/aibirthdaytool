import assert from 'node:assert/strict';
import {
  getCardTypeForOccasion,
  getCreatorDevice,
  getDaysUntil,
  getNextOccurrence,
  getWorkAnniversaryYears,
  isValidDateInput,
  parseCreatorRecipientCsv,
} from '../src/lib/creator-pro';

assert.equal(isValidDateInput('2026-02-28'), true);
assert.equal(isValidDateInput('2026-02-30'), false);
assert.equal(isValidDateInput('02/28/2026'), false);

const parsed = parseCreatorRecipientCsv([
  'name,occasionType,occasionDate,notes',
  '"Doe, Jane",birthday,1992-08-12,"Design, London"',
  'Mateo,work anniversary,2020-09-03,Five years',
  'Mateo,work anniversary,2020-09-03,Duplicate',
  'Bad Date,birthday,2026-02-30,',
].join('\n'));

assert.equal(parsed.records.length, 2);
assert.equal(parsed.records[0].name, 'Doe, Jane');
assert.equal(parsed.records[1].occasionType, 'work-anniversary');
assert.equal(parsed.errors.length, 2);

const now = new Date('2026-12-20T10:00:00Z');
assert.equal(getNextOccurrence(new Date('1990-01-03T00:00:00Z'), now).toISOString().slice(0, 10), '2027-01-03');
assert.equal(getDaysUntil(new Date('1990-12-25T00:00:00Z'), now), 5);
assert.equal(getNextOccurrence(new Date('1992-02-29T00:00:00Z'), new Date('2025-02-01T00:00:00Z')).toISOString().slice(0, 10), '2025-02-28');
assert.equal(getWorkAnniversaryYears(new Date('2020-09-03T00:00:00Z'), new Date('2026-08-01T00:00:00Z')), 6);
assert.equal(getWorkAnniversaryYears(new Date('2020-09-03T00:00:00Z'), new Date('2026-10-01T00:00:00Z')), 7);

assert.equal(getCardTypeForOccasion('work-anniversary'), 'anniversary');
assert.equal(getCardTypeForOccasion('appreciation'), 'thankyou');
assert.equal(getCreatorDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile'), 'mobile');
assert.equal(getCreatorDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'), 'desktop');

console.log('creator pro rules ok');
