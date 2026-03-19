import crypto from 'node:crypto';

export const AUTH_COOKIE_NAME = 'opus_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const OTP_TTL_MINUTES = 10;

type SessionPayload = {
  userId: number;
  exp: number;
};

type CreateSessionTokenOptions = {
  userId: number;
  maxAgeSeconds?: number;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'dev-session-secret-change-me';
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(payload: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function generateOtpCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function hashOtpCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function verifyOtpCode(code: string, hashedCode: string) {
  return hashOtpCode(code) === hashedCode;
}

export function getOtpExpiry(minutes = OTP_TTL_MINUTES) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

export function createSessionToken({ userId, maxAgeSeconds = SESSION_TTL_SECONDS }: CreateSessionTokenOptions) {
  const payload: SessionPayload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (!payload.userId || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
