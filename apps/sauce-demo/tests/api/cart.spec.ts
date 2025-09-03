import { test, expect } from '@playwright/test';
import { SauceApiClient } from '../../api/SauceApiClient';
import { CartRequest, ProductsResponse, ApiError } from '../../api/models/ApiModels';

// Import test data
import userData from '../../testdata/users.json';
import productData from '../../testdata/products.json';

test.describe('Sauce Demo API Cart Operations Tests', () => {
  let apiClient: SauceApiClient;

  test.beforeAll(async () => {
    // Initialize API client
    const baseUrl = process.env.API_BASE_URL || 'https://www.saucedemo.com';
    apiClient = new SauceApiClient(baseUrl);
    await apiClient.init();
    
    // Login before tests
    await apiClient.login(userData.standardUser.username, userData.standardUser.password);
  });

  test.afterAll(async () => {
    // Clean up resources
    await apiClient.dispose();
  });

  test('@api Add single product to cart', async () => {
    // Arrange
    const product = productData.products[0];
    const cartRequest: CartRequest = {
      items: [
        {
          productId: product.id,
          quantity: 1
        }
      ]
    };

    // Act
    console.log(`API Add product "${product.name}" to cart`);
    const response = await apiClient.addToCart(cartRequest);

    // Assert
    if ('statusCode' in response) {
      // This is an ApiError
      expect.fail(`Failed to add product to cart: ${response.message}`);
    } else {
      expect(response.items).toHaveLength(1);
      expect(response.items[0].productId).toBe(product.id);
      expect(response.items[0].quantity).toBe(1);
      expect(response.cartId).toBeDefined();
    }
  });

  test('@api Add multiple products to cart', async () => {
    // Arrange
    const product1 = productData.products[0];
    const product2 = productData.products[1];
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

    // Act
    console.log('API Add multiple products to cart');
    const response = await apiClient.addToCart(cartRequest);

    // Assert
    if ('statusCode' in response) {
      // This is an ApiError
      expect.fail(`Failed to add products to cart: ${response.message}`);
    } else {
      expect(response.items).toHaveLength(2);
      expect(response.items.some(item => item.productId === product1.id)).toBeTruthy();
      expect(response.items.some(item => item.productId === product2.id)).toBeTruthy();
      expect(response.cartId).toBeDefined();
    }
  });

  test('@api Get products and add to cart', async () => {
    // Act - Get products
    console.log('API Get products');
    const productsResponse = await apiClient.getProducts();

    // Assert products response
    if ('statusCode' in productsResponse) {
      // This is an ApiError
      expect.fail(`Failed to get products: ${productsResponse.message}`);
    } else {
      expect(productsResponse.products.length).toBeGreaterThan(0);
      
      // Add first product to cart
      const product = productsResponse.products[0];
      const cartRequest: CartRequest = {
        items: [
          {
            productId: product.id,
            quantity: 1
          }
        ]
      };

      // Act - Add to cart
      console.log(`API Add product "${product.name}" to cart`);
      const cartResponse = await apiClient.addToCart(cartRequest);

      // Assert cart response
      if ('statusCode' in cartResponse) {
        // This is an ApiError
        expect.fail(`Failed to add product to cart: ${cartResponse.message}`);
      } else {
        expect(cartResponse.items).toHaveLength(1);
        expect(cartResponse.items[0].productId).toBe(product.id);
        expect(cartResponse.cartId).toBeDefined();
      }
    }
  });
});
