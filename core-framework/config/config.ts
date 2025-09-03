import minimist from 'minimist';
import path from 'path';
import fs from 'fs';
import { Environment, getAppConfig, getBaseUrl, getApiBaseUrl, getTestResultsDir } from './app-config';

// Define the configuration interface
export interface TestConfig {
  app: string;
  env: Environment;
  baseUrl: string;
  apiBaseUrl: string;
  testResultsDir: string;
  headless: boolean;
  debug: boolean;
  workers: number;
  retries: number;
  timeout: number;
  slowMo: number;
  viewport: {
    width: number;
    height: number;
  };
  recordVideo: boolean;
  traceMode: 'on' | 'off' | 'retain-on-failure';
  screenshotMode: 'on' | 'off' | 'only-on-failure';
  aiAssisted: boolean;
  tags?: string[]; // Tags to filter tests by
  errorReporting?: {
    enabled: boolean;
    captureScreenshots: boolean;
    logToConsole: boolean;
    logToFile: boolean;
    maxErrorAge: number; // Days to keep error logs
  };
}

// Default configuration values
const DEFAULT_CONFIG: Partial<TestConfig> = {
  app: 'sauce-demo',
  env: 'qa',
  headless: true,
  debug: false,
  workers: 1,
  retries: 1,
  timeout: 30000,
  slowMo: 0,
  viewport: {
    width: 1280,
    height: 720
  },
  recordVideo: false,
  traceMode: 'retain-on-failure',
  screenshotMode: 'only-on-failure',
  aiAssisted: false,
  errorReporting: {
    enabled: true,
    captureScreenshots: true,
    logToConsole: true,
    logToFile: true,
    maxErrorAge: 30 // 30 days
  }
};

// Parse command line arguments and environment variables
export function parseCommandLineArgs(): Partial<TestConfig> {
  const args = minimist(process.argv.slice(2));
  
  // Parse tags from command line or environment variable
  let tags: string[] | undefined;
  if (args.tags) {
    tags = args.tags.split(',').map((tag: string) => tag.trim());
  } else if (process.env.TAGS) {
    tags = process.env.TAGS.split(',').map((tag: string) => tag.trim());
  }
  
  return {
    // Check command line args first, then environment variables
    app: args.app || args.a || process.env.APP,
    env: args.env || args.e || process.env.ENV,
    headless: args.headless !== undefined ? args.headless === 'true' : 
              process.env.HEADLESS !== undefined ? process.env.HEADLESS === 'true' : undefined,
    debug: args.debug !== undefined ? args.debug === 'true' : 
           process.env.DEBUG !== undefined ? process.env.DEBUG === 'true' : undefined,
    workers: args.workers !== undefined ? parseInt(args.workers) : 
             process.env.WORKERS !== undefined ? parseInt(process.env.WORKERS) : undefined,
    retries: args.retries !== undefined ? parseInt(args.retries) : 
             process.env.RETRIES !== undefined ? parseInt(process.env.RETRIES) : undefined,
    timeout: args.timeout !== undefined ? parseInt(args.timeout) : 
             process.env.TIMEOUT !== undefined ? parseInt(process.env.TIMEOUT) : undefined,
    slowMo: args.slowMo !== undefined ? parseInt(args.slowMo) : 
            process.env.SLOW_MO !== undefined ? parseInt(process.env.SLOW_MO) : undefined,
    recordVideo: args.recordVideo !== undefined ? args.recordVideo === 'true' : 
                process.env.RECORD_VIDEO !== undefined ? process.env.RECORD_VIDEO === 'true' : undefined,
    traceMode: args.traceMode || process.env.TRACE_MODE,
    screenshotMode: args.screenshotMode || process.env.SCREENSHOT_MODE,
    aiAssisted: args.aiAssisted !== undefined ? args.aiAssisted === 'true' : 
                process.env.AI_ASSISTED !== undefined ? process.env.AI_ASSISTED === 'true' : undefined,
    tags: tags,
    errorReporting: {
      enabled: args.errorReporting !== undefined ? args.errorReporting === 'true' : 
               process.env.ERROR_REPORTING !== undefined ? process.env.ERROR_REPORTING === 'true' : DEFAULT_CONFIG.errorReporting?.enabled ?? true,
      captureScreenshots: args.errorScreenshots !== undefined ? args.errorScreenshots === 'true' : 
                         process.env.ERROR_SCREENSHOTS !== undefined ? process.env.ERROR_SCREENSHOTS === 'true' : DEFAULT_CONFIG.errorReporting?.captureScreenshots ?? true,
      logToConsole: args.errorLogConsole !== undefined ? args.errorLogConsole === 'true' : 
                   process.env.ERROR_LOG_CONSOLE !== undefined ? process.env.ERROR_LOG_CONSOLE === 'true' : DEFAULT_CONFIG.errorReporting?.logToConsole ?? true,
      logToFile: args.errorLogFile !== undefined ? args.errorLogFile === 'true' : 
                process.env.ERROR_LOG_FILE !== undefined ? process.env.ERROR_LOG_FILE === 'true' : DEFAULT_CONFIG.errorReporting?.logToFile ?? true,
      maxErrorAge: args.errorMaxAge !== undefined ? parseInt(args.errorMaxAge) : 
                  process.env.ERROR_MAX_AGE !== undefined ? parseInt(process.env.ERROR_MAX_AGE) : DEFAULT_CONFIG.errorReporting?.maxErrorAge ?? 30
    }
  };
}

// Load and merge configuration
export function loadConfig(): TestConfig {
  const cmdLineArgs = parseCommandLineArgs();
  
  // Merge with defaults
  const config = {
    ...DEFAULT_CONFIG,
    ...cmdLineArgs
  } as TestConfig;
  
  // Validate application
  try {
    const appConfig = getAppConfig(config.app);
    
    // Ensure environment is valid
    if (!appConfig.validEnvironments.includes(config.env)) {
      throw new Error(`Invalid environment '${config.env}' for application '${config.app}'`);
    }
    
    // Set derived values
    config.baseUrl = getBaseUrl(config.app, config.env);
    config.apiBaseUrl = getApiBaseUrl(config.app, config.env);
    config.testResultsDir = getTestResultsDir(config.app);
    
    // Ensure test results directory exists
    if (!fs.existsSync(config.testResultsDir)) {
      fs.mkdirSync(config.testResultsDir, { recursive: true });
    }
    
  } catch (error: any) {
    console.error(`Configuration error: ${error.message}`);
    process.exit(1);
  }
  
  return config;
}

// Get the current test configuration
export const CONFIG: TestConfig = loadConfig();

// Export for use in other modules
export default CONFIG;
