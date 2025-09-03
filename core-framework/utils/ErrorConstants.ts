/**
 * Error Constants for Test Automation Framework
 * 
 * These constants provide standardized error codes for different types of failures
 * that can occur during test execution. Using these constants makes it easier to:
 * 1. Group similar failures for analysis
 * 2. Target specific types of failures for AI maintenance
 * 3. Generate more meaningful error reports
 */

export enum ErrorCategory {
  // Data related errors
  DATA = 'DATA',
  
  // UI element related errors
  ELEMENT = 'ELEMENT',
  
  // Page navigation and loading errors
  NAVIGATION = 'NAVIGATION',
  
  // Assertion failures
  ASSERTION = 'ASSERTION',
  
  // Network related errors
  NETWORK = 'NETWORK',
  
  // Authentication related errors
  AUTH = 'AUTH',
  
  // Performance related issues
  PERFORMANCE = 'PERFORMANCE',
  
  // Visual testing errors
  VISUAL = 'VISUAL',
  
  // API related errors
  API = 'API',
  
  // Framework or configuration errors
  FRAMEWORK = 'FRAMEWORK',
  
  // Unknown or uncategorized errors
  UNKNOWN = 'UNKNOWN'
}

export const ErrorCode = {
  // Data related errors (1000-1999)
  ERROR_INVALID_DATA: { code: 1001, category: ErrorCategory.DATA, message: 'Invalid test data provided', title: 'Invalid Data' },
  ERROR_MISSING_DATA: { code: 1002, category: ErrorCategory.DATA, message: 'Required test data is missing', title: 'Missing Data' },
  ERROR_DATA_FORMAT: { code: 1003, category: ErrorCategory.DATA, message: 'Test data format is incorrect', title: 'Data Format Error' },
  ERROR_ENV_DATA_NOT_FOUND: { code: 1004, category: ErrorCategory.DATA, message: 'Environment-specific data not found', title: 'Environment Data Not Found' },
  
  // Element related errors (2000-2999)
  ERROR_LOCATOR_NOT_FOUND: { code: 2001, category: ErrorCategory.ELEMENT, message: 'Element locator not found', title: 'Element Not Found' },
  ERROR_ELEMENT_NOT_VISIBLE: { code: 2002, category: ErrorCategory.ELEMENT, message: 'Element is not visible', title: 'Element Not Visible' },
  ERROR_ELEMENT_NOT_CLICKABLE: { code: 2003, category: ErrorCategory.ELEMENT, message: 'Element is not clickable', title: 'Element Not Clickable' },
  ERROR_ELEMENT_WRONG_STATE: { code: 2004, category: ErrorCategory.ELEMENT, message: 'Element is in wrong state', title: 'Element Wrong State' },
  ERROR_ELEMENT_TIMEOUT: { code: 2007, category: ErrorCategory.ELEMENT, message: 'Element interaction timed out', title: 'Element Timeout' },
  ERROR_ELEMENT_ATTRIBUTE_MISSING: { code: 2005, category: ErrorCategory.ELEMENT, message: 'Element attribute is missing', title: 'Missing Element Attribute' },
  ERROR_STALE_ELEMENT: { code: 2006, category: ErrorCategory.ELEMENT, message: 'Element is stale or no longer attached to DOM', title: 'Stale Element' },
  
  // Navigation related errors (3000-3999)
  ERROR_PAGE_NOT_LOADED: { code: 3001, category: ErrorCategory.NAVIGATION, message: 'Page failed to load', title: 'Page Load Failed' },
  ERROR_NAVIGATION_FAILED: { code: 3002, category: ErrorCategory.NAVIGATION, message: 'Navigation to page failed', title: 'Navigation Failed' },
  ERROR_REDIRECT_UNEXPECTED: { code: 3003, category: ErrorCategory.NAVIGATION, message: 'Unexpected redirect occurred', title: 'Unexpected Redirect' },
  ERROR_URL_MISMATCH: { code: 3004, category: ErrorCategory.NAVIGATION, message: 'Current URL does not match expected URL', title: 'URL Mismatch' },
  
  // Assertion failures (4000-4999)
  ERROR_ASSERTION_TEXT: { code: 4001, category: ErrorCategory.ASSERTION, message: 'Text assertion failed', title: 'Text Assertion Failed' },
  ERROR_ASSERTION_VISIBILITY: { code: 4002, category: ErrorCategory.ASSERTION, message: 'Visibility assertion failed', title: 'Visibility Assertion Failed' },
  ERROR_ASSERTION_COUNT: { code: 4003, category: ErrorCategory.ASSERTION, message: 'Count assertion failed', title: 'Count Assertion Failed' },
  ERROR_ASSERTION_STATE: { code: 4004, category: ErrorCategory.ASSERTION, message: 'State assertion failed', title: 'State Assertion Failed' },
  ERROR_ASSERTION_PROPERTY: { code: 4005, category: ErrorCategory.ASSERTION, message: 'Property assertion failed', title: 'Property Assertion Failed' },
  
  // Network related errors (5000-5999)
  ERROR_NETWORK_REQUEST_FAILED: { code: 5001, category: ErrorCategory.NETWORK, message: 'Network request failed', title: 'Network Request Failed' },
  ERROR_NETWORK_TIMEOUT: { code: 5002, category: ErrorCategory.NETWORK, message: 'Network request timed out', title: 'Network Timeout' },
  ERROR_STATUS_CODE_UNEXPECTED: { code: 5003, category: ErrorCategory.NETWORK, message: 'Unexpected HTTP status code', title: 'Unexpected Status Code' },
  
  // Authentication related errors (6000-6999)
  ERROR_AUTH_FAILED: { code: 6001, category: ErrorCategory.AUTH, message: 'Authentication failed', title: 'Authentication Failed' },
  ERROR_SESSION_EXPIRED: { code: 6002, category: ErrorCategory.AUTH, message: 'Session expired', title: 'Session Expired' },
  ERROR_UNAUTHORIZED: { code: 6003, category: ErrorCategory.AUTH, message: 'Unauthorized access', title: 'Unauthorized Access' },
  
  // Performance related issues (7000-7999)
  ERROR_PERFORMANCE_TIMEOUT: { code: 7001, category: ErrorCategory.PERFORMANCE, message: 'Operation timed out due to performance issues', title: 'Performance Timeout' },
  ERROR_PERFORMANCE_THRESHOLD: { code: 7002, category: ErrorCategory.PERFORMANCE, message: 'Performance threshold exceeded', title: 'Performance Threshold Exceeded' },
  
  // Visual testing errors (8000-8999)
  ERROR_VISUAL_MISMATCH: { code: 8001, category: ErrorCategory.VISUAL, message: 'Visual comparison failed', title: 'Visual Comparison Failed' },
  ERROR_VISUAL_BASELINE_MISSING: { code: 8002, category: ErrorCategory.VISUAL, message: 'Visual baseline image missing', title: 'Missing Visual Baseline' },
  
  // API related errors (9000-9999)
  ERROR_API_RESPONSE_INVALID: { code: 9001, category: ErrorCategory.API, message: 'Invalid API response', title: 'Invalid API Response' },
  ERROR_API_SCHEMA_VALIDATION: { code: 9002, category: ErrorCategory.API, message: 'API schema validation failed', title: 'API Schema Validation Failed' },
  
  // Framework or configuration errors (10000-10999)
  ERROR_CONFIG_INVALID: { code: 10001, category: ErrorCategory.FRAMEWORK, message: 'Invalid framework configuration', title: 'Invalid Configuration' },
  ERROR_DEPENDENCY_MISSING: { code: 10002, category: ErrorCategory.FRAMEWORK, message: 'Required dependency is missing', title: 'Missing Dependency' },
  
  // Unknown or uncategorized errors (99000-99999)
  ERROR_UNKNOWN: { code: 99999, category: ErrorCategory.UNKNOWN, message: 'Unknown error occurred', title: 'Unknown Error' }
};

// Type for error details
export interface ErrorDetails {
  code: number;
  category: ErrorCategory;
  message: string;
  title: string;
  details?: any;
  location?: string;
  screenshot?: string;
  timestamp?: string;
}
