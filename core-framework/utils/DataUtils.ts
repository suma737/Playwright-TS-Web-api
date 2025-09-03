import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import CONFIG from '../config/config';

/**
 * Data Utilities for loading and managing test data
 */
export class DataUtils {
  /**
   * Load YAML test data file
   * @param appName Application name
   * @param fileName File name without extension
   * @param env Environment to filter data for (optional)
   * @returns Parsed test data
   */
  static loadTestData(appName: string, fileName: string, env?: string): any {
    const appConfig = CONFIG.app;
    const environment = env || CONFIG.env;
    const filePath = path.join('apps', appName, 'testdata', `${fileName}.yaml`);
    
    try {
      // Read the YAML file
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = yaml.load(fileContent) as any;
      
      // If environment is specified, filter data for that environment
      if (environment && data) {
        return this.filterDataByEnvironment(data, environment);
      }
      
      return data;
    } catch (error) {
      console.error(`Error loading test data from ${filePath}: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Filter test data by environment
   * @param data Test data object
   * @param env Environment to filter for
   * @returns Filtered test data
   */
  private static filterDataByEnvironment(data: any, env: string): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    // Check if this is the new structure (user type -> environment -> details)
    // or the old structure (environment -> user type -> details)
    const isNewStructure = this.isNewDataStructure(data);
    
    if (isNewStructure) {
      // New structure: userType.environment.details
      const result: any = {};
      
      // For each user type
      for (const userType in data) {
        if (Object.prototype.hasOwnProperty.call(data, userType)) {
          const userTypeData = data[userType];
          
          // Check if this user type has data for the specified environment
          if (userTypeData && userTypeData[env]) {
            result[userType] = userTypeData[env];
          }
        }
      }
      
      return result;
    } else {
      // Old structure: environment.userType.details
      // If data has environment-specific properties
      if (data[env]) {
        return data[env];
      }
      
      // Process nested objects
      const result: any = Array.isArray(data) ? [] : {};
      
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          
          if (typeof value === 'object' && value !== null) {
            // If the object has an 'env' property matching our target environment
            if (value.env === env) {
              result[key] = value;
            } else if (value.env === undefined) {
              // Recursively process nested objects without env property
              result[key] = this.filterDataByEnvironment(value, env);
            }
          } else {
            result[key] = value;
          }
        }
      }
      
      return result;
    }
  }
  
  /**
   * Determine if the data follows the new structure (userType.environment.details)
   * @param data Test data object
   * @returns boolean indicating if it's the new structure
   */
  private static isNewDataStructure(data: any): boolean {
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    
    // Check first key in the data
    const firstKey = Object.keys(data)[0];
    if (!firstKey) return false;
    
    const firstValue = data[firstKey];
    
    // In the new structure, the first level is user types and the second level is environments
    // So we check if the first value is an object and if it has qa/staging/prod keys
    return (
      typeof firstValue === 'object' &&
      firstValue !== null &&
      (firstValue.qa !== undefined || firstValue.staging !== undefined || firstValue.prod !== undefined)
    );
  }
  
  /**
   * Generate random test data
   * @param type Type of data to generate
   * @param options Options for data generation
   * @returns Generated test data
   */
  static generateTestData(type: 'email' | 'username' | 'password' | 'phone' | 'name', options?: any): string {
    const timestamp = Date.now();
    
    switch (type) {
      case 'email':
        return `test.user.${timestamp}@example.com`;
      case 'username':
        return `testuser${timestamp}`;
      case 'password':
        return `Password${timestamp}!`;
      case 'phone':
        return `555${Math.floor(1000000 + Math.random() * 9000000)}`;
      case 'name':
        return `Test User ${timestamp}`;
      default:
        throw new Error(`Unsupported test data type: ${type}`);
    }
  }
}
