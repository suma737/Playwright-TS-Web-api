import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { ErrorCategory, ErrorCode, ErrorDetails } from './ErrorConstants';
import CONFIG from '../config/config';

/**
 * Error Reporting Utility for Test Automation Framework
 * 
 * This class provides methods for reporting and tracking errors that occur during test execution.
 * It categorizes errors using standardized error codes, captures screenshots, and logs details
 * to facilitate AI-powered test maintenance and analysis.
 */
export class ErrorReportingUtils {
  private page: Page;
  private errorLogPath: string;
  private screenshotPath: string;
  
  /**
   * Constructor for ErrorReportingUtils
   * @param page Playwright page object
   */
  constructor(page: Page) {
    this.page = page;
    this.errorLogPath = path.join(CONFIG.testResultsDir, 'error-logs');
    this.screenshotPath = path.join(CONFIG.testResultsDir, 'error-screenshots');
    
    // Ensure directories exist
    this.ensureDirectoryExists(this.errorLogPath);
    this.ensureDirectoryExists(this.screenshotPath);
  }
  
  /**
   * Report an error with standardized error code
   * @param errorCode Predefined error code from ErrorConstants
   * @param additionalDetails Additional error details or context
   * @param screenshotName Optional custom name for the screenshot
   * @returns Promise resolving to the error details object
   */
  async reportError(
    errorCode: typeof ErrorCode[keyof typeof ErrorCode],
    additionalDetails?: any,
    screenshotName?: string
  ): Promise<ErrorDetails> {
    const timestamp = new Date().toISOString();
    const location = await this.getCurrentPageInfo();
    const screenshotFileName = screenshotName || 
      `${errorCode.category}_${errorCode.code}_${timestamp.replace(/[:.]/g, '-')}.png`;
    const screenshotPath = path.join(this.screenshotPath, screenshotFileName);
    
    // Take screenshot if page is available
    let screenshotRelativePath: string | undefined;
    try {
      if (this.page) {
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        screenshotRelativePath = path.relative(CONFIG.testResultsDir, screenshotPath);
      }
    } catch (e) {
      console.error('Failed to capture error screenshot:', e);
    }
    
    // Create error details object
    const errorDetails: ErrorDetails = {
      code: errorCode.code,
      category: errorCode.category,
      message: errorCode.message,
      title: errorCode.title,
      details: additionalDetails,
      location,
      screenshot: screenshotRelativePath,
      timestamp
    };
    
    // Log error to console
    console.error(`[ERROR ${errorCode.code}] ${errorCode.title} (${errorCode.category}): ${errorCode.message}`, 
      additionalDetails ? `\nDetails: ${JSON.stringify(additionalDetails)}` : '');
    
    // Write error to log file
    await this.logErrorToFile(errorDetails);
    
    return errorDetails;
  }
  
  /**
   * Create a custom error with a specific error code
   * @param errorCode Predefined error code from ErrorConstants
   * @param additionalMessage Additional error message
   * @returns Error object with enhanced properties
   */
  createError(
    errorCode: typeof ErrorCode[keyof typeof ErrorCode],
    additionalMessage?: string
  ): Error {
    const message = additionalMessage 
      ? `[ERROR ${errorCode.code}] ${errorCode.title}: ${errorCode.message}: ${additionalMessage}`
      : `[ERROR ${errorCode.code}] ${errorCode.title}: ${errorCode.message}`;
    
    const error = new Error(message);
    (error as any).code = errorCode.code;
    (error as any).category = errorCode.category;
    (error as any).title = errorCode.title;
    
    return error;
  }
  
  /**
   * Handle an error by reporting it and optionally throwing
   * @param errorCode Predefined error code from ErrorConstants
   * @param additionalDetails Additional error details or context
   * @param throwError Whether to throw the error after reporting
   * @returns Promise resolving to the error details object
   */
  async handleError(
    errorCode: typeof ErrorCode[keyof typeof ErrorCode],
    additionalDetails?: any,
    throwError: boolean = true
  ): Promise<ErrorDetails> {
    const errorDetails = await this.reportError(errorCode, additionalDetails);
    
    if (throwError) {
      throw this.createError(errorCode, additionalDetails?.message || JSON.stringify(additionalDetails));
    }
    
    return errorDetails;
  }
  
