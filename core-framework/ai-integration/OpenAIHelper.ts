import axios from 'axios';
import fs from 'fs';
import path from 'path';
import CONFIG from '../config/config';

// Function to read API key from .env file
function readApiKeyFromEnvFile(): string | undefined {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/OPENAI_API_KEY=([^\s]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return undefined;
  } catch (error) {
    console.error('Error reading .env file:', error);
    return undefined;
  }
}

/**
 * OpenAI API response interface
 */
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI Helper for integrating with OpenAI APIs
 */
export class OpenAIHelper {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  
  /**
   * Constructor for OpenAIHelper
   * @param apiKey OpenAI API key (defaults to environment variable)
   * @param model OpenAI model to use
   */
  constructor(apiKey?: string, model: string = 'gpt-4o-mini') {
    // Try to get API key from parameter, environment variable, or .env file
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || readApiKeyFromEnvFile() || '';
    this.model = model;
    this.baseUrl = 'https://api.openai.com/v1';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not provided. Set OPENAI_API_KEY environment variable or pass it to the constructor.');
    } else {
      console.log('OpenAI API key loaded successfully');
    }
  }
  
  /**
   * Generate text using OpenAI API
   * @param prompt Prompt to generate text from
   * @param options Generation options
   * @returns Generated text
   */
  async generateText(prompt: string, options?: { temperature?: number, maxTokens?: number }): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided');
    }
    
    try {
      const response = await axios.post<OpenAIResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error generating text with OpenAI:', error.message);
      } else if (typeof error === 'object' && error !== null && 'response' in error && 
                error.response && typeof error.response === 'object' && 'data' in error.response) {
        console.error('Error generating text with OpenAI:', error.response.data);
      } else {
        console.error('Error generating text with OpenAI:', error);
      }
      throw error;
    }
  }
  
  /**
   * Generate test code based on requirements
   * @param requirements Test requirements
   * @param options Generation options
   * @returns Generated test code
   */
  async generateTestCode(requirements: string, options?: { framework?: string, language?: string }): Promise<string> {
    const framework = options?.framework || 'playwright';
    const language = options?.language || 'typescript';
    
    const prompt = `
      Generate a ${framework} test in ${language} based on the following requirements:
      
      ${requirements}
      
      The test should follow best practices for ${framework} and use page objects.
      Include detailed comments explaining the test flow.
      
      Return only the code without any explanations or markdown formatting.
    `;
    
    return await this.generateText(prompt, { temperature: 0.2 });
  }
  
  /**
   * Analyze test failures and suggest fixes
   * @param testCode Failed test code
   * @param errorMessage Error message
   * @returns Analysis and suggested fixes
   */
  async analyzeTestFailure(testCode: string, errorMessage: string): Promise<string> {
    const prompt = `
      Analyze this failed test and suggest fixes:
      
      Test code:
      \`\`\`
      ${testCode}
      \`\`\`
      
      Error message:
      \`\`\`
      ${errorMessage}
      \`\`\`
      
      Provide a detailed analysis of what might be causing the failure and suggest specific code changes to fix it.
    `;
    
    return await this.generateText(prompt, { temperature: 0.3 });
  }
  
  /**
   * Generate test data based on requirements
   * @param requirements Test data requirements
   * @param format Output format (json or yaml)
   * @returns Generated test data
   */
  async generateTestData(requirements: string, format: 'json' | 'yaml' = 'yaml'): Promise<string> {
    const prompt = `
      Generate test data in ${format.toUpperCase()} format based on the following requirements:
      
      ${requirements}
      
      The data should include variations for different environments (dev, qa, staging, prod).
      Return only the ${format.toUpperCase()} content without any explanations or markdown formatting.
    `;
    
    return await this.generateText(prompt, { temperature: 0.4 });
  }
  
  /**
   * Optimize test suite based on test results
   * @param testResults Test results
   * @param testCode Current test code
   * @returns Optimized test code
   */
  async optimizeTestSuite(testResults: string, testCode: string): Promise<string> {
    const prompt = `
      Optimize this test suite based on the test results:
      
      Test results:
      \`\`\`
      ${testResults}
      \`\`\`
      
      Current test code:
      \`\`\`
      ${testCode}
      \`\`\`
      
      Suggest optimizations to improve:
      1. Test reliability
      2. Test performance
      3. Code maintainability
      4. Test coverage
      
      Provide specific code changes and explanations.
    `;
    
    return await this.generateText(prompt, { temperature: 0.3 });
  }
  
  /**
   * Generate documentation for test suite
   * @param testCode Test code to document
   * @returns Generated documentation
   */
  async generateDocumentation(testCode: string): Promise<string> {
    const prompt = `
      Generate comprehensive documentation for this test suite:
      
      \`\`\`
      ${testCode}
      \`\`\`
      
      Include:
      1. Overview of what the tests cover
      2. Prerequisites for running the tests
      3. Test setup and configuration
      4. Description of each test case
      5. Expected outcomes
      
      Format the documentation in Markdown.
    `;
    
    return await this.generateText(prompt, { temperature: 0.3 });
  }
}
