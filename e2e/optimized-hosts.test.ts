/**
 * TASK-0552: only allowlisted hosts and same-origin paths may go through /_next/image.
 * Run with: npx tsx e2e/optimized-hosts.test.ts
 * Exits 0 on success, 1 on failure.
 */

import { canOptimizeImage } from '../lib/images/optimizedHosts';

let failures = 0;
let checks = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  checks++;
  if (actual !== expected) {
    failures++;
    console.error(`FAIL: ${label}\n  expected: ${String(expected)}\n  actual:   ${String(actual)}`);
  }
}

// Optimized
eq(canOptimizeImage('/images/cover.webp'), true, 'same-origin path');
eq(canOptimizeImage('https://res.cloudinary.com/dk/image/upload/x.jpg'), true, 'cloudinary');
eq(canOptimizeImage('https://images.unsplash.com/photo-1?w=800'), true, 'unsplash');

// Not optimized (rendered unoptimized, loaded from source)
eq(canOptimizeImage('https://www.trend.az/media/2026/09/18/x.jpg'), false, 'RSS publisher host');
eq(canOptimizeImage('http://res.cloudinary.com/x.jpg'), false, 'http even on allowlisted host');
eq(canOptimizeImage('//evil.example/x.jpg'), false, 'protocol-relative URL');
eq(canOptimizeImage('https://res.cloudinary.com.evil.example/x.jpg'), false, 'look-alike host');
eq(canOptimizeImage('data:image/png;base64,AAAA'), false, 'data URI');
eq(canOptimizeImage('not a url'), false, 'garbage');

if (failures > 0) {
  console.error(`\n${failures}/${checks} checks failed`);
  process.exit(1);
}
console.log(`OK: ${checks} checks passed`);
