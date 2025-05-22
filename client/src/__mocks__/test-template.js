/**
 * Template for creating new test files with consistent mocking approach
 *
 * Usage:
 * 1. Copy this template to your test file
 * 2. Replace the import statements with your actual imports
 * 3. Replace the mock implementations with your specific mocks
 * 4. Implement your actual test cases
 */

// Import the module to test
import { someService } from '../path/to/service';

// Mock dependencies
jest.mock('../../path/to/dependency1', () => ({
  dependency1Function: jest.fn(),
  dependency1Object: {}
}));

jest.mock('../../path/to/dependency2', () => ({
  dependency2Function: jest.fn(),
  dependency2Object: {}
}));

// Mock any global functions needed by your tests
global.someGlobalFunction = jest.fn();

describe('Module Name', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Add your test cases
  it('should do something', () => {
    // Arrange
    // Act
    // Assert
    expect(true).toBe(true);
  });
});
