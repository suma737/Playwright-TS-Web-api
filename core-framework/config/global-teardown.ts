import { FullConfig } from '@playwright/test';
import CONFIG from './config';

/**
 * Global teardown that runs after all tests
 * This is a good place to clean up resources, generate additional reports, etc.
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  console.log(`Completed tests for application: ${CONFIG.app} in environment: ${CONFIG.env}`);
  
  // Add any global teardown logic here
  // For example, cleaning up test data, sending notifications, etc.
}

export default globalTeardown;
