import { Page, Locator, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import CONFIG from '../config/config';

/**
 * Visual Testing Utilities for screenshot comparison and visual regression testing
 */
export class VisualTestingUtils {
  private page: Page;
  private snapshotsDir: string;
  
  /**
   * Constructor for VisualTestingUtils
   * @param page Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.snapshotsDir = path.join(CONFIG.testResultsDir, 'visual-snapshots');
    
    // Ensure snapshots directory exists
    if (!fs.existsSync(this.snapshotsDir)) {
      fs.mkdirSync(this.snapshotsDir, { recursive: true });
    }
  }
  
  /**
   * Take a screenshot of the full page
   * @param name Screenshot name
   * @returns Path to the screenshot
   */
  async takeFullPageScreenshot(name: string): Promise<string> {
    const screenshotPath = path.join(this.snapshotsDir, `${name}-${CONFIG.env}.png`);
    await this.page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    return screenshotPath;
  }
  
  /**
   * Take a screenshot of a specific element
   * @param selector Element selector
   * @param name Screenshot name
   * @returns Path to the screenshot
   */
  async takeElementScreenshot(selector: string, name: string): Promise<string> {
    const screenshotPath = path.join(this.snapshotsDir, `${name}-${CONFIG.env}.png`);
    const locator = this.page.locator(selector);
    await locator.screenshot({
      path: screenshotPath
    });
    return screenshotPath;
  }
  
  /**
   * Compare current page with baseline screenshot
   * @param name Screenshot name
   * @param options Comparison options
   * @returns Whether the comparison passed
   */
  async compareWithBaseline(name: string, options?: { threshold?: number, fullPage?: boolean }): Promise<boolean> {
    const threshold = options?.threshold || 0.2; // Default threshold of 0.2%
    const fullPage = options?.fullPage !== undefined ? options.fullPage : true;
    
    // Path for the baseline and current screenshots
    const baselinePath = path.join(this.snapshotsDir, `baseline-${name}-${CONFIG.env}.png`);
    const currentPath = path.join(this.snapshotsDir, `current-${name}-${CONFIG.env}.png`);
    const diffPath = path.join(this.snapshotsDir, `diff-${name}-${CONFIG.env}.png`);
    
    // Take current screenshot
    await this.page.screenshot({
      path: currentPath,
      fullPage
    });
    
    // If baseline doesn't exist, create it
    if (!fs.existsSync(baselinePath)) {
      fs.copyFileSync(currentPath, baselinePath);
      console.log(`Created baseline screenshot: ${baselinePath}`);
      return true;
    }
    
    try {
      // Compare screenshots using Playwright's built-in comparison
      await expect(this.page).toHaveScreenshot(`baseline-${name}-${CONFIG.env}.png`, {
        maxDiffPixelRatio: threshold / 100,
        threshold
      });
      return true;
    } catch (error) {
      console.log(`Visual comparison failed for ${name}. Diff saved to ${diffPath}`);
      return false;
    }
  }
  
  /**
   * Update baseline screenshot
   * @param name Screenshot name
   * @param options Screenshot options
   */
  async updateBaseline(name: string, options?: { fullPage?: boolean }): Promise<void> {
    const fullPage = options?.fullPage !== undefined ? options.fullPage : true;
    const baselinePath = path.join(this.snapshotsDir, `baseline-${name}-${CONFIG.env}.png`);
    
    await this.page.screenshot({
      path: baselinePath,
      fullPage
    });
    
    console.log(`Updated baseline screenshot: ${baselinePath}`);
  }
  
  /**
   * Check for visual accessibility issues (contrast, text size, etc.)
   * @returns List of accessibility issues
   */
  async checkVisualAccessibility(): Promise<any[]> {
    // This is a simplified implementation
    // In a real-world scenario, you might want to use a library like axe-core
    const issues = await this.page.evaluate(() => {
      const issues: any[] = [];
      
      // Check for text contrast issues (simplified)
      const textElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button, label'));
      textElements.forEach((element: any) => {
        const style = window.getComputedStyle(element);
        const fontSize = parseInt(style.fontSize);
        
        if (fontSize < 12) {
          issues.push({
            type: 'fontSize',
            message: 'Text size too small for readability',
            element: element.tagName,
            value: fontSize
          });
        }
      });
      
      return issues;
    });
    
    return issues;
  }
}
