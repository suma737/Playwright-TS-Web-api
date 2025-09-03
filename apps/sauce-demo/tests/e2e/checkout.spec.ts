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
    // Arrange
    const inventoryPage = new SauceInventoryPage(page);
    const cartPage = new SauceCartPage(page);
    const checkoutPage = new SauceCheckoutPage(page);
    
    const product = productData.products[0];
    
    // Act - Add product to cart
    console.log(product.name);
    await inventoryPage.addProductToCart(product.name);
    
    // Act - Go to cart
    await inventoryPage.goToCart();
    await expect(await cartPage.isLoaded()).toBeTruthy();
    
    // Act - Proceed to checkout
    await cartPage.checkout();
    await checkoutPage.fillCheckoutInfo(
      userData.standardUser.firstName,
      userData.standardUser.lastName,
      userData.standardUser.postalCode
    );
    await checkoutPage.continueToOverview();
    
    // Act - Complete checkout
    await checkoutPage.finishCheckout();
    
    // Assert - Checkout complete page is shown
    await expect(await checkoutPage.isCompletePageLoaded()).toBeTruthy();
    expect(await checkoutPage.getCompleteHeaderText()).toContain('Thank you for your order!');
  });

  test('@regression Complete checkout with multiple items', async ({ page }) => {
    // Arrange
    const inventoryPage = new SauceInventoryPage(page);
    const cartPage = new SauceCartPage(page);
    const checkoutPage = new SauceCheckoutPage(page);
    
    // Select products from test data
    const product1 = productData.products[0];
    const product2 = productData.products[1];
    
    // Act - Add products to cart
    await inventoryPage.addProductToCart(product1.name);
    await inventoryPage.addProductToCart(product2.name);
    
    // Act - Go to cart and checkout
    await inventoryPage.goToCart();
    await cartPage.checkout();
    
    // Act - Fill checkout information
    await checkoutPage.fillCheckoutInfo(
      userData.standardUser.firstName,
      userData.standardUser.lastName,
      userData.standardUser.postalCode
    );
    await checkoutPage.continueToOverview();
    
    // Act - Complete checkout
    await checkoutPage.finishCheckout();
    
    // Assert - Checkout complete page is shown
    await expect(await checkoutPage.isCompletePageLoaded()).toBeTruthy();
  });

  test('@validation @regression Validate checkout information validation', async ({ page }) => {
    // Arrange
    const inventoryPage = new SauceInventoryPage(page);
    const cartPage = new SauceCartPage(page);
    const checkoutPage = new SauceCheckoutPage(page);
    
    // Add a product to cart
    await inventoryPage.addProductToCart(productData.products[0].name);
    await inventoryPage.goToCart();
    await cartPage.checkout();
    
    // Act & Assert - Try to continue without filling any fields
    await checkoutPage.continueToOverview();
    expect(await checkoutPage.getErrorMessage()).toContain('First Name is required');
    
    // Act & Assert - Try to continue with only first name
    await checkoutPage.fillCheckoutInfo(userData.standardUser.firstName, '', '');
    await checkoutPage.continueToOverview();
    expect(await checkoutPage.getErrorMessage()).toContain('Last Name is required');
    
    // Act - Fill all fields and continue
    await checkoutPage.fillCheckoutInfo(
      userData.standardUser.firstName,
      userData.standardUser.lastName,
      userData.standardUser.postalCode
    );
    await checkoutPage.continueToOverview();
    
    // Assert - Successfully proceeded to overview page
    await expect(await checkoutPage.isOverviewPageLoaded()).toBeTruthy();
  });
});
