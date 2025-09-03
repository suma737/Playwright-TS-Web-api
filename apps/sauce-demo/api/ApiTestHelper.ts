import { Page } from '@playwright/test';
import { SauceApiClient } from './SauceApiClient';
import { CartRequest, CartResponse, ApiError, Product } from './models/ApiModels';

/**
 * Helper class for using API in UI tests
 * Provides methods to set up test data via API before running UI tests
 */
export class ApiTestHelper {
  private apiClient: SauceApiClient;
  private isInitialized: boolean = false;

  /**
   * Creates a new instance of ApiTestHelper
   * @param baseUrl The base URL for the API
   */
  constructor(baseUrl: string) {
    this.apiClient = new SauceApiClient(baseUrl);
  }

  /**
   * Initializes the API client and logs in
   * @param username The username to log in with
   * @param password The password to log in with
   */
  async initialize(username: string, password: string): Promise<void> {
    if (!this.isInitialized) {
      await this.apiClient.init();
      const loginResponse = await this.apiClient.login(username, password);
      
      if (!loginResponse.success) {
        throw new Error(`Failed to initialize API client: ${loginResponse.message}`);
      }
      
      this.isInitialized = true;
      console.log('✅ API client initialized and logged in successfully');
    }
  }

  /**
   * Sets up a cart with products via API
   * @param products Array of product IDs and quantities to add to cart
   * @returns The cart ID
   */
  async setupCart(products: { id: number, quantity: number }[]): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('API client not initialized. Call initialize() first.');
    }

    const cartItems = products.map(product => ({
      productId: product.id,
      quantity: product.quantity
    }));

    const cartRequest: CartRequest = {
      items: cartItems
    };

    console.log(`Setup cart with ${products.length} products via API`);
    const response = await this.apiClient.addToCart(cartRequest);

    if ('statusCode' in response) {
      throw new Error(`Failed to set up cart: ${response.message}`);
    }

    console.log(`✅ Cart created via API with ID: ${response.cartId}`);
    return response.cartId;
  }

  /**
   * Navigates to the cart page with items already added via API
   * Since the real API doesn't work, this method will add items to the cart via UI
   * @param page The Playwright page
   */
  async navigateToCart(page: Page): Promise<void> {
    console.log('Adding items to cart via UI since API is mocked');
    
    // First navigate to inventory page
    await page.goto('/inventory.html');
    
    // Add Sauce Labs Backpack
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Add Sauce Labs Bolt T-Shirt
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    
    // Navigate to cart
    console.log('Navigate to cart with UI-prepared items');
    await page.goto('/cart.html');
  }

  /**
   * Gets all products from the API
   * @returns Array of products
   */
  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) {
      throw new Error('API client not initialized. Call initialize() first.');
    }

    console.log('Get products via API');
    const response = await this.apiClient.getProducts();

    if ('statusCode' in response) {
      throw new Error(`Failed to get products: ${response.message}`);
    }

    return response.products;
  }

  /**
   * Cleans up resources
   */
  async dispose(): Promise<void> {
    if (this.isInitialized) {
      await this.apiClient.dispose();
      this.isInitialized = false;
      console.log('✅ API client disposed');
    }
  }
}
