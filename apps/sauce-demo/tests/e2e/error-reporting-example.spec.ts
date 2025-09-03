import { test, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceInventoryPage } from '../../pages/SauceInventoryPage';
import { ErrorCode } from '../../../../core-framework/utils/ErrorConstants';

test.describe('Error Reporting Examples', () => {

  test('Demonstrate BasePage error reporting with invalid login', async ({ page }) => {
    // Create page objects
    const loginPage = new SauceLoginPage(page);
    
    // Navigate to login page
    await loginPage.navigate();
    
    // Attempt login with invalid credentials - BasePage will handle and report errors
    await loginPage.login('invalid_user', 'invalid_password');
    
    // Verify error message is displayed - using standard Playwright expect
    const errorElement = loginPage.getLocator('[data-test="error"]');
    await expect(errorElement).toBeVisible();
  });

  test('Demonstrate error handling with non-existent elements', async ({ page }) => {
    const loginPage = new SauceLoginPage(page);
    const inventoryPage = new SauceInventoryPage(page);
    
    // Login successfully
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    
    // Try to interact with non-existent element - BasePage will handle the error
    await inventoryPage.click('#non-existent-element');
    
    // Try to check visibility of non-existent element - BasePage will report but not throw
    const isVisible = await inventoryPage.isVisible('#another-non-existent-element');
    
    // Try to get text from non-existent element - BasePage will report but return empty string
    const text = await inventoryPage.getText('#yet-another-non-existent-element');
    
    // Test continues despite errors being handled by the framework
    expect(isVisible).toBe(false);
    expect(text).toBe('');
  });

  test('Demonstrate error handling with navigation and assertions', async ({ page }) => {
    const loginPage = new SauceLoginPage(page);
    const inventoryPage = new SauceInventoryPage(page);
    
    // Login successfully
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    
    // Navigate to a non-existent domain - framework will handle the error
    await inventoryPage.navigate('https://non-existent-domain.example');
    
    // Assertion that will fail - BasePage will handle the error
    await inventoryPage.expectTitle('Wrong Page Title');
    
    // Continue test execution despite errors
    await inventoryPage.expectToBeVisible('.inventory_list');
  });

  test('Generate AI maintenance report after test run', async ({ page }) => {
    // This test demonstrates how to generate an AI maintenance report
    // at the end of a test run using the framework's built-in reporting
    const loginPage = new SauceLoginPage(page);
    const inventoryPage = new SauceInventoryPage(page);
    
    // First cause some errors that will be automatically reported
    await loginPage.navigate();
    
    // Invalid login - will be reported by framework
    await loginPage.login('locked_out_user', 'secret_sauce');
    
    // Try to access inventory page (will fail due to being locked out)
    await inventoryPage.navigate();
    
    // Try to interact with elements that don't exist
    await inventoryPage.click('#non-existent-button');
    await inventoryPage.fill('#non-existent-input', 'test');
    
    // Import the ErrorReportingUtils directly for this specific use case
    const { ErrorReportingUtils } = await import('../../../../core-framework/utils/ErrorReportingUtils');
    const errorReporting = new ErrorReportingUtils(page);
    
    // Generate AI maintenance report
    const report = await errorReporting.generateAIMaintenanceReport();
    
    // Verify report contains error statistics
    expect(report).toContain('Error Statistics');
    expect(report).toContain('Top Failure Categories');
  });
});
