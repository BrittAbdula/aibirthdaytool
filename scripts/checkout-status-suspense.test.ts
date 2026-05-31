import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const layoutSource = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');

assert.match(
  layoutSource,
  /import\s+\{\s*Suspense\s*\}\s+from\s+["']react["']/,
  'RootLayout should import Suspense for client hooks used in global UI'
);

assert.match(
  layoutSource,
  /<Suspense\s+fallback=\{null\}>[\s\S]*<CheckoutStatusToast\s*\/>[\s\S]*<\/Suspense>/,
  'CheckoutStatusToast should be wrapped in Suspense because it uses useSearchParams'
);

console.log('checkout status suspense boundary ok');
