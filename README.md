# Playwright Web Automation Framework

A future-ready Playwright test automation framework with AI capabilities, supporting multiple applications, environments, and test types.

## Features

- **Multi-Application Support**: Organize tests by application with separate page objects, test data, and tests
- **Environment-Based Configuration**: Run tests against different environments (QA, Staging, Production)
- **Multiple Test Types**: Support for E2E, API, Performance, and Visual tests
- **YAML Test Data**: Environment-specific test data in YAML format
- **Comprehensive Reporting**: JUnit XML and HTML reports saved in application-specific directories
- **AI Integration**: Components for AI-driven test generation, maintenance, and optimization
- **Accessibility Testing**: Built-in accessibility scanning with axe-core
- **Performance Metrics**: Capture and analyze page performance metrics
- **Visual Testing**: Compare screenshots against baselines for visual regression testing

## Project Structure

```
playwright-web-automation/
├── apps/
│   ├── generic/
│   │   ├── pages/
│   │   ├── testdata/
│   │   └── tests/
│   │       ├── api/
│   │       ├── e2e/
│   │       ├── performance/
│   │       └── visual/
│   └── sauce-demo/
│       ├── pages/
│       │   ├── SauceLoginPage.ts
│       │   ├── SauceInventoryPage.ts
│       │   ├── SauceCartPage.ts
│       │   └── SauceCheckoutPage.ts
│       ├── testdata/
│       │   ├── users.yaml
│       │   └── products.yaml
│       └── tests/
│           ├── accessibility/
│           ├── e2e/
│           ├── performance/
│           └── visual/
├── core-framework/
│   ├── ai-integration/
│   │   ├── AITestGenerator.ts
│   │   ├── AITestMaintainer.ts
│   │   └── OpenAIHelper.ts
│   ├── config/
│   │   ├── app-config.ts
│   │   ├── config.ts
│   │   ├── global-setup.ts
│   │   └── global-teardown.ts
│   ├── pages/
│   │   └── BasePage.ts
│   └── utils/
│       ├── AccessibilityUtils.ts
│       ├── ApiUtils.ts
│       ├── DataUtils.ts
│       ├── PerformanceUtils.ts
│       ├── ReportUtils.ts
│       └── VisualTestingUtils.ts
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install:deps
```

This will install all required npm packages and Playwright browsers.

## Configuration

The framework uses command-line parameters to determine which application and environment to test:

- `--app`: Specifies the application to test (e.g., sauce-demo, generic)
- `--env`: Specifies the environment to test against (e.g., qa, staging, prod)

Based on these parameters, the framework dynamically determines:
- Base URL for the application
- Base directory for test files
- Test results directory

## Running Tests

### Run all tests for Sauce Demo app in QA environment:

```bash
npm run test:sauce-demo
```

### Run specific test types:

```bash
# E2E tests
npm run test:sauce-demo:e2e

# Performance tests
npm run test:sauce-demo:performance

# Visual tests
npm run test:sauce-demo:visual

# Accessibility tests
npm run test:sauce-demo:accessibility
```

### Run tests with UI mode:

```bash
npm run test:ui -- --app=sauce-demo --env=qa
```

### Run tests with custom parameters:

```bash
npx playwright test --app=sauce-demo --env=staging
```

## Test Data

Test data is stored in YAML files with environment-specific sections:

```yaml
qa:
  standardUser:
    username: standard_user
    password: secret_sauce

staging:
  standardUser:
    username: staging_user
    password: staging_password
```

Load test data in tests using the DataUtils class:

```typescript
const userData = DataUtils.loadTestData('sauce-demo', 'users', CONFIG.env);
```

## Page Objects

The framework uses the Page Object Model pattern. All page objects extend the BasePage class:

```typescript
import { BasePage } from '../../../core-framework/pages/BasePage';

export class SauceLoginPage extends BasePage {
  // Page-specific selectors and methods
}
```

## AI Integration

The framework includes components for AI-driven test automation:

- **OpenAIHelper**: Interface with OpenAI APIs
- **AITestGenerator**: Generate test files and test data
- **AITestMaintainer**: Fix, optimize, and refactor tests

## Reports

Test results are saved in the application's directory:
- JUnit XML reports for CI integration
- HTML reports for human-readable results
- Custom performance and accessibility reports

View the HTML report:

```bash
npm run report
```

## Extending the Framework

### Adding a New Application

1. Create a new directory under `apps/`
2. Add page objects, test data, and tests
3. Update `app-config.ts` with the new application's URLs and paths

### Adding New Test Types

1. Create a new directory under the application's `tests/` directory
2. Implement tests using the appropriate utilities from the core framework

## Future Enhancements

- CI/CD integration
- Enhanced AI capabilities for test maintenance
- Mobile testing support
- Cross-browser testing configuration
- Test data generation with AI
