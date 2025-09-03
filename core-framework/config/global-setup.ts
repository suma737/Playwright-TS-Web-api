import { FullConfig } from '@playwright/test';
import CONFIG from './config';

/**
 * Global setup that runs before all tests
 * This is a good place to set up global test data, authenticate if needed globally, etc.
 */
async function globalSetup(config: FullConfig): Promise<void> {
  console.log(`Starting tests for application: ${CONFIG.app} in environment: ${CONFIG.env}`);
  console.log(`Base URL: ${CONFIG.baseUrl}`);
  console.log(`API Base URL: ${CONFIG.apiBaseUrl}`);
  console.log(`Test results will be saved to: ${CONFIG.testResultsDir}`);
  
  // Add any global setup logic here
  // For example, setting up global authentication tokens, test data, etc.
}

export default globalSetup;
