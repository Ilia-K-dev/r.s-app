/**
 * Helper to debug Jest configuration and module resolution
 */
class DebugHelper {
  static logModuleResolution(moduleName) {
    console.log(`[Jest Debug] Attempting to resolve module: ${moduleName}`);
    try {
      // Logging the resolved module path would go here
      // This is just a placeholder as Jest doesn't expose this info directly
      console.log(`[Jest Debug] Module ${moduleName} resolution attempted`);
    } catch (error) {
      console.error(`[Jest Debug] Error resolving module ${moduleName}:`, error);
    }
  }

  static logMockStatus(mockName) {
    console.log(`[Jest Debug] Mock status for ${mockName}:`, {
      isMockFunction: typeof jest.isMockFunction === 'function' && jest.isMockFunction(global[mockName]),
      isDefined: global[mockName] !== undefined,
    });
  }
}

// Expose the helper globally
global.DebugHelper = DebugHelper;

module.exports = DebugHelper;
