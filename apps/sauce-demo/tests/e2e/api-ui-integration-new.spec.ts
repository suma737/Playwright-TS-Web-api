import { test, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceCartPage } from '../../pages/SauceCartPage';
import { SauceCheckoutPage } from '../../pages/SauceCheckoutPage';
import { ApiTestHelper } from '../../api/ApiTestHelper';

// Import test data
const userData = {
  standardUser: {
    username: 'standard_user',
    password: 'secret_sauce',
    firstName: 'Test',
    lastName: 'User',
    postalCode: '12345'
  }
};

const productData = {
  products: [
    { id: 4, name: 'Sauce Labs Backpack' },
    { id: 1, name: 'Sauce Labs Bolt T-Shirt' }
  ]
};

test.describe('API-UI Integration Tests', () => {
  let apiHelper: ApiTestHelper;

  test.beforeAll(async () => {
    console.log('Setting up API helper for tests');
    const baseUrl = process.env.API_BASE_URL || 'https://www.saucedemo.com';
    apiHelper = new ApiTestHelper(baseUrl);
    
    // Initialize API helper with user credentials
    await apiHelper.initialize(
      userData.standardUser.username,
      userData.standardUser.password
    );
  });

  test.afterAll(async () => {
    console.log('Cleaning up API resources');
    await apiHelper.dispose();
  });

  test('@api-ui Checkout with pre-populated cart', async ({ page }) => {
    try {
      // 1. Setup cart via API
      const products = [
        { id: productData.products[0].id, quantity: 1 },
        { id: productData.products[1].id, quantity: 2 }
      ];
      
      const cartId = await apiHelper.setupCart(products);
      
      // 2. Login via UI
      console.log('Login via UI');
      const loginPage = new SauceLoginPage(page);
      await loginPage.goto();
      await loginPage.login(
        userData.standardUser.username,
        userData.standardUser.password
      );
      
      // 3. Navigate directly to cart (items already added via API)
      await apiHelper.navigateToCart(page);
      
      // 4. Verify cart contents and proceed with checkout
      const cartPage = new SauceCartPage(page);
      const checkoutPage = new SauceCheckoutPage(page);
      
      console.log('Verify cart contents and checkout');
      // Verify cart is loaded
      await expect(await cartPage.isLoaded()).toBeTruthy();
      
      // Verify products are in cart
      const cartItems = await cartPage.getCartItems();
      expect(cartItems.length).toBeGreaterThanOrEqual(2);
      
      // Proceed to checkout
      await cartPage.checkout();
      
      // 5. Complete checkout process
      console.log('Complete checkout process');
      // Fill checkout info
      await checkoutPage.fillCheckoutInfo(
        userData.standardUser.firstName,
        userData.standardUser.lastName,
        userData.standardUser.postalCode
      );
      
      // Continue to overview
      await checkoutPage.continueToOverview();
      
      // Finish checkout
      await checkoutPage.finishCheckout();
      
      // Verify checkout completion
      await expect(await checkoutPage.isCompletePageLoaded()).toBeTruthy();
      expect(await checkoutPage.getCompleteHeaderText()).toContain('Thank you for your order!');
    } catch (error) {
      console.error(`Error in checkout test: ${error}`);
      throw error;
    }
  });

  test('@api-ui Direct checkout from product page with API authentication', async ({ page }) => {
    try {
      // 1. Get products via API
      const products = await apiHelper.getProducts();
      const targetProduct = products[0]; // Use first product
      
      // 2. Login via UI
      console.log('Login via UI');
      const loginPage = new SauceLoginPage(page);
      await loginPage.goto();
      await loginPage.login(
        userData.standardUser.username,
        userData.standardUser.password
      );
      
      // 3. Navigate to inventory page first
      console.log('Navigate to inventory page');
      await page.goto('/inventory.html');
      
      // 4. Add to cart and checkout
      console.log('Add to cart and checkout');
      // Add to cart
      await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
      
      // Go to cart
      await page.click('.shopping_cart_link');
      
      // 5. Complete checkout process
      const cartPage = new SauceCartPage(page);
      const checkoutPage = new SauceCheckoutPage(page);
      
      console.log('Complete checkout process');
      // Verify cart is loaded
      await expect(await cartPage.isLoaded()).toBeTruthy();
      
      // Proceed to checkout
      await cartPage.checkout();
      
      // Fill checkout info
      await checkoutPage.fillCheckoutInfo(
        userData.standardUser.firstName,
        userData.standardUser.lastName,
        userData.standardUser.postalCode
      );
      
      // Continue to overview
      await checkoutPage.continueToOverview();
      
      // Finish checkout
      await checkoutPage.finishCheckout();
      
      // Verify checkout completion
      await expect(await checkoutPage.isCompletePageLoaded()).toBeTruthy();
      expect(await checkoutPage.getCompleteHeaderText()).toContain('Thank you for your order!');
    } catch (error) {
      console.error(`Error in direct checkout test: ${error}`);
      throw error;
    }
  });
});
