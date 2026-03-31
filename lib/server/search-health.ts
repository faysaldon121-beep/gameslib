// lib/server/search-health.ts
// Health check endpoint implementation

import { searchSystem } from './search-system';

export async function getSearchHealth() {
  const health = await searchSystem.healthCheck();
  const status = searchSystem.getStatus();
  
  return {
    timestamp: new Date().toISOString(),
    service: 'search-system',
    version: '1.0.0',
    ...health,
    details: {
      ...status,
      uptime: process.uptime()
    }
  };
}
