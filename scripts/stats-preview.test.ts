import assert from 'node:assert/strict';

import {
  getDailyStatsPreview,
  isPreviewVideoUrl,
} from '../src/lib/stats-preview';

assert.deepEqual(
  getDailyStatsPreview({
    isError: false,
    status: 'failed',
    errorMessage: 'provider failed',
    r2Url: '',
    responseContent: '',
  }),
  {
    kind: 'none',
    label: 'Failed',
    detail: 'provider failed',
  }
);

assert.deepEqual(
  getDailyStatsPreview({
    isError: false,
    status: 'pending',
    r2Url: '',
    responseContent: '',
  }),
  {
    kind: 'none',
    label: 'Pending',
    detail: 'Generation has not produced a preview yet.',
  }
);

const wrappedSvgPreview = getDailyStatsPreview({
  isError: false,
  status: 'completed',
  responseContent: '```svg\n<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>\n```',
});

assert.equal(wrappedSvgPreview.kind, 'image');
assert.match(wrappedSvgPreview.kind === 'image' ? wrappedSvgPreview.src : '', /^data:image\/svg\+xml;charset=utf-8,/);
assert.equal(
  decodeURIComponent((wrappedSvgPreview.kind === 'image' ? wrappedSvgPreview.src : '').replace('data:image/svg+xml;charset=utf-8,', '')),
  '<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>'
);

assert.deepEqual(
  getDailyStatsPreview({
    isError: false,
    status: 'completed',
    r2Url: 'https://store.celeprime.com/videos/2026/05/19/card.webm?token=abc',
    responseContent: '',
  }),
  {
    kind: 'video',
    src: 'https://store.celeprime.com/videos/2026/05/19/card.webm?token=abc',
  }
);

assert.equal(isPreviewVideoUrl('https://example.com/card.mp4'), true);
assert.equal(isPreviewVideoUrl('https://example.com/card.png'), false);

console.log('stats preview helpers passed');
