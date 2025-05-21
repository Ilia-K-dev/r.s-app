# Testing Guide for Receipt Scanner

## Overview

This guide provides instructions and best practices for writing tests for the Receipt Scanner application.

## Mock Approach

We use two different mocking approaches depending on the complexity of the test:

1. **Global Mocks (setupTests.js)**: For simple tests that don't need specialized mocking.
2. **Direct Module Mocking**: For tests that need more control over mock behavior.

## Writing a New Test

### Basic Test Structure

```js
// Import the module to test
import { myService } from '../services/myService';

// Import the test helper
const {
  createMock,
  // Import other helpers as needed...
} = require('../../../__mocks__/testHelper');

// Mock dependencies before importing the module under test
jest.mock('path/to/dependency', () => ({
  someFunction: jest.fn()
}));

describe('My Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', () => {
    // Arrange
    // Act
    // Assert
    expect(true).toBe(true);
  });
});
```

### Common Mocking Patterns

#### Mocking Firebase

```js
// Import helpers
const {
  mockUser,
  createFirestoreMocks,
  createStorageMocks
} = require('../../../__mocks__/testHelper');

// Create mocks
const firestoreMocks = createFirestoreMocks();
const storageMocks = createStorageMocks();

// Mock Firebase modules
jest.mock('firebase/firestore', () => firestoreMocks);
jest.mock('firebase/storage', () => storageMocks);
jest.mock('../../../core/config/firebase', () => ({
  auth: { currentUser: mockUser },
  db: {},
  storage: {}
}));
```

#### Mocking Feature Flags

```js
const { createFeatureFlagMocks } = require('../../../__mocks__/testHelper');
const featureFlagMocks = createFeatureFlagMocks(['flagName']);
jest.mock('../../../core/config/featureFlags', () => featureFlagMocks);
```

#### Mocking Error Handler

```js
const { createErrorHandlerMocks } = require('../../../__mocks__/testHelper');
const errorHandlerMocks = createErrorHandlerMocks();
jest.mock('../../../utils/errorHandler', () => errorHandlerMocks);
```

## Troubleshooting

### Module Not Found Errors

If you see "Cannot find module" errors:
1. Check the path in your `jest.mock` calls
2. Ensure the module exists at the specified path
3. Try using `{ virtual: true }` as the third parameter to `jest.mock`

### Mock Function Not Called

If your assertions about mock function calls are failing:
1. Check that you're using `toHaveBeenCalled()` or `toHaveBeenCalledWith()`
2. Ensure the mock is properly set up and exported from the mock module
3. Verify the code under test is actually calling the function you're testing

### Import Order Issues

The order of imports and mocks is important:
1. Always set up mocks BEFORE importing the module under test
2. Clear mocks in `beforeEach` to ensure a clean state for each test
