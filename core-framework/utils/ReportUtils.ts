import fs from 'fs';
import path from 'path';
import { TestInfo } from '@playwright/test';
import CONFIG from '../config/config';

/**
 * Test result interface
 */
export interface TestResult {
  title: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: string;
  errorStack?: string;
  retries: number;
  screenshots: string[];
  videos: string[];
  traces: string[];
  metadata: Record<string, any>;
}

/**
 * Report Utilities for generating and managing test reports
 */
export class ReportUtils {
  private static resultsDir = CONFIG.testResultsDir;
  
  /**
   * Record test result
   * @param testInfo Playwright TestInfo object
   * @param metadata Additional metadata to record
   */
  static async recordTestResult(testInfo: TestInfo, metadata?: Record<string, any>): Promise<void> {
    const testResultsDir = path.join(this.resultsDir, 'test-results');
    
    // Ensure directory exists
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    
    // Collect screenshots
    const screenshots = testInfo.attachments
      .filter(attachment => attachment.contentType.includes('image/'))
      .map(attachment => attachment.path || '');
    
    // Collect videos
    const videos = testInfo.attachments
      .filter(attachment => attachment.contentType.includes('video/'))
      .map(attachment => attachment.path || '');
    
    // Collect traces
    const traces = testInfo.attachments
      .filter(attachment => attachment.name === 'trace')
      .map(attachment => attachment.path || '');
    
    // Create test result object
    const testResult: TestResult = {
      title: testInfo.title,
      status: testInfo.status as any,
      duration: testInfo.duration,
      error: testInfo.error?.message,
      errorStack: testInfo.error?.stack,
      retries: testInfo.retry,
      screenshots,
      videos,
      traces,
      metadata: {
        browser: testInfo.project.name,
        testFile: path.relative(process.cwd(), testInfo.file),
        ...metadata
      }
    };
    
    // Save test result to file
    const resultPath = path.join(
      testResultsDir, 
      `${testInfo.titlePath.join('-')}-${Date.now()}.json`
    );
    
    fs.writeFileSync(resultPath, JSON.stringify(testResult, null, 2));
  }
  
