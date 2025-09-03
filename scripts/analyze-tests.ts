#!/usr/bin/env ts-node
import { AITestMaintainer } from '../core-framework/ai-integration/AITestMaintainer';
import path from 'path';
import fs from 'fs';
import minimist from 'minimist';

// Parse command line arguments
const args = minimist(process.argv.slice(2));

// Display help if requested
if (args.help || args.h) {
  console.log(`
AI Test Analysis Tool

Usage:
  ts-node analyze-tests.ts [options]

Options:
  --action, -a       Action to perform: fix, optimize, document, refactor, analyze-coverage
                     (default: analyze-coverage)
  --file, -f         Path to the test file to maintain (required for fix, optimize, document, refactor)
  --error, -e        Error message for fixing tests (required for fix action)
  --results, -r      Test results for optimization (optional for optimize action)
  --dir, -d          Directory containing tests for coverage analysis (required for analyze-coverage)
  --api-key, -k      OpenAI API key (optional, will use environment variable if not provided)
  --help, -h         Show this help message

Examples:
  # Fix a failing test
  ts-node analyze-tests.ts --action fix --file apps/sauce-demo/tests/e2e/checkout.spec.ts --error "Error message"

  # Analyze test coverage
  ts-node analyze-tests.ts --action analyze-coverage --dir apps/sauce-demo/tests

  # Optimize a test
  ts-node analyze-tests.ts --action optimize --file apps/sauce-demo/tests/e2e/checkout.spec.ts
  `);
  process.exit(0);
}

// Get action
const action = args.action || args.a || 'analyze-coverage';

// Validate action
const validActions = ['fix', 'optimize', 'document', 'refactor', 'analyze-coverage'];
if (!validActions.includes(action)) {
  console.error(`Invalid action: ${action}`);
  console.error(`Valid actions are: ${validActions.join(', ')}`);
  process.exit(1);
}

// Get API key
const apiKey = args['api-key'] || args.k || process.env.OPENAI_API_KEY;

// Initialize AI Test Maintainer
const testMaintainer = new AITestMaintainer(apiKey);

// Main function
async function main() {
  try {
    if (action === 'analyze-coverage') {
      // Get directory
      const dir = args.dir || args.d;
      if (!dir) {
        console.error('Directory is required for coverage analysis');
        process.exit(1);
      }

      // Resolve directory path
      const dirPath = path.resolve(process.cwd(), dir);
      
      // Check if directory exists
      if (!fs.existsSync(dirPath)) {
        console.error(`Directory not found: ${dirPath}`);
        process.exit(1);
      }

      // Analyze test coverage
      console.log(`Analyzing test coverage for directory: ${dirPath}`);
      const analysis = await testMaintainer.analyzeTestCoverage(dirPath);
      
      // Write analysis to file
      const outputFile = path.join(process.cwd(), 'test-coverage-analysis.md');
      fs.writeFileSync(outputFile, analysis);
      
      console.log(`Test coverage analysis written to: ${outputFile}`);
    } else {
      // Get file path
      const filePath = args.file || args.f;
      if (!filePath) {
        console.error('File path is required');
        process.exit(1);
      }

      // Resolve file path
      const testFilePath = path.resolve(process.cwd(), filePath);
      
      // Check if file exists
      if (!fs.existsSync(testFilePath)) {
        console.error(`File not found: ${testFilePath}`);
        process.exit(1);
      }

      // Get error message for fix action
      const errorMessage = args.error || args.e;
      if (action === 'fix' && !errorMessage) {
        console.error('Error message is required for fix action');
        process.exit(1);
      }

      // Get test results for optimize action
      const testResults = args.results || args.r;

      // Maintain test
      await testMaintainer.maintainTest({
        testFilePath,
        errorMessage,
        testResults,
        action: action as any
      });
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});
