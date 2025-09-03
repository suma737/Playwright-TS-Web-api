import { AITestMaintainer } from '../../../core-framework/ai-integration/AITestMaintainer';
import fs from 'fs';
import path from 'path';
import minimist from 'minimist';

/**
 * Script to maintain tests using AI for the generic application
 * 
 * Usage:
 * ts-node maintain-tests.ts --action=fix|optimize|document|refactor --test=path/to/test.spec.ts --results=path/to/results.json
 * 
 * Examples:
 * - Fix a failing test:
 *   ts-node maintain-tests.ts --action=fix --test=tests/api/api.spec.ts --results=test-results/results.json
 * 
 * - Optimize tests:
 *   ts-node maintain-tests.ts --action=optimize --test=tests/performance/performance.spec.ts --results=test-results/results.json
 * 
 * - Document tests:
 *   ts-node maintain-tests.ts --action=document --test=tests/visual/visual-regression.spec.ts
 * 
 * - Refactor tests:
 *   ts-node maintain-tests.ts --action=refactor --test=tests/api/api.spec.ts
 * 
 * - Analyze test coverage:
 *   ts-node maintain-tests.ts --action=analyze --dir=tests/api
 */

async function main() {
  try {
    // Parse command line arguments
    const args = minimist(process.argv.slice(2));
    const action = args.action;
    const testFile = args.test;
    const resultsFile = args.results;
    const testDir = args.dir;
    
    // Validate arguments
    if (!action) {
      console.error('Error: --action parameter is required');
      printUsage();
      process.exit(1);
    }
    
    // Create AI Test Maintainer
    const maintainer = new AITestMaintainer();
    
    // Handle different actions
    switch (action) {
      case 'fix':
      case 'optimize':
      case 'document':
      case 'refactor':
        if (!testFile) {
          console.error('Error: --test parameter is required for this action');
          printUsage();
          process.exit(1);
        }
        
        // Get absolute path to test file
        const testFilePath = path.resolve(__dirname, '..', testFile);
        
        // Check if test file exists
        if (!fs.existsSync(testFilePath)) {
          console.error(`Error: Test file not found: ${testFilePath}`);
          process.exit(1);
        }
        
        // Get error message or test results if provided
        let errorMessage: string | undefined;
        let testResults: string | undefined;
        
        if (resultsFile) {
          const resultsPath = path.resolve(__dirname, '..', resultsFile);
          
          if (!fs.existsSync(resultsPath)) {
            console.error(`Error: Results file not found: ${resultsPath}`);
            process.exit(1);
          }
          
          const results = fs.readFileSync(resultsPath, 'utf8');
          
          if (action === 'fix') {
            errorMessage = results;
          } else if (action === 'optimize') {
            testResults = results;
          }
        }
        
        // Maintain the test
        console.log(`Maintaining test: ${testFilePath}`);
        console.log(`Action: ${action}`);
        
        await maintainer.maintainTest({
          testFilePath,
          errorMessage,
          testResults,
          action: action as 'fix' | 'optimize' | 'document' | 'refactor'
        });
        
        console.log('Test maintenance completed successfully');
        break;
        
      case 'analyze':
        if (!testDir) {
          console.error('Error: --dir parameter is required for analyze action');
          printUsage();
          process.exit(1);
        }
        
        // Get absolute path to test directory
        const testDirPath = path.resolve(__dirname, '..', testDir);
        
        // Check if directory exists
        if (!fs.existsSync(testDirPath)) {
          console.error(`Error: Test directory not found: ${testDirPath}`);
          process.exit(1);
        }
        
        // Analyze test coverage
        console.log(`Analyzing test coverage for: ${testDirPath}`);
        
        const analysis = await maintainer.analyzeTestCoverage(testDirPath);
        
        // Save analysis to file
        const analysisFile = path.join(testDirPath, 'coverage-analysis.md');
        fs.writeFileSync(analysisFile, analysis);
        
        console.log(`Analysis saved to: ${analysisFile}`);
        break;
        
      default:
        console.error(`Error: Unsupported action: ${action}`);
        printUsage();
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

function printUsage() {
  console.log(`
Usage:
  ts-node maintain-tests.ts --action=fix|optimize|document|refactor|analyze [options]

Options:
  --action    Action to perform (required)
  --test      Path to test file (required for fix, optimize, document, refactor)
  --results   Path to test results file (required for fix, optimize)
  --dir       Directory containing tests (required for analyze)

Examples:
  ts-node maintain-tests.ts --action=fix --test=tests/api/api.spec.ts --results=test-results/results.json
  ts-node maintain-tests.ts --action=analyze --dir=tests/api
  `);
}

// Run the script
main().catch(console.error);
