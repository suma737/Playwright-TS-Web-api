import { test, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/SauceLoginPage';
import { SauceInventoryPage } from '../../pages/SauceInventoryPage';
import { SauceCartPage } from '../../pages/SauceCartPage';
import { SauceCheckoutPage } from '../../pages/SauceCheckoutPage';
import { AccessibilityUtils } from '../../../../core-framework/utils/AccessibilityUtils';
import { DataUtils } from '../../../../core-framework/utils/DataUtils';
import CONFIG from '../../../../core-framework/config/config';

// Load test data
const userData = DataUtils.loadTestData('sauce-demo', 'users', CONFIG.env);

test.describe('Sauce Demo Accessibility Tests', () => {
  let accessibilityUtils: AccessibilityUtils;
  
  test.beforeEach(async ({ page }) => {
    // Initialize accessibility utils
    accessibilityUtils = new AccessibilityUtils(page);
  });
  
  test('Login page accessibility', async ({ page }) => {
    // Navigate to login page
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    
    // Run accessibility scan
    const results = await accessibilityUtils.scanForViolations();
    
    // Save results to file
    await accessibilityUtils.saveResults(results, 'login-page-accessibility');
    
    // Generate HTML report
    const reportPath = await accessibilityUtils.generateReport('login-page-accessibility');
    
    // Check for critical violations
    const criticalViolations = results.filter(violation => violation.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
    
    // Log all violations for review
    console.log(`Login page has ${results.length} accessibility violations`);
    results.forEach(violation => {
      console.log(`- ${violation.id}: ${violation.description} (impact: ${violation.impact})`);
    });
  });
  
  test('Inventory page accessibility', async ({ page }) => {
    // Login and navigate to inventory
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    await loginPage.login(userData.standardUser.username, userData.standardUser.password);
    
    // Wait for inventory page to load
    const inventoryPage = new SauceInventoryPage(page);
    await inventoryPage.waitForNavigation();
    
    // Run accessibility scan
    const results = await accessibilityUtils.scanForViolations();
    
    // Save results to file
    await accessibilityUtils.saveResults(results, 'inventory-page-accessibility');
    
    // Generate HTML report
    const reportPath = await accessibilityUtils.generateReport('inventory-page-accessibility');
    
    // Check for critical and serious violations
    const criticalViolations = results.filter(violation => violation.impact === 'critical');
    const seriousViolations = results.filter(violation => violation.impact === 'serious');
    
    expect(criticalViolations.length).toBe(0);
    
    // Log all violations for review
    console.log(`Inventory page has ${results.length} accessibility violations`);
    console.log(`- Critical: ${criticalViolations.length}`);
    console.log(`- Serious: ${seriousViolations.length}`);
    
    results.forEach(violation => {
      console.log(`- ${violation.id}: ${violation.description} (impact: ${violation.impact})`);
    });
  });
  
  test('Cart page accessibility', async ({ page }) => {
    // Login and add item to cart
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    await loginPage.login(userData.standardUser.username, userData.standardUser.password);
    
    const inventoryPage = new SauceInventoryPage(page);
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    
    // Wait for cart page to load
    const cartPage = new SauceCartPage(page);
    await cartPage.waitForNavigation();
    
    // Run accessibility scan
    const results = await accessibilityUtils.scanForViolations();
    
    // Save results to file
    await accessibilityUtils.saveResults(results, 'cart-page-accessibility');
    
    // Generate HTML report
    const reportPath = await accessibilityUtils.generateReport('cart-page-accessibility');
    
    // Check for critical violations
    const criticalViolations = results.filter(violation => violation.impact === 'critical');
    expect(criticalViolations.length).toBe(0);
    
    // Log all violations for review
    console.log(`Cart page has ${results.length} accessibility violations`);
    results.forEach(violation => {
      console.log(`- ${violation.id}: ${violation.description} (impact: ${violation.impact})`);
    });
  });
  
  test('Checkout pages accessibility', async ({ page }) => {
    // Login and add item to cart
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    await loginPage.login(userData.standardUser.username, userData.standardUser.password);
    
    const inventoryPage = new SauceInventoryPage(page);
    await inventoryPage.addProductToCart('Sauce Labs Backpack');
    await inventoryPage.goToCart();
    
    // Go to checkout
    const cartPage = new SauceCartPage(page);
    await cartPage.checkout();
    
    // Wait for checkout info page to load
    const checkoutPage = new SauceCheckoutPage(page);
    await checkoutPage.waitForElement('[data-test="firstName"]');
    
    // Run accessibility scan on checkout info page
    const infoResults = await accessibilityUtils.scanForViolations();
    await accessibilityUtils.saveResults(infoResults, 'checkout-info-accessibility');
    const infoReportPath = await accessibilityUtils.generateReport('checkout-info-accessibility');
    
    // Fill checkout info and continue
    await checkoutPage.fillCheckoutInfo(
      userData.standardUser.firstName,
      userData.standardUser.lastName,
      userData.standardUser.postalCode
    );
    await checkoutPage.continueToOverview();
    
    // Run accessibility scan on checkout overview page
    const overviewResults = await accessibilityUtils.scanForViolations();
    await accessibilityUtils.saveResults(overviewResults, 'checkout-overview-accessibility');
    const overviewReportPath = await accessibilityUtils.generateReport('checkout-overview-accessibility');
    
    // Complete checkout
    await checkoutPage.finishCheckout();
    
    // Run accessibility scan on checkout complete page
    const completeResults = await accessibilityUtils.scanForViolations();
    await accessibilityUtils.saveResults(completeResults, 'checkout-complete-accessibility');
    const completeReportPath = await accessibilityUtils.generateReport('checkout-complete-accessibility');
    
    // Check for critical violations across all checkout pages
    const criticalViolationsInfo = infoResults.filter(violation => violation.impact === 'critical');
    const criticalViolationsOverview = overviewResults.filter(violation => violation.impact === 'critical');
    const criticalViolationsComplete = completeResults.filter(violation => violation.impact === 'critical');
    
    expect(criticalViolationsInfo.length).toBe(0);
    expect(criticalViolationsOverview.length).toBe(0);
    expect(criticalViolationsComplete.length).toBe(0);
    
    // Log summary of violations
    console.log(`Checkout Info page has ${infoResults.length} accessibility violations`);
    console.log(`Checkout Overview page has ${overviewResults.length} accessibility violations`);
    console.log(`Checkout Complete page has ${completeResults.length} accessibility violations`);
  });
  
  test('Accessibility of interactive elements', async ({ page }) => {
    // Login
    const loginPage = new SauceLoginPage(page);
    await loginPage.goto();
    await loginPage.login(userData.standardUser.username, userData.standardUser.password);
    
    const inventoryPage = new SauceInventoryPage(page);
    
    // Test accessibility of interactive elements
    const addToCartButtons = await page.locator('.btn_inventory');
    const count = await addToCartButtons.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      // Focus on the button
      await addToCartButtons.nth(i).focus();
      
      // Run accessibility scan on focused element
      const results = await accessibilityUtils.scanForViolations();
      
      // Check for keyboard accessibility issues
      const keyboardViolations = results.filter(v => 
        v.id === 'keyboard-accessible' || 
        v.id === 'focus-visible' || 
        v.id === 'interactive-element-keyboard-accessible'
      );
      
      expect(keyboardViolations.length, 'Interactive elements should be keyboard accessible').toBe(0);
    }
    
    // Test dropdown accessibility
    await page.locator('.product_sort_container').focus();
    const dropdownResults = await accessibilityUtils.scanForViolations();
    
    // Check for ARIA and form control accessibility issues
    const ariaViolations = dropdownResults.filter(v => 
      v.id.includes('aria') || 
      v.id.includes('select') || 
      v.id.includes('form')
    );
    
    expect(ariaViolations.length, 'Form controls should have proper ARIA attributes').toBe(0);
  });
});
