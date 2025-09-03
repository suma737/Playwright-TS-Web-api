import { expect } from '@playwright/test';
import { test } from '../../../../core-framework/config/app-fixtures';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceInventoryPage } from '../../pages/SauceInventoryPage';
import { SauceCartPage } from '../../pages/SauceCartPage';
import { SauceCheckoutPage } from '../../pages/SauceCheckoutPage';
import { DataUtils } from '../../../../core-framework/utils/DataUtils';
import CONFIG from '../../../../core-framework/config/config';

// Load test data
const userData = DataUtils.loadTestData('sauce-demo', 'users', CONFIG.env);
const productData = DataUtils.loadTestData('sauce-demo', 'products', CONFIG.env);

// Use the appBeforeSuite and appAfterSuite fixtures
test.use({ appBeforeSuite: async () => {}, appAfterSuite: async () => {} });

test.describe('@e2e @checkout Checkout Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    console.log('Starting beforeEach hook');
    
    // Configure page for better stability
    await context.route('**/*', route => {
      // Block unnecessary resources that might slow down the test
      const url = route.request().url();
      if (url.includes('google-analytics') || url.includes('tracking')) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // Add page event listeners for debugging
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
    page.on('pageerror', err => console.error(`BROWSER ERROR: ${err.message}`));
    page.on('request', req => console.log(`REQUEST: ${req.url()}`));
    page.on('requestfailed', req => console.error(`REQUEST FAILED: ${req.url()}, ${req.failure()?.errorText}`));
    
    // Take screenshot before navigation
    await page.screenshot({ path: 'before-navigation-fixtures.png' });
    console.log('Screenshot saved to before-navigation-fixtures.png');
    
    // Direct navigation to the site
    console.log('Directly navigating to the site');
    try {
      // Use a direct approach with minimal options
      await page.goto('https://www.saucedemo.com', { timeout: 30000 });
      
      // Log current URL
      console.log(`Current URL after navigation: ${page.url()}`);
      
      // Take screenshot after navigation
      await page.screenshot({ path: 'after-navigation-fixtures.png' });
      console.log('Screenshot saved to after-navigation-fixtures.png');
      
      // Check if we're on the right page
      if (!page.url().includes('saucedemo.com')) {
        console.error(`Navigation failed: URL is ${page.url()}`);
        throw new Error('Navigation failed: Not on saucedemo.com');
      }
      
      // Wait for login form
      await page.waitForSelector('#login-button', { timeout: 10000 });
      
      // Login directly
      await page.fill('#user-name', userData.standardUser.username);
      await page.fill('#password', userData.standardUser.password);
      await page.click('#login-button');
      
      // Wait for inventory page to load
      await page.waitForSelector('.inventory_list', { timeout: 10000 });
      
      // Verify successful login
      console.log('Verifying successful login');
      const inventoryPage = new SauceInventoryPage(page);
      await expect(await inventoryPage.isLoaded()).toBeTruthy();
      
      console.log('beforeEach hook completed successfully');
    } catch (error) {
      console.error(`Navigation or login failed: ${error}`);
      await page.screenshot({ path: 'navigation-error-fixtures.png' });
      throw error;
    }
  });

  test('@smoke Standard user should be able to complete checkout', async ({ page }) => {
    // Test implementation...
    const inventoryPage = new SauceInventoryPage(page);
    const cartPage = new SauceCartPage(page);
    const checkoutPage = new SauceCheckoutPage(page);
    
    const product = productData.products[0];
    
    await inventoryPage.addProductToCart(product.name);
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillCheckoutInfo(
      userData.standardUser.firstName,
      userData.standardUser.lastName,
      userData.standardUser.postalCode
    );
    await checkoutPage.continueToOverview();
    await checkoutPage.finishCheckout();
    
    await expect(await checkoutPage.isCompletePageLoaded()).toBeTruthy();
  });

  // Additional tests...
});
