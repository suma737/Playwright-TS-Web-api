import { Page } from '@playwright/test';
import { BasePage } from '../../../core-framework/pages/BasePage';

/**
 * Page object for the Sauce Demo cart page
 */
export class SauceCartPage extends BasePage {
  // Selectors
  private readonly cartList = '.cart_list';
  private readonly cartItems = '.cart_item';
  private readonly itemName = '.inventory_item_name';
  private readonly itemPrice = '.inventory_item_price';
  private readonly removeButton = (itemId: string) => `[data-test="remove-${itemId}"]`;
  private readonly checkoutButton = '[data-test="checkout"]';
  private readonly continueShoppingButton = '[data-test="continue-shopping"]';

  /**
   * Constructor for SauceCartPage
   * @param page Playwright Page object
   */
  constructor(page: Page) {
    super(page);
  }

  /**
   * Check if cart page is loaded
   * @returns Whether cart page is loaded
   */
  async isLoaded(): Promise<boolean> {
    return await this.isVisible(this.cartList);
  }

  /**
   * Get all item names in cart
   * @returns Array of item names
   */
  async getItemNames(): Promise<string[]> {
    const names = await this.page.locator(this.itemName).allInnerTexts();
    return names;
  }

  /**
   * Get item count in cart
   * @returns Number of items in cart
   */
  async getItemCount(): Promise<number> {
    return await this.page.locator(this.cartItems).count();
  }

  /**
   * Remove item from cart by name
   * @param itemName Item name
   */
  async removeItem(itemName: string): Promise<void> {
    // Find the item container
    const itemLocator = this.page.locator(this.itemName, { hasText: itemName }).first();
    const itemContainer = itemLocator.locator('..').locator('..');
    
    // Find the remove button and click it
    const removeButtonLocator = itemContainer.locator('button', { hasText: 'Remove' });
    await removeButtonLocator.click();
  }

  /**
   * Get total price of items in cart
   * @returns Total price
   */
  async getTotalPrice(): Promise<number> {
    const priceTexts = await this.page.locator(this.itemPrice).allInnerTexts();
    let total = 0;
    
    for (const priceText of priceTexts) {
      const price = parseFloat(priceText.replace('$', ''));
      total += price;
    }
    
    return parseFloat(total.toFixed(2));
  }

  /**
   * Proceed to checkout
   */
  async checkout(): Promise<void> {
    await this.click(this.checkoutButton);
  }

  /**
   * Continue shopping
   */
  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }

  /**
   * Get all cart items
   * @returns Array of cart items with name, price, and quantity
   */
  async getCartItems(): Promise<Array<{name: string, price: number, quantity: number}>> {
    const items = [];
    const cartItemElements = await this.page.locator(this.cartItems).all();
    
    for (const itemElement of cartItemElements) {
      const name = await itemElement.locator(this.itemName).innerText();
      const priceText = await itemElement.locator(this.itemPrice).innerText();
      const price = parseFloat(priceText.replace('$', ''));
      const quantity = 1; // Default quantity, can be enhanced if quantity selector is available
      
      items.push({ name, price, quantity });
    }
    
    return items;
  }
}
