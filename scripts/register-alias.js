// Resolves the "@/…" tsconfig path alias for ts-node test scripts.
const Module = require('node:module');
const path = require('node:path');

const originalResolveFilename = Module._resolveFilename;
const srcRoot = path.join(__dirname, '..', 'src');

Module._resolveFilename = function resolveWithAlias(request, ...rest) {
  const mapped = request.startsWith('@/') ? path.join(srcRoot, request.slice(2)) : request;
  return originalResolveFilename.call(this, mapped, ...rest);
};
