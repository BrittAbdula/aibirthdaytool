import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  GALLERY_PAGE_SIZE,
  MAX_GALLERY_PAGE_SIZE,
  getGalleryOffset,
  getPageFromCursor,
  getSafeGalleryPageSize,
  getNextPageCursor,
} from '../src/lib/gallery-pagination';

const root = process.cwd();
const readSource = (path: string) => readFileSync(join(root, path), 'utf8');

assert.equal(GALLERY_PAGE_SIZE, 12);
assert.equal(MAX_GALLERY_PAGE_SIZE, 24);
assert.equal(getSafeGalleryPageSize(undefined), GALLERY_PAGE_SIZE);
assert.equal(getSafeGalleryPageSize('999'), MAX_GALLERY_PAGE_SIZE);
assert.equal(getSafeGalleryPageSize('0'), GALLERY_PAGE_SIZE);
assert.equal(getSafeGalleryPageSize('abc'), GALLERY_PAGE_SIZE);
assert.equal(getGalleryOffset(3, 12), 24);
assert.equal(getNextPageCursor(1, true), '2');
assert.equal(getNextPageCursor(1, false), undefined);
assert.equal(getPageFromCursor('4'), 4);
assert.equal(getPageFromCursor('0'), null);
assert.equal(getPageFromCursor('abc'), null);

const cardsSource = readSource('src/lib/cards.ts');
assert.doesNotMatch(
  cardsSource,
  /COUNT\s*\(\s*DISTINCT\s+ec\."originalCardId"\s*\)/,
  'gallery reads should not run COUNT(DISTINCT originalCardId) per request'
);
assert.match(cardsSource, /LIMIT\s+\$\{queryLimit\}/, 'gallery queries should request one extra row');
assert.match(cardsSource, /hasMore/, 'gallery responses should expose hasMore');
assert.match(cardsSource, /nextCursor/, 'gallery responses should expose nextCursor');
assert.match(cardsSource, /DISTINCT ON\s*\(ec\."originalCardId"\)/, 'recent gallery should use DISTINCT ON');

const routeSource = readSource('src/app/api/cards/route.ts');
assert.match(routeSource, /MAX_GALLERY_PAGE_SIZE/, 'cards route should clamp pageSize');
assert.match(routeSource, /status:\s*400/, 'cards route should reject invalid parameters');
assert.match(routeSource, /Cache-Control/, 'cards route should set public cache headers');

console.log('gallery API contract checks passed');
