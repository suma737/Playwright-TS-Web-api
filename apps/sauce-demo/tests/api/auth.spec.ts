import { test, expect } from '@playwright/test';
import { SauceApiClient } from '../../api/SauceApiClient';

// Import test data
import userData from '../../testdata/users.json';

test.describe('Sauce Demo API Authentication Tests', () => {
  let apiClient: SauceApiClient;

  test.beforeAll(async () => {
    // Initialize API client
    const baseUrl = process.env.API_BASE_URL || 'https://www.saucedemo.com';
    apiClient = new SauceApiClient(baseUrl);
    await apiClient.init();
  });

  test.afterAll(async () => {
    // Clean up resources
    await apiClient.dispose();
  });

  test('@api Login with valid credentials', async () => {
    // Arrange
    const username = userData.standardUser.username;
    const password = userData.standardUser.password;

    // Act
    console.log(`API Login with user ${username}`);
    const response = await apiClient.login(username, password);

    // Assert
    expect(response.success).toBeTruthy();
    expect(response.token).toBeDefined();
    expect(response.userId).toBeDefined();
  });

  test('@api Login with invalid credentials', async () => {
    // Arrange
    const username = 'invalid_user';
    const password = 'invalid_password';

    // Act
    console.log('API Login with invalid credentials');
    const response = await apiClient.login(username, password);

    // Assert
    expect(response.success).toBeFalsy();
    expect(response.message).toContain('Authentication failed');
  });

  test('@api Login with locked out user', async () => {
    // Arrange
    const username = userData.lockedOutUser.username;
    const password = userData.lockedOutUser.password;

    // Act
    console.log(`API Login with locked out user ${username}`);
    const response = await apiClient.login(username, password);

    // Assert
    expect(response.success).toBeFalsy();
    expect(response.message).toContain('locked out');
  });
});
