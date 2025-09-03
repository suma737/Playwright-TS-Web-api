import { Page, Locator, expect } from '@playwright/test';
import CONFIG from '../config/config';
import { ErrorReportingUtils } from '../utils/ErrorReportingUtils';
import { ErrorCode } from '../utils/ErrorConstants';

/**
 * Base Page Object that provides common functionality for all page objects
 * All application-specific page objects should extend this class
 */
export class BasePage {
  readonly page: Page;
  readonly baseUrl: string;
  protected errorReporting: ErrorReportingUtils;

  /**
   * Constructor for the BasePage
   * @param page Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.baseUrl = CONFIG.baseUrl;
    this.errorReporting = new ErrorReportingUtils(page);
  }

  /**
   * Navigate to a specific path relative to the base URL
   * @param path Path to navigate to
   */
  async navigate(path: string = '/'): Promise<void> {
    try {
      const url = new URL(path, this.baseUrl).toString();
      await this.page.goto(url);
    } catch (error: any) {
      await this.errorReporting.handleError(
        ErrorCode.ERROR_NAVIGATION_FAILED,
        { path, baseUrl: this.baseUrl, error: error.message }
      );
    }
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get a locator for an element
   * @param selector CSS or XPath selector
   */
  getLocator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Click on an element
   * @param selector CSS or XPath selector
   */
  async click(selector: string): Promise<void> {
    try {
      await this.getLocator(selector).click();
    } catch (error: any) {
      await this.errorReporting.handleError(
        ErrorCode.ERROR_ELEMENT_NOT_CLICKABLE,
        { selector, error: error.message, action: 'click' }
      );
    }
  }

  /**
   * Fill a form field
   * @param selector CSS or XPath selector
   * @param value Value to fill
   */
  async fill(selector: string, value: string): Promise<void> {
    try {
      await this.getLocator(selector).fill(value);
    } catch (error: any) {
      await this.errorReporting.handleError(
        ErrorCode.ERROR_ELEMENT_NOT_VISIBLE,
        { selector, value, error: error.message, action: 'fill' }
      );
    }
  }

  /**
   * Check if an element is visible
   * @param selector CSS or XPath selector
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      return await this.getLocator(selector).isVisible();
    } catch (error: any) {
      await this.errorReporting.reportError(
        ErrorCode.ERROR_LOCATOR_NOT_FOUND,
        { selector, error: error.message, action: 'isVisible' },
        `element-not-found-${Date.now()}.png`
      );
      return false;
    }
  }

  /**
   * Wait for an element to be visible
   * @param selector CSS or XPath selector
   * @param timeout Timeout in milliseconds
   */
  async waitForElement(selector: string, timeout?: number): Promise<void> {
    try {
      await this.getLocator(selector).waitFor({ state: 'visible', timeout });
    } catch (error: any) {
      await this.errorReporting.handleError(
        ErrorCode.ERROR_ELEMENT_NOT_VISIBLE,
        { selector, timeout, error: error.message, action: 'waitForElement' }
      );
    }
  }

  /**
   * Get text from an element
   * @param selector CSS or XPath selector
   */
  async getText(selector: string): Promise<string> {
    try {
      return await this.getLocator(selector).innerText();
    } catch (error: any) {
      await this.errorReporting.reportError(
        ErrorCode.ERROR_LOCATOR_NOT_FOUND,
        { selector, error: error.message, action: 'getText' }
      );
      return '';
    }
  }

  /**
   * Take a screenshot
   * @param name Screenshot name
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `${CONFIG.testResultsDir}/screenshots/${name}.png` });
  }

  /**
   * Assert that element contains text
   * @param selector CSS or XPath selector
   * @param text Text to check for
   */
  async expectTextToContain(selector: string, text: string): Promise<void> {
    try {
      await expect(this.getLocator(selector)).toContainText(text);
    } catch (error: any) {
      await this.errorReporting.handleError(
        ErrorCode.ERROR_ASSERTION_TEXT,
        { selector, expectedText: text, error: error.message, action: 'expectTextToContain' }
      );
    }
  }

  /**
   * Assert that element is visible
   * @param selector CSS or XPath selector
   */
  async expectToBeVisible(selector: string): Promise<void> {
    try {
      await expect(this.getLocator(selector)).toBeVisible();
    } catch (error: any) {
      await this.errorReporting.handleError(
        ErrorCode.ERROR_ASSERTION_VISIBILITY,
        { selector, error: error.message, action: 'expectToBeVisible' }
      );
    }
  }

  /**
   * Assert that page has a specific URL
   * @param urlPattern URL pattern to match
   */
  async expectUrl(urlPattern: string | RegExp): Promise<void> {
    try {
      await expect(this.page).toHaveURL(urlPattern);
    } catch (error: any) {
      const currentUrl = this.page.url();
      await this.errorReporting.handleError(
        ErrorCode.ERROR_URL_MISMATCH,
        { expectedUrl: urlPattern.toString(), actualUrl: currentUrl, error: error.message }
      );
    }
  }

  /**
   * Assert that page has a specific title
   * @param title Title to match
   */
  async expectTitle(title: string | RegExp): Promise<void> {
    try {
      await expect(this.page).toHaveTitle(title);
    } catch (error: any) {
      const currentTitle = await this.page.title();
      await this.errorReporting.handleError(
        ErrorCode.ERROR_ASSERTION_PROPERTY,
        { expectedTitle: title.toString(), actualTitle: currentTitle, error: error.message }
      );
    }
  }

  /**
   * Report an error with the current page context
   * @param errorCode Error code from ErrorConstants
   * @param details Additional error details
   * @param screenshotName Optional name for the screenshot
   */
  async reportError(errorCode: any, details?: any, screenshotName?: string): Promise<void> {
    await this.errorReporting.reportError(errorCode, details, screenshotName);
  }
  
  /**
   * Handle an error by reporting it and optionally throwing
   * @param errorCode Error code from ErrorConstants
   * @param details Additional error details
   * @param throwError Whether to throw the error after reporting
   */
  async handleError(errorCode: any, details?: any, throwError: boolean = true): Promise<void> {
    await this.errorReporting.handleError(errorCode, details, throwError);
  }

  /**
   * Select an option from a dropdown
   * @param selector CSS or XPath selector
   * @param value Value to select
   */
  async selectOption(selector: string, value: string): Promise<void> {
    try {
      await this.getLocator(selector).selectOption(value);
    } catch (error: any) {
      // Check if the error is a timeout error
      const errorCode = error.message.includes('timeout') ? 
        ErrorCode.ERROR_ELEMENT_TIMEOUT : 
        ErrorCode.ERROR_ELEMENT_WRONG_STATE;
      
      await this.errorReporting.handleError(
        errorCode,
        { selector, value, error: error.message, action: 'selectOption' }
      );
    }
  }
}
