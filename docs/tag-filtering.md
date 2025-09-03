# Tag Filtering in Playwright Tests

This document explains how to use tag filtering in the Playwright test framework to run specific tests based on tags.

## Overview

Tag filtering allows you to selectively run tests based on tags applied to test cases or test groups. This is useful for:

- Running only smoke tests for quick validation
- Running regression tests for comprehensive testing
- Targeting specific features or areas of the application
- Separating tests by type (e.g., visual, performance, e2e)

## How to Apply Tags to Tests

Playwright has built-in support for tags using the `@` symbol in test titles. You can add tags to both individual tests and test groups.

### Example Usage

```typescript
import { test } from '@playwright/test';

// Apply tags to a test.describe block
test.describe('@e2e @checkout Checkout Flow', () => {
  
  // Apply a single tag to a test
  test('@smoke Standard user should be able to complete checkout', async ({ page }) => {
    // Test code
  });
  
  // Apply a regression tag
  test('@regression Complete checkout with multiple items', async ({ page }) => {
    // Test code
  });
  
  // Apply multiple tags
  test('@validation @regression Validate checkout information validation', async ({ page }) => {
    // Test code
  });
});
```

## Common Tag Types

Consider using these common tag types in your tests:

- `@smoke` - Critical path tests that verify core functionality
- `@regression` - More comprehensive tests for regression testing
- `@e2e` - End-to-end tests that cover complete user flows
- `@visual` - Tests that focus on visual aspects of the application
- `@performance` - Tests that measure performance metrics
- `@validation` - Tests that focus on form validation and error handling
- `@api` - Tests that focus on API functionality
- `@feature-name` - Tags specific to features (e.g., `@checkout`, `@login`)

## Running Tests with Tag Filtering

You can run tests with specific tags using the command line or environment variables:

### Using Command Line

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run tests with multiple tags (OR condition)
npx playwright test --grep "@smoke|@regression"

# Run tests with specific tags (AND condition)
npx playwright test --grep "@regression" --grep "@checkout"

# Run tests excluding specific tags
npx playwright test --grep-invert "@visual"
```

### Using Environment Variables

Our framework also supports tag filtering through the configuration system:

```bash
# Run only smoke tests
TAGS=smoke npx playwright test

# Run multiple tag types
TAGS=smoke,regression npx playwright test
```

## How It Works

1. Tags are applied to test titles using the `@` symbol
2. When running tests, the specified tags are parsed from command line arguments or environment variables
3. The Playwright configuration creates a grep pattern to match tests with the specified tags
4. Only tests with matching tags are executed

## Best Practices

- Use consistent tag naming conventions
- Apply tags at both the test.describe level and individual test level as appropriate
- Use specific tags for features and broader tags for test types
- Combine tags to create more specific test subsets
- Document the available tags in your project
- Consider creating npm scripts for common tag combinations:
  ```json
  "scripts": {
    "test:smoke": "playwright test --grep @smoke",
    "test:regression": "playwright test --grep @regression"
  }
  ```
