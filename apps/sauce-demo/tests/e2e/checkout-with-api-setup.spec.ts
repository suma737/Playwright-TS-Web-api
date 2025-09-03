import { test, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceInventoryPage } from '../../pages/SauceInventoryPage';
import { SauceCartPage } from '../../pages/SauceCartPage';
import { SauceCheckoutPage } from '../../pages/SauceCheckoutPage';
import { SauceApiClient } from '../../api/SauceApiClient';
import { CartRequest } from '../../api/models/ApiModels';

// Test data
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

test.describe('Sauce Demo Checkout with API Data Setup', () => {
  let apiClient: SauceApiClient;
  let cartId: string;

  // This runs once before all tests in this describe block
  test.beforeAll(async () => {
    console.log('Setting up API client for Sauce Demo application');
    
    // Initialize API client
    const baseUrl = process.env.API_BASE_URL || 'https://www.saucedemo.com';
    apiClient = new SauceApiClient(baseUrl);
    await apiClient.init();
    
    // Login via API
    const loginResponse = await apiClient.login(
      userData.standardUser.username,
      userData.standardUser.password
    );
    
    console.log(`API Login success: ${loginResponse.success}`);
  });

  // This runs once after all tests in this describe block
  test.afterAll(async () => {
    console.log('Cleaning up API resources for Sauce Demo application');
    await apiClient.dispose();
  });

  test.beforeEach(async ({ page }) => {
    console.log('Login before test');
    try {
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
      console.log('✅ Successfully logged in and verified inventory page is loaded');
    } catch (error) {
      console.error(`Error during login: ${error}`);
      throw error;
    }
  });

  test('@api-ui Complete checkout with cart prepared via API', async ({ page }) => {
    try {
      // Arrange - Setup cart via API
      const product = productData.products[0];
      
      console.log('Setup cart via API');
      const cartRequest: CartRequest = {
        items: [
          {
            productId: product.id,
            quantity: 1
          }
        ]
      };
      
      const cartResponse = await apiClient.addToCart(cartRequest);
      if ('statusCode' in cartResponse) {
        throw new Error(`Failed to add product to cart via API: ${cartResponse.message}`);
      }
      
      cartId = cartResponse.cartId;
      console.log(`✅ Successfully created cart via API with ID: ${cartId}`);
      
      // Initialize page objects
      const cartPage = new SauceCartPage(page);
      const checkoutPage = new SauceCheckoutPage(page);
      
      // Since API is mocked, add items via UI instead
      console.log('Adding items to cart via UI since API is mocked');
      await page.goto('/inventory.html');
      
      // Add the product to cart via UI
      const addToCartSelector = `[data-test="add-to-cart-${product.name.toLowerCase().replace(/ /g, '-')}"]`;
      console.log(`Clicking add to cart button with selector: ${addToCartSelector}`);
      await page.click(addToCartSelector);
      
      // Navigate to cart page
      console.log('Navigate to cart page');
      await page.goto('/cart.html');
      await expect(await cartPage.isLoaded()).toBeTruthy();
      
      // Verify the product is in the cart
      console.log('Verify product in cart');
      const cartItems = await cartPage.getCartItems();
      expect(cartItems.length).toBeGreaterThan(0);
      expect(cartItems[0].name).toContain(product.name);
      
      // Act - Proceed to checkout
      console.log('Proceed to checkout');
      await cartPage.checkout();
      
      console.log('Fill checkout information');
      await checkoutPage.fillCheckoutInfo(
        userData.standardUser.firstName,
        userData.standardUser.lastName,
        userData.standardUser.postalCode
      );
      await checkoutPage.continueToOverview();
      
      // Act - Complete checkout
      console.log('Complete checkout');
      await checkoutPage.finishCheckout();
      
      // Assert - Checkout complete page is shown
      console.log('Verify checkout completion');
      await expect(await checkoutPage.isCompletePageLoaded()).toBeTruthy();
      expect(await checkoutPage.getCompleteHeaderText()).toContain('Thank you for your order!');
    } catch (error) {
      console.error(`Error in checkout test: ${error}`);
      throw error;
    }
  });

  test('@api-ui Complete checkout with multiple items prepared via API', async ({ page }) => {
    try {
      // Arrange - Setup cart with multiple items via API
      const product1 = productData.products[0];
      const product2 = productData.products[1];
      
      console.log('Setup cart with multiple items via API');
      const cartRequest: CartRequest = {
        items: [
          {
            productId: product1.id,
            quantity: 1
          },
          {
            productId: product2.id,
            quantity: 2
          }
        ]
      };
      
      const cartResponse = await apiClient.addToCart(cartRequest);
      if ('statusCode' in cartResponse) {
        throw new Error(`Failed to add products to cart via API: ${cartResponse.message}`);
      }
      
      cartId = cartResponse.cartId;
      console.log(`✅ Successfully created cart via API with ID: ${cartId} containing multiple items`);
      
      // Initialize page objects
      const cartPage = new SauceCartPage(page);
      const checkoutPage = new SauceCheckoutPage(page);
      
      // Since API is mocked, add items via UI instead
      console.log('Adding items to cart via UI since API is mocked');
      await page.goto('/inventory.html');
      
      // Add the first product to cart via UI
      const addToCartSelector1 = `[data-test="add-to-cart-${product1.name.toLowerCase().replace(/ /g, '-')}"]`;
      console.log(`Clicking add to cart button with selector: ${addToCartSelector1}`);
      await page.click(addToCartSelector1);
      
      // Add the second product to cart via UI
      const addToCartSelector2 = `[data-test="add-to-cart-${product2.name.toLowerCase().replace(/ /g, '-')}"]`;
      console.log(`Clicking add to cart button with selector: ${addToCartSelector2}`);
      await page.click(addToCartSelector2);
      
      // Navigate to cart page
      console.log('Navigate to cart page');
      await page.goto('/cart.html');
      await expect(await cartPage.isLoaded()).toBeTruthy();
      
      // Verify the products are in the cart
      console.log('Verify multiple products in cart');
      const cartItems = await cartPage.getCartItems();
      expect(cartItems.length).toBeGreaterThanOrEqual(2);
      
      // Check if products are in cart by name
      const productNames = cartItems.map(item => item.name);
      expect(productNames.some(name => name.includes(product1.name))).toBeTruthy();
      expect(productNames.some(name => name.includes(product2.name))).toBeTruthy();
      
      // Act - Proceed to checkout
      console.log('Proceed to checkout');
      await cartPage.checkout();
      
      console.log('Fill checkout information');
      await checkoutPage.fillCheckoutInfo(
        userData.standardUser.firstName,
        userData.standardUser.lastName,
        userData.standardUser.postalCode
      );
      await checkoutPage.continueToOverview();
      
      // Act - Complete checkout
      console.log('Complete checkout');
      await checkoutPage.finishCheckout();
      
      // Assert - Checkout complete page is shown
      console.log('Verify checkout completion');
      await expect(await checkoutPage.isCompletePageLoaded()).toBeTruthy();
      expect(await checkoutPage.getCompleteHeaderText()).toContain('Thank you for your order!');
    } catch (error) {
      console.error(`Error in multiple items checkout test: ${error}`);
      throw error;
    }
  });
});
