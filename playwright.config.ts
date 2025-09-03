import { PlaywrightTestConfig, devices } from '@playwright/test';
import path from 'path';
import CONFIG from './core-framework/config/config';

// Define a grep pattern based on tags if provided
let grepPattern: RegExp | undefined;
if (CONFIG.tags && CONFIG.tags.length > 0) {
  // Create a pattern that matches any of the specified tags
  const tagPatterns = CONFIG.tags.map(tag => `@${tag}\b`).join('|');
  grepPattern = new RegExp(tagPatterns);
  console.log(`Running tests with tags: ${CONFIG.tags.join(', ')}`);
}

// Define the Playwright configuration
const config: PlaywrightTestConfig = {
  // Test directory pattern
  testDir: path.join('apps', CONFIG.app, 'tests'),
  
  // Maximum time one test can run for
  timeout: CONFIG.timeout,
  
  // Test concurrency
  workers: CONFIG.debug ? 1 : CONFIG.workers,
  
  // Filter tests by tag if tags are provided
  grep: grepPattern,
  
  // Reporter configuration - JUnit XML and HTML as requested
  reporter: [
    ['junit', { outputFile: path.join(CONFIG.testResultsDir, 'junit-results.xml') }],
    ['html', { outputFolder: path.join(CONFIG.testResultsDir, 'html-report') }],
    ['list'] // Console output
  ],
  
  // Retry failed tests
  retries: CONFIG.debug ? 0 : CONFIG.retries,
  
  // Shared settings for all projects
  use: {
    // Base URL to use in navigation
    baseURL: CONFIG.baseUrl,
    
    // Browser trace mode
    trace: CONFIG.traceMode,
    
    // Screenshot mode
    screenshot: CONFIG.screenshotMode,
    
    // Record video
    video: CONFIG.recordVideo ? 'on-first-retry' : 'off',
    
    // Viewport size
    viewport: CONFIG.viewport,
    
    // Slow down execution for debugging
    launchOptions: {
      slowMo: CONFIG.slowMo,
      headless: CONFIG.headless
    }
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  
  // Output directory for test artifacts
  outputDir: path.join(CONFIG.testResultsDir, 'test-artifacts'),
  
  // Global setup and teardown
  globalSetup: path.join(__dirname, 'core-framework/config/global-setup.ts'),
  globalTeardown: path.join(__dirname, 'core-framework/config/global-teardown.ts'),
};

export default config;
