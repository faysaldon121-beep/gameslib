// lib/services/view-tracker.ts
import { cookies } from 'next/headers';

export class ViewTracker {
  private static COOKIE_PREFIX = 'blog_view_';
  private static COOKIE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds

  static async hasViewed(slug: string): Promise<boolean> {
    const cookieStore = await cookies();
    const viewCookie = cookieStore.get(`${this.COOKIE_PREFIX}${slug}`);
    return !!viewCookie;
  }

  static async markAsViewed(slug: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(`${this.COOKIE_PREFIX}${slug}`, '1', {
      maxAge: this.COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }
}
