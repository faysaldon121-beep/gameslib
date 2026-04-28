// lib/utils/hash.ts
import crypto from 'crypto';

/**
 * Hash IP address for privacy-safe storage
 */
export function hashIP(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'your-secret-salt-change-this';
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex');
}

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  // Try different headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}
