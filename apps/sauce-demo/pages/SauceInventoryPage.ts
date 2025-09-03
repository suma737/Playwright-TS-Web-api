import { Page } from '@playwright/test';
import { BasePage } from '../../../core-framework/pages/BasePage';
import { ErrorCode } from '../../../core-framework/utils/ErrorConstants';

/**
 * Page object for the Sauce Demo inventory page
 */
export class SauceInventoryPage extends BasePage {
  // Selectors
  private readonly productList = '.inventory_list';
  private readonly productItems = '.inventory_item';
  private readonly productTitle = '.inventory_item_name';
  private readonly productPrice = '.inventory_item_price';
  private readonly addToCartButton = (productId: string) => `[data-test="add-to-cart-${productId}"]`;
  private readonly removeButton = (productId: string) => `[data-test="remove-${productId}"]`;
  private readonly shoppingCartBadge = '.shopping_cart_badge';
  private readonly shoppingCartLink = '.shopping_cart_link';
  private readonly sortDropdown = '[data-test="product_sort_container"]';
  private readonly burgerMenu = '#react-burger-menu-btn';
  private readonly logoutLink = '#logout_sidebar_link';

  /**
   * Constructor for SauceInventoryPage
   * @param page Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Check if inventory page is loaded
   * @returns Whether inventory page is loaded
   */
  async isLoaded(): Promise<boolean> {
    return await this.isVisible(this.productList);
  }

  /**
   * Get all product titles
   * @returns Array of product titles
   */
  async getProductTitles(): Promise<string[]> {
    const titles = await this.page.locator(this.productTitle).allInnerTexts();
    return titles;
  }

  /**
   * Get product count
   * @returns Number of products
   */
  async getProductCount(): Promise<number> {
    return await this.page.locator(this.productItems).count();
  }

  /**
   * Add product to cart by name
   * @param productName Product name
   */
  async addProductToCart(productName: string): Promise<void> {
    // Find the product container
    const productLocator = this.page.locator(this.productTitle, { hasText: productName }).first();
    console.log(productLocator);
    const productContainer = this.page
    .locator('.inventory_item')
    .filter({ has: this.page.locator('.inventory_item_name', { hasText: productName }) })
    .first();
  
    const addBtn = productContainer.locator('button[data-test^="add-to-cart-"]');
    await productContainer.waitFor();
    const buttonId = await addBtn.getAttribute('data-test');
    const productId = buttonId?.replace('add-to-cart-', '');
    
    if (productId) {
      await this.click(this.addToCartButton(productId));
    } else {
      throw new Error(`Product not found: ${productName}`);
    }
  }

  /**
   * Get cart count
   * @returns Number of items in cart
   */
  async getCartCount(): Promise<number> {
    try {
      const text = await this.getText(this.shoppingCartBadge);
      return parseInt(text);
    } catch (error) {
      // Badge might not be visible if cart is empty
      return 0;
    }
  }

  /**
   * Go to shopping cart
   */
  async goToCart(): Promise<void> {
    await this.click(this.shoppingCartLink);
  }

  /**
   * Sort products
   * @param sortOption Sort option (az, za, lohi, hilo)
   */
  async sortProducts(sortOption: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    try {
      // First ensure the dropdown is visible and ready
      await this.waitForElement(this.sortDropdown);
      
      // Make sure the dropdown is enabled and interactable
      await this.page.waitForSelector(this.sortDropdown, { state: 'attached' });
      
      // Now select the option
      await this.selectOption(this.sortDropdown, sortOption);
      
      // Wait a moment for the sorting to take effect
      await this.page.waitForTimeout(300);
    } catch (error: any) {
      // Check if the error is a timeout error
      const errorCode = error.message.includes('timeout') ? 
        ErrorCode.ERROR_ELEMENT_TIMEOUT : 
        ErrorCode.ERROR_ELEMENT_WRONG_STATE;
      
      await this.reportError(
        errorCode,
        { action: 'sortProducts', sortOption, error: error.message },
        `sort-products-error-${Date.now()}.png`
      );
      throw error; // Re-throw to allow test to fail
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await this.click(this.burgerMenu);
    await this.page.waitForTimeout(500); // Wait for menu animation
    await this.click(this.logoutLink);
  }
}
