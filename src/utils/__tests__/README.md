# Utility Function Tests

This directory contains comprehensive unit tests for all utility functions in the PyQuiz Admin Web Application.

## Test Coverage

Current test coverage for utilities: **76.84%**

### Tested Modules

1. **validation.ts** (93.1% coverage)
   - Email validation
   - Password validation and strength checking
   - URL validation
   - Required field validation
   - Number validation (positive, range, year)
   - File validation (size, type)
   - Bilingual content validation
   - Question and quiz validation
   - CSV header validation
   - HTML sanitization
   - Object string trimming

2. **formatting.ts** (79.1% coverage)
   - Date and time formatting
   - Number formatting with commas
   - Percentage formatting
   - Duration formatting (minutes to hours)
   - File size formatting (bytes to GB)
   - Text manipulation (truncate, capitalize, title case, slugify)
   - Difficulty, quiz type, and scope formatting
   - Report type and status formatting
   - Color coding for difficulty, status, and accuracy
   - Bilingual text formatting
   - PYQ metadata formatting
   - User name and score formatting

3. **csv.ts** (63.2% coverage)
   - CSV template generation
   - CSV parsing with proper handling of quoted values
   - Question row validation
   - CSV row to structured question data conversion
   - Handling of PYQ questions
   - Support for 2-6 options per question

4. **errorHandling.ts** (68.75% coverage)
   - Application error creation
   - Supabase error parsing (PostgreSQL error codes)
   - API error parsing (HTTP status codes)
   - Async error handling with tuple return
   - Retry with exponential backoff
   - Network and auth error detection
   - Error status code extraction
   - Validation error formatting
   - Safe JSON parsing with fallback

5. **permissions.ts** (100% coverage)
   - Permission checking by role
   - Role-based access control
   - Super admin detection
   - Content management permissions
   - Question editing permissions
   - Role display name formatting

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

Each test file follows this structure:

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../module';

describe('module name', () => {
  describe('functionName', () => {
    it('should handle valid input', () => {
      expect(functionToTest(validInput)).toBe(expectedOutput);
    });

    it('should handle invalid input', () => {
      expect(functionToTest(invalidInput)).toBe(expectedOutput);
    });

    it('should handle edge cases', () => {
      expect(functionToTest(edgeCase)).toBe(expectedOutput);
    });
  });
});
```

## Test Principles

1. **Comprehensive Coverage**: Test all code paths including success, failure, and edge cases
2. **Clear Descriptions**: Use descriptive test names that explain what is being tested
3. **Isolated Tests**: Each test should be independent and not rely on other tests
4. **Minimal Mocking**: Avoid mocks when possible to test real functionality
5. **Fast Execution**: Keep tests fast by avoiding unnecessary async operations

## Adding New Tests

When adding new utility functions:

1. Create a corresponding test file in `__tests__/` directory
2. Follow the existing test structure and naming conventions
3. Aim for at least 80% code coverage
4. Test both happy paths and error cases
5. Include edge cases and boundary conditions
6. Update this README with the new module

## Coverage Goals

- **Utilities**: 80%+ coverage (currently 76.84%)
- **Critical functions**: 90%+ coverage
- **Type definitions**: Not required (mostly interfaces)

## Uncovered Areas

The following areas have lower coverage and may need additional tests:

1. **csv.ts**: Export functions and some edge cases in parsing
2. **errorHandling.ts**: Some error handling branches and retry logic
3. **formatting.ts**: Date formatting with dayjs plugins

## Future Improvements

- Add property-based testing for validation functions
- Add integration tests for CSV import/export workflow
- Add performance tests for large data transformations
- Add tests for browser-specific APIs (File, Blob, etc.)
