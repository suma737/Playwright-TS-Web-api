import { chromium } from '@playwright/test';

/**
 * Simple script to debug browser navigation issues
 */
async function debugBrowser() {
  console.log('Starting browser debug script');
  
  try {
    // Launch browser with explicit options
    const browser = await chromium.launch({ 
      headless: false,
      slowMo: 50, // Slow down operations by 50ms
      timeout: 30000
    });
    
    console.log('Browser launched successfully');
    
    // Create a new context with viewport
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      acceptDownloads: true
    });
    
    console.log('Browser context created');
    
    // Create a new page
    const page = await context.newPage();
    
    // Add event listeners for debugging
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
    page.on('pageerror', err => console.error(`BROWSER ERROR: ${err.message}`));
    page.on('request', req => console.log(`REQUEST: ${req.url()}`));
    page.on('requestfailed', req => console.error(`REQUEST FAILED: ${req.url()}, ${req.failure()?.errorText}`));
    
    // Try different navigation approaches
    console.log('Attempting to navigate to https://www.saucedemo.com');
    
    // Approach 1: Basic navigation
    console.log('Approach 1: Basic navigation');
    const response = await page.goto('https://www.saucedemo.com', {
      waitUntil: 'load',
      timeout: 30000
    });
    
    console.log(`Navigation status: ${response?.status()} ${response?.statusText()}`);
    console.log(`Current URL: ${page.url()}`);
    
    // Take a screenshot
    await page.screenshot({ path: 'apps/sauce-demo/screenshots/debug/debug-approach1.png' });
    console.log('Screenshot saved to apps/sauce-demo/screenshots/debug/debug-approach1.png');
    
    // Wait to see if page loads
    await page.waitForTimeout(5000);
    
    // Check if login form is visible
    const loginButtonVisible = await page.isVisible('#login-button')
      .catch(() => false);
    
    console.log(`Login button visible: ${loginButtonVisible}`);
    
    if (loginButtonVisible) {
      // Try to login
      await page.fill('#user-name', 'standard_user');
      await page.fill('#password', 'secret_sauce');
      await page.click('#login-button');
      
      await page.waitForTimeout(5000);
      console.log(`After login, URL is: ${page.url()}`);
      await page.screenshot({ path: 'apps/sauce-demo/screenshots/debug/debug-after-login.png' });
      console.log('Screenshot saved to apps/sauce-demo/screenshots/debug/debug-after-login.png');
    }
    
    // Keep browser open for inspection
    console.log('Debug script completed. Browser will remain open for 30 seconds.');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    await browser.close();
    console.log('Browser closed');
    
  } catch (error) {
    console.error(`Debug script failed: ${error}`);
  }
}

// Run the debug function
debugBrowser().catch(console.error);
