import { test as base } from '@playwright/test';
import CONFIG from './config';

// Define the fixture type
type AppFixture = {
  appBeforeSuite: () => Promise<void>;
  appAfterSuite: () => Promise<void>;
};

// Create a test fixture for application-specific setup
export const test = base.extend<AppFixture>({
  // This fixture runs the application-specific beforeSuite and afterSuite
  appBeforeSuite: [async ({}, use) => {
    // Determine which application we're running
    const appName = CONFIG.app;
    console.log(`Running beforeSuite for ${appName} application`);
    
    // Application-specific setup logic
    if (appName === 'sauce-demo') {
      // Sauce Demo specific setup
      console.log('Setting up Sauce Demo application');
      // Add your sauce-demo specific setup here
    } else if (appName === 'generic') {
      // Generic application setup
      console.log('Setting up Generic application');
      // Add your generic app specific setup here
    }
    
    // Allow the test to use this fixture
    await use(async () => {
      // This function can be called from tests if needed
      console.log(`Running additional beforeSuite setup for ${appName}`);
    });
    
  }, { scope: 'worker' }],
  
  // This fixture handles the afterSuite cleanup
  appAfterSuite: [async ({}, use) => {
    // Allow the test to use this fixture
    await use(async () => {
      // This function can be called from tests if needed
      console.log(`Running additional afterSuite cleanup for ${CONFIG.app}`);
    });
    
    // After all tests have completed
    console.log(`Running afterSuite for ${CONFIG.app} application`);
    
    // Application-specific cleanup logic
    if (CONFIG.app === 'sauce-demo') {
      // Sauce Demo specific cleanup
      console.log('Cleaning up Sauce Demo application');
    } else if (CONFIG.app === 'generic') {
      // Generic application cleanup
      console.log('Cleaning up Generic application');
    }
    
  }, { scope: 'worker' }],
});
