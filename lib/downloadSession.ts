// lib/downloadSession.ts (full replacement)
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/auth'; // Optional auth

const SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = 'gameslib-download';
const MAX_AGE_MS = 120 * 120 * 1000; // 1 hour
const MAX_AGE_SEC = 3600;

interface DownloadPayload {
  gameId: string;
  userId?: string;
  createdAt: number;
  used: boolean;
}

function sign(payloadStr: string): string {
  return crypto.createHmac('sha256', SECRET).update(payloadStr).digest('hex').slice(0, 32);
}

export function parseCookie(cookieHeader: string | null | undefined): DownloadPayload | null {
  if (!cookieHeader) return null;

  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value !== undefined) {
      cookies[name] = decodeURIComponent(value);
    }
  });

  const cookieValue = cookies[COOKIE_NAME];
  if (!cookieValue) return null;

  const [payloadStr, signature] = cookieValue.split('.');
  if (!payloadStr || !signature || signature !== sign(payloadStr)) {
    return null;
  }

  try {
    const payload: DownloadPayload = JSON.parse(payloadStr);
    if (Date.now() - payload.createdAt > MAX_AGE_MS || payload.used) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function generateDownloadSession(gameId: string) {
  const session = await auth(); // Optional: Get user if logged in
  const userId = session?.user?.id;

  const payload: DownloadPayload = {
    gameId,
    ...(userId && { userId }),
    createdAt: Date.now(),
    used: false,
  };
  const payloadStr = JSON.stringify(payload);
  const signature = sign(payloadStr);
  const cookieValue = `${payloadStr}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE_SEC,
    path: '/',
  });
}

export function getValidatedResponse(
  request: NextRequest,
  expectedGameId: string
): NextResponse {
  const payload = parseCookie(request.headers.get('cookie'));
  if (!payload || payload.gameId !== expectedGameId) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  // Set used=true cookie
  const usedPayload: DownloadPayload = { ...payload, used: true };
  const usedPayloadStr = JSON.stringify(usedPayload);
  const usedSignature = sign(usedPayloadStr);
  const usedCookieValue = `${usedPayloadStr}.${usedSignature}`;

  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, usedCookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: MAX_AGE_SEC,
    path: '/',
  });

  return response;
}