  /**
   * Get error statistics by category
   * @returns Object with error counts by category
   */
  async getErrorStatistics(): Promise<Record<ErrorCategory, number>> {
    const stats: Record<ErrorCategory, number> = {} as Record<ErrorCategory, number>;
    
    // Initialize stats with 0 for all categories
    Object.values(ErrorCategory).forEach(category => {
      stats[category] = 0;
    });
    
    try {
      const logFiles = fs.readdirSync(this.errorLogPath)
        .filter(file => file.endsWith('.json'));
      
      for (const file of logFiles) {
        const content = fs.readFileSync(path.join(this.errorLogPath, file), 'utf8');
        const errorLog = JSON.parse(content) as ErrorDetails;
        stats[errorLog.category]++;
      }
    } catch (e) {
      console.error('Failed to read error logs:', e);
    }
    
    return stats;
  }
  
  /**
   * Get all errors of a specific category
   * @param category Error category to filter by
   * @returns Array of error details
   */
  async getErrorsByCategory(category: ErrorCategory): Promise<ErrorDetails[]> {
    const errors: ErrorDetails[] = [];
    
    try {
      const logFiles = fs.readdirSync(this.errorLogPath)
        .filter(file => file.endsWith('.json'));
      
      for (const file of logFiles) {
        const content = fs.readFileSync(path.join(this.errorLogPath, file), 'utf8');
        const errorLog = JSON.parse(content) as ErrorDetails;
        
        if (errorLog.category === category) {
          errors.push(errorLog);
        }
      }
    } catch (e) {
      console.error('Failed to read error logs:', e);
    }
    
    return errors;
  }
  
  /**
   * Generate an error report for AI maintenance
   * @returns Object with error statistics and details suitable for AI analysis
   */
  async generateAIMaintenanceReport(): Promise<any> {
    const stats = await this.getErrorStatistics();
    const mostFrequentCategory = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)[0][0] as ErrorCategory;
    
    const topErrors = await this.getErrorsByCategory(mostFrequentCategory);
    
    return {
      statistics: stats,
      mostFrequentCategory,
      topErrors: topErrors.slice(0, 10), // Limit to top 10 errors
      totalErrors: Object.values(stats).reduce((sum, count) => sum + count, 0),
      generatedAt: new Date().toISOString()
    };
  }
  
  /**
   * Clear error logs older than specified days
   * @param olderThanDays Number of days
   */
  async clearOldErrorLogs(olderThanDays: number = 30): Promise<void> {
    try {
      const logFiles = fs.readdirSync(this.errorLogPath)
        .filter(file => file.endsWith('.json'));
      
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      
      for (const file of logFiles) {
        const filePath = path.join(this.errorLogPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (e) {
      console.error('Failed to clear old error logs:', e);
    }
  }
  
  // Private helper methods
  
  /**
   * Ensure a directory exists
   * @param dirPath Directory path
   */
  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
  
  /**
   * Get current page information
   * @returns String with current URL and title
   */
  private async getCurrentPageInfo(): Promise<string> {
    try {
      const url = this.page.url();
      const title = await this.page.title().catch(() => 'Unknown');
      return `URL: ${url}, Title: ${title}`;
    } catch (e) {
      return 'Unable to get page info';
    }
  }
  
  /**
   * Log error details to file
   * @param errorDetails Error details object
   */
  private async logErrorToFile(errorDetails: ErrorDetails): Promise<void> {
    try {
      const fileName = `error_${errorDetails.code}_${Date.now()}.json`;
      const filePath = path.join(this.errorLogPath, fileName);
      
      fs.writeFileSync(filePath, JSON.stringify(errorDetails, null, 2));
    } catch (e) {
      console.error('Failed to write error log to file:', e);
    }
  }
}
