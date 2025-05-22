// client/src/setupTests.js

// Import Jest DOM matchers
require('@testing-library/jest-dom');

// Import browser mocks
require('./__mocks__/browserMocks');

// Set up global mocks that all tests might need
global.preprocessImage = jest.fn(() => Promise.resolve('processed-image-data'));

// Set up mock clearing before each test
beforeEach(() => {
  jest.clearAllMocks();
});
