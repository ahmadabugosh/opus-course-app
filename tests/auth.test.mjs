import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
  verifySessionToken,
} from '../lib/auth.ts';

test('otp generation creates 6 digit numeric codes', () => {
  const otp = generateOtpCode();

  assert.match(otp, /^\d{6}$/);
});

test('otp hash verifies correct code and rejects wrong code', () => {
  const otp = '123456';
  const hashed = hashOtpCode(otp);

  assert.equal(verifyOtpCode(otp, hashed), true);
  assert.equal(verifyOtpCode('654321', hashed), false);
});

test('session token round-trip returns user id and rejects tampering', () => {
  process.env.SESSION_SECRET = 'test-secret-very-long';

  const token = createSessionToken({ userId: 42, maxAgeSeconds: 60 });
  const payload = verifySessionToken(token);

  assert.equal(payload?.userId, 42);

  const tampered = `${token.slice(0, -1)}x`;
  assert.equal(verifySessionToken(tampered), null);
});

test('cookie name is stable for auth routes', () => {
  assert.equal(AUTH_COOKIE_NAME, 'opus_session');
});
