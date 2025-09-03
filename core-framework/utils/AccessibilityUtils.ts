import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import CONFIG from '../config/config';

/**
 * Accessibility violation interface
 */
export interface AccessibilityViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary?: string;
  }>;
}

/**
 * Accessibility Utilities for accessibility testing
 */
export class AccessibilityUtils {
  private page: Page;
  private resultsDir: string;
  
  /**
   * Constructor for AccessibilityUtils
   * @param page Playwright Page object
   */
  constructor(page: Page) {
    this.page = page;
    this.resultsDir = path.join(CONFIG.testResultsDir, 'accessibility');
    
    // Ensure results directory exists
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }
  
  /**
   * Run accessibility scan using axe-core
   * @param options Scan options
   * @returns Accessibility violations
   */
  async scanForViolations(options?: { includedImpacts?: string[] }): Promise<AccessibilityViolation[]> {
    // Inject axe-core into the page
    await this.injectAxe();
    
    // Run the accessibility scan
    const violations = await this.page.evaluate((includedImpacts) => {
      return new Promise((resolve) => {
        // @ts-ignore - axe is injected into the page
        window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
          }
        }, (err: Error | null, results: { violations: any[] }) => {
          if (err) {
            resolve([]);
            return;
          }
          
          let violations = results.violations;
          
          // Filter by impact if specified
          if (includedImpacts && includedImpacts.length > 0) {
            violations = violations.filter((v: any) => includedImpacts.includes(v.impact));
          }
          
          resolve(violations);
        });
      });
    }, options?.includedImpacts);
    
    return violations as AccessibilityViolation[];
  }
  
  /**
   * Inject axe-core into the page
   */
  private async injectAxe(): Promise<void> {
    await this.page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.5.2/axe.min.js'
    });
  }
  
  /**
   * Save accessibility results to file
   * @param violations Accessibility violations
   * @param name Test name
   */
  async saveResults(violations: AccessibilityViolation[], name: string): Promise<void> {
    const filePath = path.join(this.resultsDir, `${name}-${CONFIG.env}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify({
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      violations
    }, null, 2));
  }
  
  /**
   * Check if page has accessibility violations
   * @param options Scan options
   * @returns Whether the page has violations
   */
  async hasViolations(options?: { includedImpacts?: string[] }): Promise<boolean> {
    const violations = await this.scanForViolations(options);
    return violations.length > 0;
  }
  
  /**
   * Generate accessibility report
   * @param name Report name
   */
  async generateReport(name: string): Promise<string> {
    const violations = await this.scanForViolations();
    const reportPath = path.join(this.resultsDir, `${name}-${CONFIG.env}.html`);
    
    // Generate a simple HTML report
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Accessibility Report - ${name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1 { color: #333; }
          .summary { margin-bottom: 20px; }
          .violation { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
          .critical { border-left: 5px solid #d9534f; }
          .serious { border-left: 5px solid #f0ad4e; }
          .moderate { border-left: 5px solid #5bc0de; }
          .minor { border-left: 5px solid #5cb85c; }
          .impact { display: inline-block; padding: 3px 8px; border-radius: 3px; color: white; font-size: 12px; }
          .impact.critical { background-color: #d9534f; }
          .impact.serious { background-color: #f0ad4e; }
          .impact.moderate { background-color: #5bc0de; }
          .impact.minor { background-color: #5cb85c; }
          .nodes { margin-top: 10px; }
          .node { background-color: #f9f9f9; padding: 10px; margin-bottom: 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>Accessibility Report - ${name}</h1>
        <div class="summary">
          <p>URL: ${this.page.url()}</p>
          <p>Date: ${new Date().toLocaleString()}</p>
          <p>Environment: ${CONFIG.env}</p>
          <p>Total violations: ${violations.length}</p>
        </div>
        
        ${violations.length === 0 ? '<p>No accessibility violations found.</p>' : ''}
        
        ${violations.map(violation => `
          <div class="violation ${violation.impact}">
            <h2>${violation.id}</h2>
            <span class="impact ${violation.impact}">${violation.impact}</span>
            <p>${violation.description}</p>
            <p><a href="${violation.helpUrl}" target="_blank">Learn more</a></p>
            
            <div class="nodes">
              <h3>Affected elements (${violation.nodes.length}):</h3>
              ${violation.nodes.map(node => `
                <div class="node">
                  <code>${node.html}</code>
                  <p>${node.failureSummary || ''}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    fs.writeFileSync(reportPath, html);
    
    return reportPath;
  }
}
