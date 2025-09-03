import { BrowserContext, Page } from '@playwright/test';

/**
 * Utility class for browser-related operations
 */
export class BrowserUtils {
  /**
   * Sets up browser context with optimized settings and event listeners
   * @param context Playwright BrowserContext
   * @param page Playwright Page
   */
  static setupBrowserContext(context: BrowserContext, page: Page): void {
    // Set default timeout for all operations
    context.setDefaultTimeout(30000);
    page.setDefaultTimeout(30000);
    
    // Add event listeners for debugging
    page.on('console', msg => {
      const type = msg.type();
      // Filter out noisy console messages
      if (['warning', 'error', 'assert'].includes(type)) {
        console.log(`BROWSER CONSOLE [${type}]: ${msg.text()}`);
      }
    });
    
    page.on('pageerror', err => {
      console.error(`BROWSER ERROR: ${err.message}`);
    });
    
    // Listen for failed requests that might indicate connectivity issues
    page.on('requestfailed', req => {
      // Only log important request failures (not tracking pixels, etc.)
      const url = req.url();
      if (!url.includes('google-analytics') && 
          !url.includes('tracking') && 
          !url.includes('telemetry')) {
        console.error(`REQUEST FAILED: ${url}, ${req.failure()?.errorText}`);
      }
    });
    
    // Configure request interception if needed
    // context.route('**/*', route => {
    //   // Add custom routing logic here if needed
    //   route.continue();
    // });
  }
  
  /**
   * Adds additional debug listeners for network activity
   * @param page Playwright Page
   */
  static addNetworkDebugListeners(page: Page): void {
    page.on('request', req => {
      const url = req.url();
      // Filter out noise
      if (!url.includes('.js') && !url.includes('.css') && !url.includes('.png')) {
        console.log(`REQUEST: ${req.method()} ${url}`);
      }
    });
    
    page.on('response', res => {
      const url = res.url();
      const status = res.status();
      
      // Only log non-200 responses or important endpoints
      if (status !== 200 || url.includes('api') || url.includes('login')) {
        console.log(`RESPONSE: ${status} ${url}`);
      }
    });
  }
  
  /**
   * Checks if the browser can access a URL
   * @param page Playwright Page
   * @param url URL to check
   * @returns True if the URL is accessible
   */
  static async canAccessUrl(page: Page, url: string): Promise<boolean> {
    try {
      const response = await page.goto(url, { 
        timeout: 10000,
        waitUntil: 'domcontentloaded'
      });
      
      return response !== null && response.status() < 400;
    } catch (error) {
      console.error(`Failed to access URL ${url}: ${error}`);
      return false;
    } finally {
      // Go back to about:blank to reset the page state
      await page.goto('about:blank').catch(() => {});
    }
  }
}
