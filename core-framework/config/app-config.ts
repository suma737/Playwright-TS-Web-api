import path from 'path';

// Define base directories
export const ROOT_DIR = path.resolve(__dirname, '../../');
export const APPS_BASE_DIR = path.join(ROOT_DIR, 'apps');
export const REPORTS_DIR = path.join(ROOT_DIR, 'test-results');

// Define types for application configurations
export type Environment = 'dev' | 'staging' | 'prod' | 'qa';

export interface AppConfig {
  description: string;
  environments: Record<Environment, string>;
  apiEnvironments: Record<Environment, string>;
  validEnvironments: Environment[];
  basePath: string;
  loginPerTest: boolean;
  isProduction: (env: Environment) => boolean;
}

export type AppConfigurations = Record<string, AppConfig>;

// Export application configurations
export const APPLICATIONS: AppConfigurations = {
  'sauce-demo': {
    description: 'Sauce Demo E-commerce Website',
    environments: {
      dev: process.env.SAUCE_DEMO_DEV_URL || 'https://www.saucedemo.com',
      staging: process.env.SAUCE_DEMO_STAGING_URL || 'https://www.saucedemo.com',
      prod: process.env.SAUCE_DEMO_PROD_URL || 'https://www.saucedemo.com',
      qa: process.env.SAUCE_DEMO_QA_URL || 'https://www.saucedemo.com'
    },
    apiEnvironments: {
      dev: process.env.SAUCE_DEMO_DEV_API_URL || 'https://api.saucedemo.com/dev',
      staging: process.env.SAUCE_DEMO_STAGING_API_URL || 'https://api.saucedemo.com/staging',
      prod: process.env.SAUCE_DEMO_PROD_API_URL || 'https://api.saucedemo.com',
      qa: process.env.SAUCE_DEMO_QA_API_URL || 'https://api.saucedemo.com/qa'
    },
    validEnvironments: ['dev', 'staging', 'prod', 'qa'],
    basePath: path.join(APPS_BASE_DIR, 'sauce-demo'),
    loginPerTest: true,
    isProduction: (env) => env === 'prod'
  },
  'generic': {
    description: 'Generic Test Application',
    environments: {
      dev: process.env.DEV_BASE_URL || 'http://localhost:3000',
      staging: process.env.STAGING_BASE_URL || 'https://staging.example.com',
      prod: process.env.PROD_BASE_URL || 'https://www.example.com',
      qa: process.env.QA_BASE_URL || 'https://qa.example.com'
    },
    apiEnvironments: {
      dev: process.env.DEV_API_BASE_URL || 'http://localhost:3001/api',
      staging: process.env.STAGING_API_BASE_URL || 'https://api.staging.example.com',
      prod: process.env.PROD_API_BASE_URL || 'https://api.example.com',
      qa: process.env.QA_API_BASE_URL || 'https://api.qa.example.com'
    },
    validEnvironments: ['dev', 'staging', 'prod', 'qa'],
    basePath: path.join(APPS_BASE_DIR, 'generic'),
    loginPerTest: true,
    isProduction: (env) => env === 'prod'
  }
};

// Get application configuration by name
export function getAppConfig(appName: string): AppConfig {
  const config = APPLICATIONS[appName];
  if (!config) {
    throw new Error(`Application configuration not found for: ${appName}`);
  }
  return config;
}

// Get base URL for an application in a specific environment
export function getBaseUrl(appName: string, env: Environment): string {
  const config = getAppConfig(appName);
  if (!config.validEnvironments.includes(env)) {
    throw new Error(`Invalid environment '${env}' for application '${appName}'`);
  }
  return config.environments[env];
}

// Get API base URL for an application in a specific environment
export function getApiBaseUrl(appName: string, env: Environment): string {
  const config = getAppConfig(appName);
  if (!config.validEnvironments.includes(env)) {
    throw new Error(`Invalid environment '${env}' for application '${appName}'`);
  }
  return config.apiEnvironments[env];
}

// Get test results directory for a specific application
export function getTestResultsDir(appName: string): string {
  const config = getAppConfig(appName);
  return path.join(config.basePath, 'test-results');
}
