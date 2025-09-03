import { test, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceInventoryPage } from '../../pages/SauceInventoryPage';
import { SauceCartPage } from '../../pages/SauceCartPage';
import { SauceCheckoutPage } from '../../pages/SauceCheckoutPage';
import { DataUtils } from '../../../../core-framework/utils/DataUtils';
import CONFIG from '../../../../core-framework/config/config';
import { BrowserUtils } from '../../../../core-framework/utils/BrowserUtils';

// Load test data
const userData = DataUtils.loadTestData('sauce-demo', 'users', CONFIG.env);
const productData = DataUtils.loadTestData('sauce-demo', 'products', CONFIG.env);

test.describe('@e2e @checkout Checkout Flow', () => {
  // This runs once before all tests in this describe block
  test.beforeAll(async ({ browser }) => {
    console.log('Running setup for Sauce Demo application');
    
    // Create a context and page for setup
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Set up browser context with optimized settings
    BrowserUtils.setupBrowserContext(context, page);
    
    // Add debug listeners in non-production environments
    if (CONFIG.env !== 'prod') {
      BrowserUtils.addNetworkDebugListeners(page);
    }
    
    // Verify connectivity to the application URL
    const baseUrl = CONFIG.baseUrl;
    console.log(`Checking connectivity to ${baseUrl}`);
    
    const canAccess = await BrowserUtils.canAccessUrl(page, baseUrl);
    if (!canAccess) {
      console.error(`⚠️ Cannot access ${baseUrl} - there may be connectivity issues`);
    } else {
      console.log(`✅ Successfully verified connectivity to ${baseUrl}`);
    }
    
    // Close the context after setup
    await context.close();
  });

  // This runs once after all tests in this describe block
  test.afterAll(async () => {
    console.log('Running cleanup for Sauce Demo application');
    // Add application-specific cleanup logic here if needed
  });

  test.beforeEach(async ({ page }) => {
    // Login before each test using the page object
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    await loginPage.login(
      userData.standardUser.username,
      userData.standardUser.password
    );
    
    // Verify successful login
    const inventoryPage = new SauceInventoryPage(page);
    await expect(await inventoryPage.isLoaded()).toBeTruthy();
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
