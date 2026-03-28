// lib/session.ts
import { IronSessionOptions } from 'iron-session';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_SECRET!, // Must be 32+ chars
  cookieName: 'gameslib-download',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict', // CSRF protection
    maxAge: 60 * 60 * 1000, // 1 HOUR expiry (3600 seconds)
  },
};
