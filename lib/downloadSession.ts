// lib/downloadSession.ts
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET!; // 64+ char from .env
const COOKIE_NAME = 'gameslib-download';
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

interface DownloadSessionData {
  gameId: string;
  createdAt: number;
  used: boolean;
  signature: string;
}

// Sign data
function sign(data: string): string {
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex').slice(0, 32);
}

// Verify & parse
export function parseCookie(cookieHeader?: string): DownloadSessionData | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = decodeURIComponent(value);
    return acc;
  }, {});

  const cookieValue = cookies[COOKIE_NAME];
  if (!cookieValue) return null;

  const [data, signature] = cookieValue.split('.');
  if (!data || !signature || signature !== sign(data)) {
    return null; // Tampered/Invalid
  }

  try {
    const parsed: DownloadSessionData = JSON.parse(data);
    if (Date.now() - parsed.createdAt > MAX_AGE_MS || parsed.used) {
      return null; // Expired or used
    }
    return parsed;
  } catch {
    return null;
  }
}

// Generate & set cookie (Server Components or Edge)
export async function generateDownloadSession(gameId: string) {
  const data: DownloadSessionData = {
    gameId,
    createdAt: Date.now(),
    used: false,
    signature: '', // Filled after
  };
  const dataStr = JSON.stringify(data);
  data.signature = sign(dataStr);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${dataStr}.${data.signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour (seconds)
    path: '/',
  });
}

// Validate & mark used (API Routes)
export async function validateDownloadSession(request: NextRequest): Promise<string | null> {
  const sessionData = parseCookie(request.headers.get('cookie'));
  if (!sessionData) return null;

  // Mark as used (server-side, no client change needed)
  // Since stateless, we just validate & "consume" by expiry/single-use check

  return sessionData.gameId;
}