  /**
   * Generate custom HTML report
   * @param title Report title
   * @param description Report description
   */
  static async generateCustomReport(title: string, description?: string): Promise<string> {
    const testResultsDir = path.join(this.resultsDir, 'test-results');
    const reportPath = path.join(this.resultsDir, 'custom-report.html');
    
    // Get all test results
    const resultFiles = fs.readdirSync(testResultsDir)
      .filter(file => file.endsWith('.json'));
    
    const testResults: TestResult[] = [];
    
    for (const file of resultFiles) {
      const filePath = path.join(testResultsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        const result = JSON.parse(content) as TestResult;
        testResults.push(result);
      } catch (error) {
        console.error(`Error parsing test result file ${filePath}: ${error.message}`);
      }
    }
    
    // Calculate statistics
    const totalTests = testResults.length;
    const passedTests = testResults.filter(result => result.status === 'passed').length;
    const failedTests = testResults.filter(result => result.status === 'failed').length;
    const skippedTests = testResults.filter(result => result.status === 'skipped').length;
    const timedOutTests = testResults.filter(result => result.status === 'timedOut').length;
    
    const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    // Generate HTML report
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1, h2 { color: #333; }
          .summary { display: flex; margin-bottom: 20px; }
          .summary-box { padding: 15px; margin-right: 15px; border-radius: 5px; color: white; text-align: center; min-width: 120px; }
          .total { background-color: #007bff; }
          .passed { background-color: #28a745; }
          .failed { background-color: #dc3545; }
          .skipped { background-color: #6c757d; }
          .timed-out { background-color: #ffc107; color: #333; }
          .test-list { margin-top: 30px; }
          .test-item { margin-bottom: 15px; padding: 15px; border-radius: 5px; border: 1px solid #ddd; }
          .test-item.passed { border-left: 5px solid #28a745; }
          .test-item.failed { border-left: 5px solid #dc3545; }
          .test-item.skipped { border-left: 5px solid #6c757d; }
          .test-item.timedOut { border-left: 5px solid #ffc107; }
          .test-title { margin-top: 0; }
          .test-meta { color: #666; font-size: 14px; }
          .test-error { background-color: #f8d7da; padding: 10px; border-radius: 5px; margin-top: 10px; white-space: pre-wrap; }
          .test-attachments { margin-top: 10px; }
          .test-attachment { display: inline-block; margin-right: 10px; margin-bottom: 10px; }
          .test-attachment img { max-width: 200px; max-height: 200px; border: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>${description || ''}</p>
        
        <div class="summary">
          <div class="summary-box total">
            <h2>Total</h2>
            <p>${totalTests}</p>
          </div>
          <div class="summary-box passed">
            <h2>Passed</h2>
            <p>${passedTests} (${passRate}%)</p>
          </div>
          <div class="summary-box failed">
            <h2>Failed</h2>
            <p>${failedTests}</p>
          </div>
          <div class="summary-box skipped">
            <h2>Skipped</h2>
            <p>${skippedTests}</p>
          </div>
          <div class="summary-box timed-out">
            <h2>Timed Out</h2>
            <p>${timedOutTests}</p>
          </div>
        </div>
        
        <div class="test-list">
          <h2>Test Results</h2>
          ${testResults.map(result => `
            <div class="test-item ${result.status}">
              <h3 class="test-title">${result.title}</h3>
              <div class="test-meta">
                <p>Status: ${result.status}</p>
                <p>Duration: ${result.duration}ms</p>
                <p>Browser: ${result.metadata.browser}</p>
                <p>File: ${result.metadata.testFile}</p>
                ${result.retries > 0 ? `<p>Retries: ${result.retries}</p>` : ''}
              </div>
              
              ${result.error ? `
                <div class="test-error">
                  <strong>Error:</strong> ${result.error}
                </div>
              ` : ''}
              
              ${result.screenshots.length > 0 ? `
                <div class="test-attachments">
                  <h4>Screenshots:</h4>
                  ${result.screenshots.map(screenshot => `
                    <div class="test-attachment">
                      <img src="file://${screenshot}" alt="Screenshot" />
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${result.videos.length > 0 ? `
                <div class="test-attachments">
                  <h4>Videos:</h4>
                  ${result.videos.map(video => `
                    <div class="test-attachment">
                      <a href="file://${video}" target="_blank">View Video</a>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${result.traces.length > 0 ? `
                <div class="test-attachments">
                  <h4>Traces:</h4>
                  ${result.traces.map(trace => `
                    <div class="test-attachment">
                      <a href="file://${trace}" target="_blank">View Trace</a>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </body>
      </html>
    `;
    
    fs.writeFileSync(reportPath, html);
    
    return reportPath;
  }
  
  /**
   * Merge JUnit XML reports
   * @param outputPath Output path for merged report
   * @param inputPaths Input paths for reports to merge
   */
  static async mergeJUnitReports(outputPath: string, inputPaths: string[]): Promise<void> {
    // This is a simplified implementation
    // In a real-world scenario, you would parse the XML files and merge them properly
    
    let mergedContent = '<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n';
    
    for (const inputPath of inputPaths) {
      if (fs.existsSync(inputPath)) {
        const content = fs.readFileSync(inputPath, 'utf8');
        // Extract testsuite elements from each file
        const testsuiteMatch = content.match(/<testsuite[^>]*>[\s\S]*?<\/testsuite>/g);
        if (testsuiteMatch) {
          mergedContent += testsuiteMatch.join('\n') + '\n';
        }
      }
    }
    
    mergedContent += '</testsuites>';
    
    fs.writeFileSync(outputPath, mergedContent);
  }
}
