import { chromium } from '@playwright/test';

/**
 * Simple diagnostic script to test browser navigation
 */
async function debugBrowser() {
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
    
    // Navigate to the page with explicit wait options
    const response = await page.goto('https://www.saucedemo.com', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log(`Navigation status: ${response?.status()} ${response?.statusText()}`);
    
    // Wait for login form to be visible
    await page.waitForSelector('#login-button', { 
      state: 'visible',
      timeout: 15000
    });
    
    console.log('Login form is visible');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('Screenshot saved to debug-screenshot.png');
    
    // Fill in login form
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    
    console.log('Login attempted');
    
    // Wait for inventory page to load
    await page.waitForSelector('.inventory_list', {
      state: 'visible',
      timeout: 15000
    });
    
    console.log('Successfully logged in and loaded inventory page');
    
  } catch (error) {
    console.error(`Navigation failed: ${error}`);
  } finally {
    // Pause to keep the browser open for inspection
    console.log('Pausing for 10 seconds before closing browser...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Close browser
    await browser.close();
    console.log('Browser closed');
  }
}

// Run the debug function
debugBrowser().catch(console.error);
