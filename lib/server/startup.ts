// lib/server/startup.ts
import { runtimeSearchManager } from './runtimeSearchManager';

console.log('🚀 Initializing search manager on startup...');

// Initialize on module import
runtimeSearchManager.initialize().catch(error => {
  console.error('❌ Failed to initialize search manager:', error);
});
