import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'src');

const bannedPatterns = [
  /pagead2\.googlesyndication\.com/,
  /adsbygoogle/,
  /ca-pub-1555702340859042/,
  /GoogleAdsense/,
  /AdsenseSlot/,
  /NEXT_PUBLIC_ADSENSE/,
  /data-ad-client/,
  /data-ad-slot/,
  /ad_storage/,
  /ad_user_data/,
  /ad_personalization/,
  /ads_data_redaction/,
];

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const absolutePath = join(dir, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      return listSourceFiles(absolutePath);
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      return [absolutePath];
    }

    return [];
  });
}

const offenders = listSourceFiles(sourceRoot).flatMap((file) => {
  const source = readFileSync(file, 'utf8');
  return bannedPatterns
    .filter((pattern) => pattern.test(source))
    .map((pattern) => `${relative(root, file)} contains ${pattern}`);
});

for (const removedAdComponent of [
  'src/components/GoogleAdsense.tsx',
  'src/components/AdsenseSlot.tsx',
]) {
  assert.equal(
    existsSync(join(root, removedAdComponent)),
    false,
    `${removedAdComponent} should be removed`
  );
}

assert.deepEqual(offenders, []);

console.log('ad removal regression checks passed');
