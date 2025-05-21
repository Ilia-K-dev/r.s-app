/**
 * Helper to create a properly structured mock for both CommonJS and ESM modules
 *
 * @param {Object} mockExports - The mock exports object
 * @returns {Object} - A properly structured mock object for Jest
 */
function createMock(mockExports) {
  const mock = { ...mockExports };

  // Add ESM compatibility
  mock.__esModule = true;

  return mock;
}

module.exports = createMock;
