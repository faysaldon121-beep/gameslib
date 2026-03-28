// lib/downloadSession.ts
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session/edge';
import { sessionOptions } from '@/lib/session';
import type { NextRequest } from 'next/server';

interface DownloadSessionData {
  gameId: string;
  createdAt: number;
  used: boolean;
}

export async function generateDownloadSession(gameId: string) {
  const session = await getIronSession<DownloadSessionData>(cookies(), sessionOptions);
  
  session.gameId = gameId;
  session.createdAt = Date.now();
  session.used = false;
  
  await session.save(); // Signs & sets HttpOnly cookie
}

export async function validateDownloadSession(request?: NextRequest): Promise<string | null> {
  const sessionCookie = cookies();
  const session = await getIronSession<DownloadSessionData>(sessionCookie, sessionOptions);
  
  // Check expiry (redundant but explicit)
  if (Date.now() - (session.createdAt || 0) > sessionOptions.cookieOptions!.maxAge!) {
    return null;
  }
  
  // Check single-use
  if (session.used) {
    return null;
  }
  
  // Mark as used
  session.used = true;
  await session.save();
  
  return session.gameId || null;
}
