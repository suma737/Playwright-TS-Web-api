import { test, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceInventoryPage } from '../../pages/SauceInventoryPage';
import { SauceCartPage } from '../../pages/SauceCartPage';
import { SauceCheckoutPage } from '../../pages/SauceCheckoutPage';

/**
 * This test suite demonstrates a complete checkout flow with proper error handling
 * All error handling is done within the framework (BasePage and ErrorReportingUtils)
 * The test code remains clean and focused on the business logic
 */
test.describe('Checkout Flow with Error Handling', () => {
  test('Complete checkout flow with standard user', async ({ page }) => {
    // Create page objects
    const loginPage = new SauceLoginPage(page);
    const inventoryPage = new SauceInventoryPage(page);
    const cartPage = new SauceCartPage(page);
    const checkoutPage = new SauceCheckoutPage(page);
    
    // Step 1: Login - any errors will be automatically handled by BasePage
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    
    // Step 2: Add items to cart - any errors will be automatically handled by BasePage
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.addProductToCart('Sauce Labs Bike Light');
    
    // Step 3: Go to cart
    await inventoryPage.goToCart();
    
    // Step 4: Verify items in cart
    await expect(page).toHaveURL(/.*cart.html/);
    await expect(cartPage.getLocator('.cart_item')).toHaveCount(2);
    
    // Step 5: Proceed to checkout
    await cartPage.checkout();
    
    // Step 6: Fill checkout information
    await checkoutPage.fillCheckoutInfo('John', 'Doe', '12345');
    await checkoutPage.continueToOverview();
    
    // Step 7: Verify checkout overview
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
    
    // Step 8: Complete order
    await checkoutPage.finishCheckout();
    
    // Step 9: Verify order completion
    await expect(page).toHaveURL(/.*checkout-complete.html/);
    await expect(checkoutPage.getLocator('.complete-header')).toHaveText('Thank you for your order!');
  });
  
  test('Checkout with invalid zip code', async ({ page }) => {
    // Create page objects
    const loginPage = new SauceLoginPage(page);
    const inventoryPage = new SauceInventoryPage(page);
    const cartPage = new SauceCartPage(page);
    const checkoutPage = new SauceCheckoutPage(page);
    
    // Login and add item to cart
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    await cartPage.checkout();
    
    // Attempt checkout with invalid zip code (empty)
    // The framework will automatically handle and report the error
    await checkoutPage.fillCheckoutInfo('John', 'Doe', '');
    await checkoutPage.continueToOverview();
    
    // Verify error message is displayed
    await expect(checkoutPage.getLocator('[data-test="error"]')).toBeVisible();
  });
  
  test('Checkout with locked out user', async ({ page }) => {
    // Create page objects
    const loginPage = new SauceLoginPage(page);
    
    // Attempt login with locked out user
    // The framework will automatically handle and report the error
    await loginPage.navigate();
    await loginPage.login('locked_out_user', 'secret_sauce');
    
    // Verify error message is displayed
    await expect(loginPage.getLocator('[data-test="error"]')).toBeVisible();
  });
  
  test('Attempt to access checkout without items in cart', async ({ page }) => {
    // Create page objects
    const loginPage = new SauceLoginPage(page);
    const inventoryPage = new SauceInventoryPage(page);
    const cartPage = new SauceCartPage(page);
    
    // Login and go to cart without adding items
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.goToCart();
    
    // Verify cart is empty
    await expect(cartPage.getLocator('.cart_item')).toHaveCount(0);
    
    // Try to checkout with empty cart
    await cartPage.checkout();
    
    // Continue with checkout process
    // Even though there are no items, the site allows proceeding
    // Our framework will capture any unexpected behavior
    const checkoutPage = new SauceCheckoutPage(page);
    await checkoutPage.fillCheckoutInfo('John', 'Doe', '12345');
    await checkoutPage.continueToOverview();
    
    // Verify we can still proceed
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
  });
});
