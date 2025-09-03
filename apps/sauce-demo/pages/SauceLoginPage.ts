import { Page } from '@playwright/test';
import { BasePage } from '../../../core-framework/pages/BasePage';

/**
 * Page object for the Sauce Demo login page
 */
export class SauceLoginPage extends BasePage {
  // Selectors
  private readonly usernameInput = '#user-name';
  private readonly passwordInput = '#password';
  private readonly loginButton = '#login-button';
  private readonly errorMessage = '[data-test="error"]';

  /**
   * Constructor for SauceLoginPage
   * @param page Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the login page with direct approach and detailed logging
   */
  async goto(): Promise<void> {
    try {
      // Log the URL we're trying to navigate to
      console.log(`Attempting to navigate to URL: ${this.baseUrl}`);
      
      // First try with a simple navigation approach
      console.log('Using direct browser navigation with commit: true');
      
      // Force a hard navigation with commit: true
      const response = await this.page.goto(this.baseUrl, { 
        waitUntil: 'commit',  // Use commit which is faster than domcontentloaded
        timeout: 30000,
      });
      
      // Log response details
      if (response) {
        console.log(`Navigation response status: ${response.status()} ${response.statusText()}`);
        console.log(`Response URL: ${response.url()}`);
      } else {
        console.log('No response object received from navigation');
      }
      
      // Wait a moment for the page to start rendering
      console.log('Waiting for page to start rendering...');
      await this.page.waitForTimeout(2000);
      
      // Take a screenshot to debug
      await this.page.screenshot({ path: 'navigation-debug.png' });
      console.log('Screenshot saved to navigation-debug.png');
      
      // Log the current URL
      const currentUrl = this.page.url();
      console.log(`Current page URL: ${currentUrl}`);
      
      // Check if we're on the right page
      if (!currentUrl.includes('saucedemo.com')) {
        console.error(`Navigation failed: Current URL ${currentUrl} doesn't match expected domain`);
        
        // Try a more forceful approach
        console.log('Trying alternative navigation approach...');
        await this.page.evaluate((url) => {
          window.location.href = url;
        }, this.baseUrl);
        
        // Wait for the page to load
        await this.page.waitForTimeout(5000);
        console.log(`After location.href, URL is: ${this.page.url()}`);
      }
      
      // Check for login button with extended timeout
      console.log('Checking for login button...');
      const isButtonVisible = await this.page.isVisible(this.loginButton, { timeout: 10000 })
        .catch(e => {
          console.error(`Error checking login button visibility: ${e.message}`);
          return false;
        });
      
      if (isButtonVisible) {
        console.log('✅ Login button is visible, navigation successful');
      } else {
        console.error('❌ Login button not visible after navigation');
        throw new Error('Login button not visible after navigation');
      }
      
    } catch (error: any) {
      console.error(`Navigation failed with error: ${error.message}`);
      console.error(`Stack trace: ${error.stack}`);
      
      // Try one last desperate approach
      try {
        console.log('Attempting emergency navigation...');
        await this.page.evaluate(() => {
          document.body.innerHTML = '<div>Redirecting to Sauce Demo...</div>';
          setTimeout(() => { window.location.replace('https://www.saucedemo.com'); }, 1000);
        });
        await this.page.waitForTimeout(5000);
        console.log(`Emergency navigation result URL: ${this.page.url()}`);
      } catch (e) {
        console.error(`Emergency navigation also failed: ${e}`);
      }
      
      throw error;
    }
  }

  /**
   * Login with username and password with retry logic
   * @param username Username
   * @param password Password
   */
  async login(username: string, password: string): Promise<void> {
    const maxRetries = 2;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Login attempt ${retryCount + 1} of ${maxRetries}`);
        
        // Clear fields first in case there's any text
        await this.page.evaluate(() => {
          const usernameField = document.querySelector('#user-name') as HTMLInputElement;
          const passwordField = document.querySelector('#password') as HTMLInputElement;
          if (usernameField) usernameField.value = '';
          if (passwordField) passwordField.value = '';
        });
        
        // Fill in the form fields
        await this.fill(this.usernameInput, username);
        await this.fill(this.passwordInput, password);
        
        // Click the login button
        await this.click(this.loginButton);
        
        // Wait a moment to see if we get redirected
        await this.page.waitForTimeout(2000);
        
        // Check if we're still on the login page (error case)
        const stillOnLoginPage = await this.page.isVisible(this.loginButton)
          .catch(() => false);
        
        if (!stillOnLoginPage) {
          console.log('Login successful, redirected from login page');
          return;
        }
        
        // Check if there's an error message
        const errorVisible = await this.isErrorDisplayed();
        if (errorVisible) {
          const errorMsg = await this.getErrorMessage();
          throw new Error(`Login failed: ${errorMsg}`);
        }
        
        throw new Error('Login failed: Still on login page after clicking login button');
        
      } catch (error: any) {
        lastError = error;
        console.error(`Login attempt ${retryCount + 1} failed: ${error.message}`);
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Retrying login in ${retryCount} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
        }
      }
    }
    
    // If we get here, all retries failed
    console.error(`All ${maxRetries} login attempts failed`);
    throw lastError || new Error('Failed to login after multiple attempts');
  }

  /**
   * Get error message text
   * @returns Error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if error message is displayed
   * @returns Whether error message is displayed
   */
  async isErrorDisplayed(): Promise<boolean> {
    return await this.isVisible(this.errorMessage);
  }
}
