import { test, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceInventoryPage } from '../../pages/SauceInventoryPage';
import { SauceCartPage } from '../../pages/SauceCartPage';
import { SauceCheckoutPage } from '../../pages/SauceCheckoutPage';
import { VisualTestingUtils } from '../../../../core-framework/utils/VisualTestingUtils';
import { DataUtils } from '../../../../core-framework/utils/DataUtils';
import CONFIG from '../../../../core-framework/config/config';

// Load test data
const userData = DataUtils.loadTestData('sauce-demo', 'users', CONFIG.env);

test.describe('@smoke Sauce Demo Visual Regression Tests', () => {
  let visualUtils: VisualTestingUtils;
  
  test.beforeEach(async ({ page }) => {
    // Initialize visual testing utils
    visualUtils = new VisualTestingUtils(page);
  });
  
  test('Login page visual regression', async ({ page }) => {
    // Navigate to login page
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    
    // Take screenshot of the full page
    await visualUtils.takeFullPageScreenshot('login-page');
    
    // Compare with baseline
    const result = await visualUtils.compareWithBaseline('login-page');
    expect(result).toBeTruthy();
  });
  
  test('Product inventory visual regression', async ({ page }) => {
    // Login and navigate to inventory
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    await loginPage.login(userData.standardUser.username, userData.standardUser.password);
    
    // Wait for inventory page to load
    const inventoryPage = new SauceInventoryPage(page);
    await inventoryPage.waitForNavigation();
    
    // Take screenshot of the full page
    await visualUtils.takeFullPageScreenshot('inventory-page');
    
    // Compare with baseline
    const result = await visualUtils.compareWithBaseline('inventory-page');
    expect(result).toBeTruthy();
    
    // Test different sort orders
    await inventoryPage.sortProducts('za');
    await page.waitForTimeout(500); // Wait for sort to complete
    await visualUtils.takeElementScreenshot('.inventory_list', 'products-za-sort');
    const zaResult = await visualUtils.compareWithBaseline('products-za-sort', { fullPage: false });
    expect(zaResult).toBeTruthy();
    
    // Sort price high to low
    await inventoryPage.sortProducts('hilo');
    await page.waitForTimeout(500); // Wait for sort to complete
    await visualUtils.takeElementScreenshot('.inventory_list', 'products-hilo-sort');
    const hiloResult = await visualUtils.compareWithBaseline('products-hilo-sort', { fullPage: false });
    expect(hiloResult).toBeTruthy();
  });
  
  test('Checkout flow visual regression', async ({ page }) => {
    // Login and add item to cart
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    await loginPage.login(userData.standardUser.username, userData.standardUser.password);
    
    const inventoryPage = new SauceInventoryPage(page);
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    
    // Cart page
    const cartPage = new SauceCartPage(page);
    await cartPage.waitForNavigation();
    await visualUtils.takeFullPageScreenshot('cart-page');
    const cartResult = await visualUtils.compareWithBaseline('cart-page');
    expect(cartResult).toBeTruthy();
    
    // Go to checkout
    await cartPage.checkout();
    
    // Checkout info page
    const checkoutPage = new SauceCheckoutPage(page);
    await checkoutPage.waitForElement('[data-test="firstName"]');
    await visualUtils.takeFullPageScreenshot('checkout-info-page');
    
    // Fill checkout info and continue
    await checkoutPage.fillCheckoutInfo(
      userData.standardUser.firstName,
      userData.standardUser.lastName,
      userData.standardUser.postalCode
    );
    await checkoutPage.continueToOverview();
    
    // Checkout overview page
    await visualUtils.takeFullPageScreenshot('checkout-overview-page');
    
    // Complete checkout
    await checkoutPage.finishCheckout();
    
    // Checkout complete page
    await visualUtils.takeFullPageScreenshot('checkout-complete-page');
    const completeResult = await visualUtils.compareWithBaseline('checkout-complete-page');
    expect(completeResult).toBeTruthy();
  });
});
