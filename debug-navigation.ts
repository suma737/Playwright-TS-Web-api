import { chromium } from '@playwright/test';

/**
 * Simple script to debug navigation issues
 */
async function debugNavigation() {
  console.log('Starting browser debug script');
  
  // Launch browser with explicit options
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100, // Slow down operations by 100ms
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
  
  try {
    console.log('Attempting to navigate to https://www.saucedemo.com');
    
    // Try different navigation approaches
    
    // Approach 1: Basic navigation
    console.log('Approach 1: Basic navigation');
    const response = await page.goto('https://www.saucedemo.com', {
      waitUntil: 'commit',
      timeout: 30000
    });
    
    console.log(`Navigation status: ${response?.status()} ${response?.statusText()}`);
    console.log(`Current URL: ${page.url()}`);
    
    // Take a screenshot before navigation
    await page.screenshot({ path: 'apps/sauce-demo/screenshots/debug/debug-before-navigation.png' });
    console.log('Screenshot saved to apps/sauce-demo/screenshots/debug/debug-before-navigation.png');
    
    // Wait to see if page loads
    await page.waitForTimeout(5000);
    
    // Approach 2: Try with location.href if needed
    if (!page.url().includes('saucedemo.com')) {
      console.log('Approach 2: Using location.href');
      await page.evaluate(() => {
        window.location.href = 'https://www.saucedemo.com';
      });
      
      await page.waitForTimeout(5000);
      console.log(`After location.href, URL is: ${page.url()}`);
      await page.screenshot({ path: 'apps/sauce-demo/screenshots/debug/debug-approach2.png' });
      console.log('Screenshot saved to apps/sauce-demo/screenshots/debug/debug-approach2.png');
    }
    
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
    
  } catch (error) {
    console.error(`Navigation failed: ${error}`);
  } finally {
    // Keep browser open for inspection
    console.log('Debug script completed. Browser will remain open for 30 seconds.');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the debug function
debugNavigation().catch(console.error);
