import { test as base } from '@playwright/test';
import CONFIG from '../../../core-framework/config/config';

/**
 * Generic application beforeSuite setup
 * This runs once before all tests in the suite
 */
export const beforeSuite = async (): Promise<void> => {
  console.log('Running beforeSuite for Generic application');
  // Add application-specific setup logic here
  // For example:
  // - Set up test data specific to this application
  // - Initialize application-specific resources
};

/**
 * Generic application afterSuite cleanup
 * This runs once after all tests in the suite
 */
export const afterSuite = async (): Promise<void> => {
  console.log('Running afterSuite for Generic application');
  // Add application-specific cleanup logic here
};

// You can also create application-specific fixtures
export const test = base.extend({
  // Example of an application-specific fixture
  genericAppContext: async ({}, use) => {
    // Setup before test
    const appContext = {
      appName: 'generic',
      environment: CONFIG.env,
      // Add other app-specific context here
    };
    
    // Use the fixture
    await use(appContext);
    
    // Cleanup after test
  }
});
