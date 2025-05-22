/**
 * Firebase Test Environment Setup Helper
 * Date: 2025-05-18
 *
 * Provides utilities for setting up and managing Firebase test environments
 * specifically configured for IPv6 emulator connections.
 */
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { readFileSync } = require('fs');
const { resolve } = require('path');

// Define consistent PROJECT_ID used throughout tests
const PROJECT_ID = 'project-reciept-reader-id-test';

/**
 * Setup the Firebase test environment using environment variables
 * This approach bypasses URL parsing issues with IPv6 addresses
 * @param {string} projectId - Firebase project ID
 * @returns {Promise<Object>} - Initialized test environment
 */
async function setupTestEnv(projectId = PROJECT_ID) {
  console.log('Initializing Firebase test environment for security rules testing');

  try {
    // Set environment variables for emulator connection
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9100';

    // Log current environment settings
    console.log(`Using Firestore emulator at: ${process.env.FIRESTORE_EMULATOR_HOST}`);
    console.log(`Using Auth emulator at: ${process.env.FIREBASE_EMULATOR_HOST}`); // Corrected log message
    console.log(`Using Auth emulator at: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

    // Load Firestore rules
    const rulesPath = resolve(__dirname, '../../../../firestore.rules');
    const rules = readFileSync(rulesPath, 'utf8');
    console.log(`Loaded rules from ${rulesPath}`);

    // Initialize with environment variable approach
    const testEnv = await initializeTestEnvironment({
      projectId,
      firestore: { rules }
    });

    console.log('Test environment initialized successfully');
    return testEnv;
  } catch (error) {
    console.error('Failed to initialize test environment:', error);
    console.error(error.stack); // Print stack trace for better debugging
    throw error;
  }
}

/**
 * Clears all data in Firestore for testing
 * @param {Object} testEnv - Firebase test environment
 */
async function clearFirestore(testEnv) {
  console.log('Clearing Firestore data...');
  try {
    await testEnv.clearFirestore();
    console.log('Firestore data cleared.');
  } catch (error) {
    console.error('Error clearing Firestore:', error);
    throw error;
  }
}

/**
 * Cleans up the test environment
 * @param {Object} testEnv - Firebase test environment
 */
async function cleanupTestEnv(testEnv) {
  console.log('Cleaning up Firebase test environment...');
  try {
    await testEnv.cleanup();
    console.log('Test environment cleaned up.');
  } catch (error) {
    console.error('Error cleaning up test environment:', error);
    throw error;
  }
}

module.exports = {
  setupTestEnv,
  clearFirestore,
  cleanupTestEnv,
  PROJECT_ID
};
