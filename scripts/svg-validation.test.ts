import assert from 'node:assert/strict';
import { extractSvgContent } from '../src/lib/svg-extract';
import { validateSvgContent } from '../src/lib/svg-validation';

const wrap = (body: string, attrs = 'viewBox="0 0 480 760"') =>
  `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>`;

for (const svg of [
  wrap('<rect width="480" height="760"/><text>Happy birthday 🎉 &amp; best wishes</text>'),
  wrap('<g><text>Hello<animate attributeName="opacity" values="0;1" dur="1s" fill="freeze"/></text></g>'),
  wrap('<style><![CDATA[.card > text {fill:red}]]></style><text class="card">Hi</text>'),
  wrap('<circle r="5"/>', 'width="100%" height="760px"'),
]) assert.doesNotThrow(() => validateSvgContent(svg));

// Reproductions of the production failures: prose in animation tags, unbound
// xlink prefixes, and mismatched closing tags all used to pass extraction.
for (const svg of [
  wrap('<text>Hi</text><animate attributeName="opacity" on the text'),
  wrap('<defs><path id="heart" d="M0 0L10 10"/></defs><use xlink:href="#heart"/>'),
  wrap('<g><text>Hi</g></text>'),
  wrap('<text fill="red" fill="blue">Hi</text>'),
  wrap('<text>&nbsp;</text>'),
  wrap('<text>&#0;</text>'),
  wrap('<text>Hi</text>', 'viewBox="0 0 480 0"'),
  wrap('<text>Hi</text>', 'viewBox="0 0 NaN 760"'),
  wrap('<text>Hi</text>', 'width="0" height="760"'),
  wrap('<defs><rect width="480" height="760"/></defs>'),
  wrap('<title>No drawing</title>'),
  wrap('<script><![CDATA[drawCard()]]></script><text>Hi</text>'),
  '<svg xmlns="wrong" viewBox="0 0 480 760"><text>Hi</text></svg>',
  '{"error":"Failed to fetch SVG: Not Found"}',
]) assert.throws(() => validateSvgContent(svg), /Invalid SVG/);

const repaired = extractSvgContent(wrap('<defs><path id="heart" d="M0 0L10 10"/></defs><use xlink:href="#heart"/>'))!;
assert.match(repaired, /xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink"/);
assert.doesNotThrow(() => validateSvgContent(repaired));
assert.equal(extractSvgContent(repaired), repaired);
console.log('SVG XML, namespace and canvas validation passed');
