import fs from 'fs';
import path from 'path';
import { OpenAIHelper } from './OpenAIHelper';
import CONFIG from '../config/config';

/**
 * Test generation options interface
 */
interface TestGenerationOptions {
  appName: string;
  testType: 'e2e' | 'api' | 'visual' | 'performance';
  description: string;
  pageObjects?: string[];
  complexity?: 'simple' | 'medium' | 'complex';
  includeDataDriven?: boolean;
}

/**
 * AI Test Generator for automatically generating test cases
 */
export class AITestGenerator {
  private openAIHelper: OpenAIHelper;
  private appBasePath: string;
  
  /**
   * Constructor for AITestGenerator
   * @param apiKey OpenAI API key (optional)
   */
  constructor(apiKey?: string) {
    this.openAIHelper = new OpenAIHelper(apiKey);
    this.appBasePath = path.join('apps', CONFIG.app);
  }
  
  /**
   * Generate a test file based on options
   * @param options Test generation options
   * @returns Path to the generated test file
   */
  async generateTest(options: TestGenerationOptions): Promise<string> {
    console.log(`Generating ${options.testType} test for ${options.appName}: ${options.description}`);
    
    // Determine the test directory based on test type
    const testDir = path.join(this.appBasePath, 'tests', options.testType);
    
    // Ensure test directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Generate a file name based on the description
    const fileName = this.generateFileName(options.description);
    const filePath = path.join(testDir, `${fileName}.spec.ts`);
    
    // Collect page objects if specified
    let pageObjectsCode = '';
    if (options.pageObjects && options.pageObjects.length > 0) {
      for (const pageObject of options.pageObjects) {
        const pageObjectPath = path.join(this.appBasePath, 'pages', `${pageObject}.ts`);
        if (fs.existsSync(pageObjectPath)) {
          pageObjectsCode += fs.readFileSync(pageObjectPath, 'utf8') + '\n\n';
        }
      }
    }
    
    // Create prompt for the AI
    const prompt = this.createTestGenerationPrompt(options, pageObjectsCode);
    
    // Generate test code using OpenAI
    const testCode = await this.openAIHelper.generateTestCode(prompt);
    
    // Write the generated test to file
    fs.writeFileSync(filePath, testCode);
    
    console.log(`Test generated successfully: ${filePath}`);
    return filePath;
  }
  
  /**
   * Generate test data for a test
   * @param testDescription Test description
   * @param environments Environments to generate data for
   * @returns Path to the generated test data file
   */
  async generateTestData(testDescription: string, environments: string[] = ['dev', 'qa', 'staging', 'prod']): Promise<string> {
    console.log(`Generating test data for: ${testDescription}`);
    
    // Determine the test data directory
    const testDataDir = path.join(this.appBasePath, 'testdata');
    
    // Ensure test data directory exists
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Generate a file name based on the description
    const fileName = this.generateFileName(testDescription);
    const filePath = path.join(testDataDir, `${fileName}.yaml`);
    
    // Create prompt for the AI
    const prompt = `
      Generate YAML test data for a test with the following description:
      "${testDescription}"
      
      The data should include variations for the following environments: ${environments.join(', ')}.
      Each environment should have its own section in the YAML file.
      Include appropriate test data fields that would be needed for this type of test.
      
      Format the output as valid YAML without any markdown formatting or explanations.
    `;
    
    // Generate test data using OpenAI
    const testData = await this.openAIHelper.generateTestData(prompt);
    
    // Write the generated test data to file
    fs.writeFileSync(filePath, testData);
    
    console.log(`Test data generated successfully: ${filePath}`);
    return filePath;
  }
  
  /**
   * Generate a file name from a description
   * @param description Test description
   * @returns File name
   */
  private generateFileName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  /**
   * Create a prompt for test generation
   * @param options Test generation options
   * @param pageObjectsCode Page objects code
   * @returns Prompt for the AI
   */
  private createTestGenerationPrompt(options: TestGenerationOptions, pageObjectsCode: string): string {
    let prompt = `
      Generate a Playwright test in TypeScript for the following scenario:
      
      Application: ${options.appName}
      Test Type: ${options.testType}
      Description: ${options.description}
      Complexity: ${options.complexity || 'medium'}
      
      The test should follow these requirements:
      1. Use the Playwright test framework with TypeScript
      2. Follow page object pattern
      3. Include appropriate assertions
      4. Handle errors and edge cases
      5. Include detailed comments explaining the test flow
      ${options.includeDataDriven ? '6. Implement data-driven testing using test data from YAML files' : ''}
      
      Base URL: ${CONFIG.baseUrl}
      Environment: ${CONFIG.env}
    `;
    
    // Add page objects if available
    if (pageObjectsCode) {
      prompt += `\n\nHere are the page objects to use:\n\`\`\`typescript\n${pageObjectsCode}\`\`\`\n`;
    }
    
    // Add specific instructions based on test type
    switch (options.testType) {
      case 'e2e':
        prompt += `\nThis should be an end-to-end test that simulates user flows through the application.`;
        break;
      case 'api':
        prompt += `\nThis should be an API test that verifies API endpoints and responses.`;
        break;
      case 'visual':
        prompt += `\nThis should be a visual regression test that captures and compares screenshots.`;
        break;
      case 'performance':
        prompt += `\nThis should be a performance test that measures and asserts on performance metrics.`;
        break;
    }
    
    return prompt;
  }
}
