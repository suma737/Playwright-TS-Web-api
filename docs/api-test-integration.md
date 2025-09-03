# API Test Integration Guide

This guide explains how to use the API test utilities to set up test data for UI tests in the Playwright web automation framework.

## Overview

The API test utilities allow you to:
- Set up test data via API calls before running UI tests
- Improve test reliability by bypassing UI steps for data setup
- Speed up test execution by reducing UI interaction steps
- Create more focused tests that only test what's necessary

## Components

### 1. API Models

Located in `/apps/sauce-demo/api/models/ApiModels.ts`, these TypeScript interfaces define the structure of API requests and responses.

Key models include:
- `LoginRequest` and `LoginResponse` for authentication
- `Product` and `ProductsResponse` for product data
- `CartRequest` and `CartResponse` for cart operations
- `OrderRequest` and `OrderResponse` for checkout operations

### 2. SauceApiClient

Located in `/apps/sauce-demo/api/SauceApiClient.ts`, this class provides methods to interact with the Sauce Demo API:

```typescript
const apiClient = new SauceApiClient('https://www.saucedemo.com');
await apiClient.init();
await apiClient.login('username', 'password');
const products = await apiClient.getProducts();
const cartResponse = await apiClient.addToCart({ items: [...] });
```

### 3. ApiTestHelper

Located in `/apps/sauce-demo/api/ApiTestHelper.ts`, this helper class simplifies API usage in UI tests:

```typescript
const apiHelper = new ApiTestHelper('https://www.saucedemo.com');
await apiHelper.initialize('username', 'password');
const cartId = await apiHelper.setupCart([{ id: 1, quantity: 1 }]);
await apiHelper.navigateToCart(page);
await apiHelper.dispose();
```

## Usage Examples

### Example 1: Setting up cart data via API before UI test

```typescript
test('@api-ui Checkout with pre-populated cart', async ({ page }) => {
  // 1. Setup cart via API
  const products = [
    { id: productData.products[0].id, quantity: 1 },
    { id: productData.products[1].id, quantity: 2 }
  ];
  
  const cartId = await apiHelper.setupCart(products);
  
  // 2. Login via UI
  const loginPage = new SauceLoginPage(page);
  await loginPage.goto();
  await loginPage.login(username, password);
  
  // 3. Navigate directly to cart (items already added via API)
  await apiHelper.navigateToCart(page);
  
  // 4. Continue with checkout process in UI
  // ...
});
```

### Example 2: Pure API tests

```typescript
test('@api Login with valid credentials', async () => {
  const response = await apiClient.login(username, password);
  expect(response.success).toBeTruthy();
});
```

## Best Practices

1. **Use API for setup, UI for verification**: Use API calls to set up test data and UI interactions to verify the expected behavior.

2. **Clean up after tests**: Always dispose of API resources after tests to avoid leaving test data behind.

3. **Handle API errors gracefully**: Check for API errors and fail tests appropriately if API setup fails.

4. **Use proper error handling with API calls**: Wrap API calls with try-catch blocks for better error reporting.

5. **Keep API models up to date**: Ensure API models match the actual API structure to avoid runtime errors.

## Troubleshooting

- **API authentication issues**: Verify credentials and check that the API base URL is correct.
- **API response errors**: Check the API response for error messages and status codes.
- **Missing data in UI**: Verify that the API call succeeded and that the UI is navigating to the correct page.

## References

- [Playwright API Testing Documentation](https://playwright.dev/docs/api-testing)
- [Playwright Error Handling](https://playwright.dev/docs/test-assertions)
