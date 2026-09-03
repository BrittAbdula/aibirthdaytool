import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { GALLERY_PAGE_SIZE, getGalleryOffset } from '../src/lib/gallery-pagination';

const root = process.cwd();
const readSource = (path: string) => readFileSync(join(root, path), 'utf8');

assert.equal(GALLERY_PAGE_SIZE, 12);
assert.equal(getGalleryOffset(1), 0);
assert.equal(getGalleryOffset(2), GALLERY_PAGE_SIZE);
assert.equal(getGalleryOffset(3), GALLERY_PAGE_SIZE * 2);

const routeSource = readSource('src/app/api/cards/route.ts');
assert.match(routeSource, /case 'recent':[\s\S]*getRecentCardsServer\(page,\s*pageSize,\s*wishCardType,\s*relationship\)/);

const serverGalleryPages = [
  'src/app/card-gallery/page.tsx',
  'src/app/type/[type]/page.tsx',
  'src/app/relationship/[relationship]/page.tsx',
  'src/app/type/[type]/for/[relationship]/page.tsx',
];

for (const file of serverGalleryPages) {
  const source = readSource(file);
  assert.match(source, /GALLERY_PAGE_SIZE/, `${file} should use the shared gallery page size`);
  assert.doesNotMatch(source, /getFeaturedCardsServer\(1,\s*24/, `${file} should not hardcode a 24-card first page`);
}

// The gallery UI is consolidated into one client component shared by every gallery
// route; these files own paging and must use the shared page size.
const clientGalleryFiles = [
  'src/components/gallery/GalleryBrowser.tsx',
  'src/components/gallery/GalleryBrowserSkeleton.tsx',
  'src/lib/gallery-navigation.ts',
];

for (const file of clientGalleryFiles) {
  const source = readSource(file);
  assert.match(source, /GALLERY_PAGE_SIZE/, `${file} should use the shared gallery page size`);
  assert.doesNotMatch(source, /pageSize:\s*'12'/, `${file} should not hardcode API pageSize`);
  assert.doesNotMatch(source, /const CARDS_PER_PAGE = 12/, `${file} should not define a separate 12-card page size`);
}

// Per-route gallery clients were merged into GalleryBrowser. Re-adding one would
// reintroduce the duplicated filter and paging logic this consolidation removed.
const retiredGalleryClients = [
  'src/app/card-gallery/CardGallery.tsx',
  'src/app/card-gallery/CardGalleryContent.tsx',
  'src/app/card-gallery/CardTypeFilter.tsx',
  'src/app/type/[type]/TypeGalleryContent.tsx',
  'src/app/relationship/[relationship]/RelationshipGalleryContent.tsx',
  'src/app/type/[type]/for/[relationship]/TypeRelationshipGalleryContent.tsx',
  'src/components/CardGallery.tsx',
  'src/components/SimpleFilter.tsx',
];

for (const file of retiredGalleryClients) {
  assert.equal(existsSync(join(root, file)), false, `${file} should stay retired; use GalleryBrowser instead`);
}

// Cards reserve a fixed frame so appending a page cannot reflow the grid.
const cardSource = readSource('src/components/gallery/GalleryCard.tsx');
assert.match(cardSource, /aspect-\[5\/7\]/, 'gallery cards should reserve a fixed aspect ratio frame');
assert.doesNotMatch(
  cardSource,
  /columns-\d/,
  'gallery cards should not use CSS multi-column layout, which reflows on append'
);

console.log('gallery pagination helpers passed');
