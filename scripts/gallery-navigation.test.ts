import assert from 'node:assert/strict';

import {
  buildGalleryApiUrl,
  buildGalleryHref,
  buildInspirationHref,
  getHrefPath,
  isSamePath,
  normalizeGalleryRelationship,
  normalizeGalleryType,
  parseGalleryTab,
} from '../src/lib/gallery-navigation';

// Static routes win over query params.
assert.equal(buildGalleryHref({ type: null, relationship: null, tab: 'featured' }), '/card-gallery/?tab=featured');
assert.equal(buildGalleryHref({ type: 'birthday', relationship: null, tab: 'featured' }), '/type/birthday/');
assert.equal(buildGalleryHref({ type: null, relationship: 'friend', tab: 'featured' }), '/relationship/friend/');
assert.equal(buildGalleryHref({ type: 'birthday', relationship: 'friend', tab: 'featured' }), '/type/birthday/for/friend/');

// Combos without an SEO route fall back to a query param on the type page.
assert.equal(
  buildGalleryHref({ type: 'thankyou', relationship: 'friend', tab: 'recent' }),
  '/type/thankyou/?relationship=friend&tab=recent'
);
assert.equal(buildGalleryHref({ type: null, relationship: null, tab: 'popular' }), '/card-gallery/?tab=popular');

assert.equal(parseGalleryTab('liked'), 'liked');
assert.equal(parseGalleryTab('nope'), 'featured');
assert.equal(parseGalleryTab(null), 'featured');

assert.equal(normalizeGalleryType('Birthday'), 'birthday');
assert.equal(normalizeGalleryType('unknown'), null);
assert.equal(normalizeGalleryRelationship('Friend'), 'friend');
assert.equal(normalizeGalleryRelationship('%'), null);
assert.equal(normalizeGalleryRelationship('nobody'), null);

// The API expects the stored relationship label, not the slug.
assert.equal(
  buildGalleryApiUrl({ page: 2, tab: 'recent', type: 'birthday', relationship: 'friend' }),
  '/api/cards?page=2&pageSize=12&tab=recent&wishCardType=birthday&relationship=Friend'
);

assert.equal(getHrefPath('/type/birthday/?tab=recent#top'), '/type/birthday/');
assert.ok(isSamePath('/type/birthday', '/type/birthday/'));
assert.ok(!isSamePath('/type/birthday/', '/card-gallery/'));

assert.equal(
  buildInspirationHref({ cardType: 'birthday', relationship: 'Friend', message: 'Hi there' }),
  '/birthday/?relationship=Friend&message=Hi+there'
);

console.log('gallery navigation checks passed');

assert.equal(parseGalleryTab(null, 'recent'), 'recent');
assert.equal(parseGalleryTab('invalid', 'recent'), 'recent');
assert.equal(parseGalleryTab('featured', 'recent'), 'featured');
assert.equal(buildGalleryHref({ type: null, relationship: null, tab: 'recent' }), '/card-gallery/');
