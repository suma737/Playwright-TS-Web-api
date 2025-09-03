import { Page } from '@playwright/test';
import { BasePage } from '../../../core-framework/pages/BasePage';

/**
 * Page object for the Sauce Demo checkout pages
 */
export class SauceCheckoutPage extends BasePage {
  // Selectors for checkout information page
  private readonly firstNameInput = '[data-test="firstName"]';
  private readonly lastNameInput = '[data-test="lastName"]';
  private readonly postalCodeInput = '[data-test="postalCode"]';
  private readonly continueButton = '[data-test="continue"]';
  private readonly cancelButton = '[data-test="cancel"]';
  private readonly errorMessage = '[data-test="error"]';
  
  // Selectors for checkout overview page
  private readonly checkoutSummary = '.checkout_summary_container';
  private readonly inventoryItems = '.cart_item';
  private readonly itemName = '.inventory_item_name';
  private readonly itemPrice = '.inventory_item_price';
  private readonly subtotalLabel = '.summary_subtotal_label';
  private readonly taxLabel = '.summary_tax_label';
  private readonly totalLabel = '.summary_total_label';
  private readonly finishButton = '[data-test="finish"]';
  
  // Selectors for checkout complete page
  private readonly completeHeader = '.complete-header';
  private readonly completeText = '.complete-text';
  private readonly backHomeButton = '[data-test="back-to-products"]';

  /**
   * Constructor for SauceCheckoutPage
   * @param page Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Check if checkout information page is loaded
   * @returns Whether checkout information page is loaded
   */
  async isCheckoutInfoPageLoaded(): Promise<boolean> {
    return await this.isVisible(this.firstNameInput);
  }

  /**
   * Fill checkout information
   * @param firstName First name
   * @param lastName Last name
   * @param postalCode Postal code
   */
  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
    await this.fill(this.postalCodeInput, postalCode);
  }

  /**
   * Continue to checkout overview
   */
  async continueToOverview(): Promise<void> {
    await this.click(this.continueButton);
  }

  /**
   * Cancel checkout
   */
  async cancelCheckout(): Promise<void> {
    await this.click(this.cancelButton);
  }

  /**
   * Get error message text
   * @returns Error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if checkout overview page is loaded
   * @returns Whether checkout overview page is loaded
   */
  async isOverviewPageLoaded(): Promise<boolean> {
    return await this.isVisible(this.checkoutSummary);
  }

  /**
   * Get all item names in checkout
   * @returns Array of item names
   */
  async getItemNames(): Promise<string[]> {
    const names = await this.page.locator(this.itemName).allInnerTexts();
    return names;
  }

  /**
   * Get subtotal amount
   * @returns Subtotal amount
   */
  async getSubtotal(): Promise<number> {
    const subtotalText = await this.getText(this.subtotalLabel);
    const match = subtotalText.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get tax amount
   * @returns Tax amount
   */
  async getTax(): Promise<number> {
    const taxText = await this.getText(this.taxLabel);
    const match = taxText.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get total amount
   * @returns Total amount
   */
  async getTotal(): Promise<number> {
    const totalText = await this.getText(this.totalLabel);
    const match = totalText.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Complete checkout
   */
  async finishCheckout(): Promise<void> {
    await this.click(this.finishButton);
  }

  /**
   * Check if checkout complete page is loaded
   * @returns Whether checkout complete page is loaded
   */
  async isCompletePageLoaded(): Promise<boolean> {
    return await this.isVisible(this.completeHeader);
  }

  /**
   * Get complete header text
   * @returns Complete header text
   */
  async getCompleteHeaderText(): Promise<string> {
    return await this.getText(this.completeHeader);
  }

  /**
   * Get complete text
   * @returns Complete text
   */
  async getCompleteText(): Promise<string> {
    return await this.getText(this.completeText);
  }

  /**
   * Return to products page
   */
  async backToProducts(): Promise<void> {
    await this.click(this.backHomeButton);
  }
}
