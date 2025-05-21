// File: server/tests/security/helpers/auth.js
// Date: 2025-05-17 04:58:57
// Description: Authentication helper functions for Firebase security rules tests.
// Reasoning: Provides convenient functions to get authenticated and unauthenticated Firestore and Storage instances.

const { setupTestEnv } = require('./setup');

/**
 * Get a Firestore instance for an authenticated user
 * @param {string} uid - User ID to authenticate as
 * @returns {Object} Firestore instance
 */
function getAuthenticatedFirestore(testEnv, uid) {
  return testEnv.authenticatedContext(uid).firestore();
}

/**
 * Get an unauthenticated Firestore instance for testing
 * @returns {Object} Firestore instance
 */
function getUnauthenticatedFirestore(testEnv) {
  return testEnv.unauthenticatedContext().firestore();
}

/**
 * Get a Storage instance for an authenticated user
 * @param {string} uid - User ID to authenticate as
 * @returns {Object} Storage instance
 */
function getAuthenticatedStorage(testEnv, uid) {
  try {
    console.log(`Getting authenticated Storage for user: ${uid}`);
    const storage = testEnv.authenticatedContext(uid).storage();
    console.log('Successfully got authenticated Storage instance');
    return storage;
  } catch (error) {
    console.error('Error getting authenticated Storage:', error);
    throw error;
  }
}

/**
 * Get an unauthenticated Storage instance for testing
 * @returns {Object} Storage instance
 */
function getUnauthenticatedStorage(testEnv) {
  try {
    console.log('Getting unauthenticated Storage');
    const storage = testEnv.unauthenticatedContext().storage();
    console.log('Successfully got unauthenticated Storage instance');
    return storage;
  } catch (error) {
    console.error('Error getting unauthenticated Storage:', error);
    throw error;
  }
}

module.exports = {
  getAuthenticatedFirestore,
  getUnauthenticatedFirestore,
  getAuthenticatedStorage,
  getUnauthenticatedStorage
};
