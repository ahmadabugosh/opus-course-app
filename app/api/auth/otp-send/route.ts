import { NextResponse } from 'next/server';

import { get, run } from '@/lib/db';
import { generateOtpCode, getOtpExpiry, hashOtpCode } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/loops';

type UserRow = {
  id: number;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const otp = generateOtpCode();
  const otpHash = hashOtpCode(otp);
  const otpExpiresAt = getOtpExpiry();

  const existingUser = get<UserRow>('SELECT id FROM users WHERE email = ?', email);

  if (existingUser) {
    run('UPDATE users SET otp_code = ?, otp_expires_at = ?, updated_at = datetime(\'now\') WHERE id = ?', otpHash, otpExpiresAt, existingUser.id);
  } else {
    run('INSERT INTO users (email, otp_code, otp_expires_at) VALUES (?, ?, ?)', email, otpHash, otpExpiresAt);
  }

  // Send OTP email via Loops
  const emailSent = await sendOtpEmail(email, otp);

  if (!emailSent) {
    console.error(`[OTP] Failed to send email to ${email}, but OTP saved. Code: ${otp}`);
    // Still return success since OTP is saved in DB - user can retry or check logs
  }

  return NextResponse.json({ success: true, message: 'OTP sent' });
}
