// File: server/tests/security/storage-only.test.js
// Date: 2025-05-17 05:42:42
// Description: Storage-only test file to isolate and diagnose Storage emulator connection issues.
// Reasoning: Provides a minimal test case focused solely on Storage to help troubleshoot connection problems.

const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const fs = require('fs');
const path = require('path');

describe('Storage-Only Test', () => {
  let testEnv;
  
  beforeAll(async () => {
    console.log('Setting up Storage-only test environment');
    
    // Get correct paths
    const storageRulesPath = path.resolve(__dirname, '../../../storage.rules');
    console.log(`Looking for Storage rules at: ${storageRulesPath}`);
    
    if (!fs.existsSync(storageRulesPath)) {
      console.error(`Storage rules file not found at ${storageRulesPath}`);
      throw new Error('Storage rules file not found');
    }
    
    // Hard-code the ports for direct testing
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      storage: {
        host: 'localhost',
        port: 9200, // Updated Storage emulator port based on user's terminal output
        rules: fs.readFileSync(storageRulesPath, 'utf8'),
      }
    });
    
    console.log('Storage test environment initialized');
  });
  
  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
      console.log('Test environment cleaned up');
    }
  });
  
  it('should connect to Storage emulator', async () => {
    console.log('Running basic Storage test');
    
    // Get unauthenticated Storage instance
    const storage = testEnv.unauthenticatedContext().storage();
    console.log('Got unauthenticated Storage instance');
    
    // Try a simple operation that should fail due to rules
    const testFile = Buffer.from('test file contents', 'utf8');
    
    try {
      console.log('Attempting Storage operation...');
      await assertFails(storage.ref('test/test-file.txt').put(testFile));
      console.log('Storage operation completed as expected (failed due to rules)');
    } catch (error) {
      console.error('Storage operation error:', error);
      throw error;
    }
  });
});
