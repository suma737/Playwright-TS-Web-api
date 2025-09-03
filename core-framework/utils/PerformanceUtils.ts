import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import CONFIG from '../config/config';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  // Navigation timing metrics
  navigationStart?: number;
  loadEventEnd?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
  
  // Custom metrics
  totalDuration?: number;
  resourcesCount?: number;
  resourcesSize?: number;
  
  // Web Vitals
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  
  // Custom thresholds
  passesThresholds?: boolean;
}

/**
 * Performance Utilities for measuring and analyzing page performance
 */
export class PerformanceUtils {
  private page: Page;
  private metricsLog: PerformanceMetrics[] = [];
  private thresholds: Record<string, number>;
  
  /**
   * Constructor for PerformanceUtils
   * @param page Playwright Page object
   * @param thresholds Optional performance thresholds
   */
  constructor(page: Page, thresholds?: Record<string, number>) {
    this.page = page;
    this.thresholds = thresholds || {
      totalDuration: 3000,
      firstContentfulPaint: 1000,
      largestContentfulPaint: 2500,
      cumulativeLayoutShift: 0.1
    };
  }
  
  /**
   * Start performance measurement
   */
  async startMeasurement(): Promise<void> {
    // Clear the performance entries
    await this.page.evaluate(() => {
      window.performance.clearResourceTimings();
      window.performance.clearMarks();
      window.performance.clearMeasures();
    });
  }
  
  /**
   * Collect performance metrics
   * @param label Optional label for the metrics
   * @returns Performance metrics
   */
  async collectMetrics(label?: string): Promise<PerformanceMetrics> {
    const metrics = await this.page.evaluate(() => {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as any;
      const paintTiming = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');
      
      // Get First Paint and First Contentful Paint
      let firstPaint = 0;
      let firstContentfulPaint = 0;
      
      paintTiming.forEach((entry: any) => {
        if (entry.name === 'first-paint') {
          firstPaint = entry.startTime;
        }
        if (entry.name === 'first-contentful-paint') {
          firstContentfulPaint = entry.startTime;
        }
      });
      
      // Calculate resource metrics
      let resourcesSize = 0;
      resources.forEach((resource: any) => {
        resourcesSize += resource.transferSize || 0;
      });
      
      // Get Largest Contentful Paint if available
      let largestContentfulPaint = 0;
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries && lcpEntries.length > 0) {
        largestContentfulPaint = (lcpEntries[lcpEntries.length - 1] as any).startTime;
      }
      
      // Get Cumulative Layout Shift if available
      let cumulativeLayoutShift = 0;
      if ('cumulativeLayoutShift' in window) {
        cumulativeLayoutShift = (window as any).cumulativeLayoutShift || 0;
      }
      
      return {
        navigationStart: navigationTiming ? navigationTiming.startTime : 0,
        loadEventEnd: navigationTiming ? navigationTiming.loadEventEnd : 0,
        domContentLoaded: navigationTiming ? navigationTiming.domContentLoadedEventEnd : 0,
        firstPaint,
        firstContentfulPaint,
        largestContentfulPaint,
        totalDuration: navigationTiming ? navigationTiming.duration : 0,
        resourcesCount: resources.length,
        resourcesSize,
        cumulativeLayoutShift
      };
    });
    
    // Check if metrics pass thresholds
    metrics.passesThresholds = this.checkThresholds(metrics);
    
    // Add label if provided
    const labeledMetrics = label ? { label, ...metrics } : metrics;
    
    // Add to metrics log
    this.metricsLog.push(labeledMetrics as PerformanceMetrics);
    
    return metrics;
  }
  
  /**
   * Check if metrics pass thresholds
   * @param metrics Performance metrics
   * @returns Whether metrics pass thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): boolean {
    for (const [key, threshold] of Object.entries(this.thresholds)) {
      if (key in metrics && metrics[key as keyof PerformanceMetrics] as number > threshold) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Save performance metrics to file
   * @param filePath Optional file path
   */
  async saveMetricsToFile(filePath?: string): Promise<void> {
    const targetPath = filePath || path.join(
      CONFIG.testResultsDir, 
      'performance', 
      `performance-${new Date().toISOString().replace(/:/g, '-')}.json`
    );
    
    // Ensure directory exists
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write metrics to file
    fs.writeFileSync(targetPath, JSON.stringify(this.metricsLog, null, 2));
  }
  
  /**
   * Measure page load performance
   * @param url URL to navigate to
   * @param label Optional label for the metrics
   * @returns Performance metrics
   */
  async measurePageLoad(url: string, label?: string): Promise<PerformanceMetrics> {
    await this.startMeasurement();
    await this.page.goto(url, { waitUntil: 'networkidle' });
    return await this.collectMetrics(label || url);
  }
  
  /**
   * Measure action performance
   * @param action Function that performs the action
   * @param label Optional label for the metrics
   * @returns Performance metrics
   */
  async measureAction(action: () => Promise<void>, label?: string): Promise<PerformanceMetrics> {
    await this.startMeasurement();
    await action();
    return await this.collectMetrics(label);
  }
}
