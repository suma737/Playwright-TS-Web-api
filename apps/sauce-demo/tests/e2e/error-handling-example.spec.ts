import { test, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceInventoryPage } from '../../pages/SauceInventoryPage';
import { DataUtils } from '../../../../core-framework/utils/DataUtils';
import CONFIG from '../../../../core-framework/config/config';
import { ErrorReportingUtils } from '../../../../core-framework/utils/ErrorReportingUtils';
import { ErrorCode } from '../../../../core-framework/utils/ErrorConstants';

// Load test data
const userData = DataUtils.loadTestData('sauce-demo', 'users', CONFIG.env);

test.describe('@error-handling Error Handling Examples', () => {
  let errorReporting: ErrorReportingUtils;
  
  test.beforeEach(async ({ page }) => {
    // Initialize error reporting utils
    errorReporting = new ErrorReportingUtils(page);
  });
  
  test('@smoke Error handling with locator not found', async ({ page }) => {
    // Arrange
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    
    try {
      // Try to find a non-existent element
      const nonExistentElement = page.locator('#non-existent-element');
      await expect(nonExistentElement).toBeVisible({ timeout: 5000 });
    } catch (error) {
      // Report the error with the standardized error code
      await errorReporting.reportError(
        ErrorCode.ERROR_LOCATOR_NOT_FOUND, 
        { 
          selector: '#non-existent-element',
          page: 'Login Page',
          action: 'visibility check'
        }
      );
      
      // Continue the test with a valid path
      await loginPage.login(userData.standardUser.username, userData.standardUser.password);
      const inventoryPage = new SauceInventoryPage(page);
      await expect(await inventoryPage.isLoaded()).toBeTruthy();
    }
  });
  
  test('@regression Error handling with invalid data', async ({ page }) => {
    // Arrange
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    
    try {
      // Try to login with invalid credentials
      await loginPage.login('invalid_user', 'invalid_password');
      
      // Check if error message is displayed
      const errorMessage = page.locator('[data-test="error"]');
      await expect(errorMessage).toBeVisible();
      
      // If we're here, the error message was displayed as expected
      // Now let's report this as a successful test case but log the error message
      const errorText = await errorMessage.textContent();
      console.log(`Expected error message displayed: ${errorText}`);
    } catch (error: any) {
      // If we get here, something unexpected happened
      await errorReporting.handleError(
        ErrorCode.ERROR_AUTH_FAILED,
        {
          username: 'invalid_user',
          expectedErrorMessage: 'Epic sadface: Username and password do not match any user in this service',
          actualError: error.message
        }
      );
    }
  });
  
  test('@visual Error handling with visual comparison', async ({ page }) => {
    // Arrange
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    
    try {
      // Take a screenshot and compare with a non-existent baseline
      await page.screenshot({ path: 'temp-screenshot.png' });
      
      // Simulate a visual comparison failure
      throw new Error('Visual comparison failed');
    } catch (error) {
      // Report the error with the standardized error code
      const errorDetails = await errorReporting.reportError(
        ErrorCode.ERROR_VISUAL_MISMATCH,
        {
          element: 'Login Page',
          diffPercentage: '5.2%',
          allowedThreshold: '1%'
        }
      );
      
      // Log the error details for AI maintenance
      console.log(`Error reported with ID: ${errorDetails.code}`);
      console.log(`Category: ${errorDetails.category}`);
      console.log(`Screenshot captured: ${errorDetails.screenshot}`);
    }
  });
  
  test('@performance Error handling with performance thresholds', async ({ page }) => {
    // Arrange
    const loginPage = new SauceLoginPage(page);
    const startTime = Date.now();
    
    await loginPage.goto();
    const loadTime = Date.now() - startTime;
    
    // Check if page load time exceeds threshold
    const threshold = 1000; // 1 second
    if (loadTime > threshold) {
      await errorReporting.reportError(
        ErrorCode.ERROR_PERFORMANCE_THRESHOLD,
        {
          operation: 'Page Load',
          actualTime: `${loadTime}ms`,
          threshold: `${threshold}ms`,
          page: 'Login Page'
        },
        'performance-login-page.png'
      );
      
      // We can still continue with the test
      test.info().annotations.push({
        type: 'warning',
        description: `Page load time (${loadTime}ms) exceeded threshold (${threshold}ms)`
      });
    }
    
    // Continue with the test
    await loginPage.login(userData.standardUser.username, userData.standardUser.password);
    const inventoryPage = new SauceInventoryPage(page);
    await expect(await inventoryPage.isLoaded()).toBeTruthy();
  });
  
  test('@regression Generating AI maintenance report', async ({ page }) => {
    // This test demonstrates how to generate an AI maintenance report
    // that can be used to analyze error patterns
    
    // First, simulate a few errors
    await errorReporting.reportError(
      ErrorCode.ERROR_ELEMENT_NOT_CLICKABLE,
      { selector: '.some-button', reason: 'Element is covered by another element' }
    );
    
    await errorReporting.reportError(
      ErrorCode.ERROR_NAVIGATION_FAILED,
      { from: 'Inventory Page', to: 'Cart Page', reason: 'Timeout' }
    );
    
    // Generate the AI maintenance report
    const report = await errorReporting.generateAIMaintenanceReport();
    
    // Log the report
    console.log('AI Maintenance Report:');
    console.log(`Total errors: ${report.totalErrors}`);
    console.log(`Most frequent error category: ${report.mostFrequentCategory}`);
    console.log(`Top errors: ${JSON.stringify(report.topErrors.length)} errors found`);
    
    // This report can be used by the AI test maintainer to automatically fix issues
  });
});
