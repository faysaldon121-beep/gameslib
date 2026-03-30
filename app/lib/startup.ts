// lib/startup.ts
import { runtimeSearchManager } from './server/runtimeSearchManager';

let isInitialized = false;

export async function initializeApp() {
  if (isInitialized) return;
  
  console.log('🚀 Starting application initialization...');
  
  try {
    // Initialize search manager (builds index if needed)
    await runtimeSearchManager.initialize();
    
    isInitialized = true;
    console.log('✅ Application initialized successfully');
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    throw error;
  }
}

// Auto-initialize when this module is imported
initializeApp().catch(console.error);
