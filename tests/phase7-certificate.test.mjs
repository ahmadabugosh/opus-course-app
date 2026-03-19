import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = '/root/projects/opus-course-app';

function readFile(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('certificate library exposes generation + persistence helpers', () => {
  const certificateLib = readFile('lib/certificate.ts');

  assert.match(certificateLib, /export\s+function\s+generateCertificateId/);
  assert.match(certificateLib, /export\s+function\s+generateCertificatePdfBuffer/);
  assert.match(certificateLib, /export\s+function\s+createAndStoreCertificate/);
  assert.match(certificateLib, /application\/pdf/);
});

test('certificate API route supports authenticated generation and download', () => {
  const route = readFile('app/api/certificate/generate/route.ts');

  assert.match(route, /export\s+async\s+function\s+POST/);
  assert.match(route, /export\s+async\s+function\s+GET/);
  assert.match(route, /Unauthorized/);
  assert.match(route, /createAndStoreCertificate/);
});

test('certificate email route exists with authenticated POST handler', () => {
  const route = readFile('app/api/certificate/email/route.ts');

  assert.match(route, /export\s+async\s+function\s+POST/);
  assert.match(route, /Unauthorized/);
  assert.match(route, /certificateId is required/);
});

test('certificate page includes OTP gate + generation + sharing UI', () => {
  const page = readFile('app/certificate/page.tsx');

  assert.match(page, /Get your Opus Mastery certificate/i);
  assert.match(page, /Get Certificate/i);
  assert.match(page, /\/api\/auth\/otp-send/);
  assert.match(page, /\/api\/auth\/otp-verify/);
  assert.match(page, /Generate Certificate/i);
  assert.match(page, /Email Certificate/i);
  assert.match(page, /Download Latest PDF/i);
  assert.match(page, /Share on LinkedIn/i);
  assert.match(page, /Share on Twitter\/?X/i);
});

test('certificate implementation has no blockchain or EAS dependencies', () => {
  const certificateLib = readFile('lib/certificate.ts');
  const route = readFile('app/api/certificate/generate/route.ts');

  assert.doesNotMatch(certificateLib, /eas|ethereum|attestation|blockchain/i);
  assert.doesNotMatch(route, /eas|ethereum|attestation|blockchain/i);
});
