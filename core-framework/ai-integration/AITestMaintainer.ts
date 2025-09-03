import fs from 'fs';
import path from 'path';
import { OpenAIHelper } from './OpenAIHelper';
import CONFIG from '../config/config';

/**
 * Test maintenance options interface
 */
interface TestMaintenanceOptions {
  testFilePath: string;
  errorMessage?: string;
  testResults?: string;
  action: 'fix' | 'optimize' | 'document' | 'refactor';
}

/**
 * AI Test Maintainer for automatically maintaining and improving tests
 */
export class AITestMaintainer {
  private openAIHelper: OpenAIHelper;
  
  /**
   * Constructor for AITestMaintainer
   * @param apiKey OpenAI API key (optional)
   */
  constructor(apiKey?: string) {
    this.openAIHelper = new OpenAIHelper(apiKey);
  }
  
  /**
   * Maintain a test file based on options
   * @param options Test maintenance options
   * @returns Path to the maintained test file
   */
  async maintainTest(options: TestMaintenanceOptions): Promise<string> {
    console.log(`Maintaining test file: ${options.testFilePath}`);
    
    // Check if test file exists
    if (!fs.existsSync(options.testFilePath)) {
      throw new Error(`Test file not found: ${options.testFilePath}`);
    }
    
    // Read the test file
    const testCode = fs.readFileSync(options.testFilePath, 'utf8');
    
    // Perform the requested action
    let updatedCode: string;
    
    switch (options.action) {
      case 'fix':
        updatedCode = await this.fixTest(testCode, options.errorMessage);
        break;
      case 'optimize':
        updatedCode = await this.optimizeTest(testCode, options.testResults);
        break;
      case 'document':
        updatedCode = await this.documentTest(testCode);
        break;
      case 'refactor':
        updatedCode = await this.refactorTest(testCode);
        break;
      default:
        throw new Error(`Unsupported action: ${options.action}`);
    }
    
    // Create a backup of the original file
    const backupPath = `${options.testFilePath}.bak`;
    fs.copyFileSync(options.testFilePath, backupPath);
    
    // Write the updated code to the file
    fs.writeFileSync(options.testFilePath, updatedCode);
    
    console.log(`Test maintained successfully: ${options.testFilePath}`);
    console.log(`Original file backed up to: ${backupPath}`);
    
    return options.testFilePath;
  }
  
  /**
   * Fix a failing test
   * @param testCode Original test code
   * @param errorMessage Error message
   * @returns Fixed test code
   */
  private async fixTest(testCode: string, errorMessage?: string): Promise<string> {
    if (!errorMessage) {
      throw new Error('Error message is required to fix a test');
    }
    
    return await this.openAIHelper.analyzeTestFailure(testCode, errorMessage);
  }
  
  /**
   * Optimize a test
   * @param testCode Original test code
   * @param testResults Test results
   * @returns Optimized test code
   */
  private async optimizeTest(testCode: string, testResults?: string): Promise<string> {
    if (!testResults) {
      testResults = 'No specific test results provided. Focus on general optimization.';
    }
    
    return await this.openAIHelper.optimizeTestSuite(testResults, testCode);
  }
  
  /**
   * Document a test
   * @param testCode Original test code
   * @returns Documented test code
   */
  private async documentTest(testCode: string): Promise<string> {
    const documentation = await this.openAIHelper.generateDocumentation(testCode);
    
    // Add the documentation as a comment at the top of the file
    return `/**
 * ${documentation.replace(/\n/g, '\n * ')}
 */
${testCode}`;
  }
  
  /**
   * Refactor a test
   * @param testCode Original test code
   * @returns Refactored test code
   */
  private async refactorTest(testCode: string): Promise<string> {
    const prompt = `
      Refactor this test code to improve:
      1. Code readability
      2. Maintainability
      3. Reusability
      4. Performance
      
      Apply best practices for Playwright tests and TypeScript.
      Do not change the functionality of the test.
      
      Original test code:
      \`\`\`
      ${testCode}
      \`\`\`
      
      Return only the refactored code without any explanations or markdown formatting.
    `;
    
    return await this.openAIHelper.generateText(prompt, { temperature: 0.2 });
  }
  
  /**
   * Analyze test coverage
   * @param testDir Directory containing tests
   * @returns Coverage analysis
   */
  async analyzeTestCoverage(testDir: string): Promise<string> {
    console.log(`Analyzing test coverage for directory: ${testDir}`);
    
    // Check if directory exists
    if (!fs.existsSync(testDir)) {
      throw new Error(`Directory not found: ${testDir}`);
    }
    
    // Get all test files
    const testFiles = this.getTestFiles(testDir);
    
    // Read all test files
    const testCodes: string[] = [];
    for (const file of testFiles) {
      const code = fs.readFileSync(file, 'utf8');
      testCodes.push(`File: ${path.relative(process.cwd(), file)}\n\n${code}`);
    }
    
    // Create prompt for the AI
    const prompt = `
      Analyze the test coverage of these test files:
      
      ${testCodes.join('\n\n' + '-'.repeat(80) + '\n\n')}
      
      Provide a detailed analysis including:
      1. What functionality is covered by these tests
      2. What functionality might be missing coverage
      3. Suggestions for additional tests to improve coverage
      4. Any patterns or anti-patterns observed in the tests
      
      Format the analysis in Markdown.
    `;
    
    return await this.openAIHelper.generateText(prompt, { temperature: 0.3, maxTokens: 2000 });
  }
  
  /**
   * Get all test files in a directory (recursive)
   * @param dir Directory to search
   * @returns Array of test file paths
   */
  private getTestFiles(dir: string): string[] {
    const files: string[] = [];
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        files.push(...this.getTestFiles(itemPath));
      } else if (stats.isFile() && (item.endsWith('.spec.ts') || item.endsWith('.test.ts'))) {
        files.push(itemPath);
      }
    }
    
    return files;
  }
}
