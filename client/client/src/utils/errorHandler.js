// File: client/src/utils/errorHandler.js
import { disableFeature, isFeatureEnabled } from '../core/config/featureFlags';

// Error counts for automatic fallback
const errorCounts = {};
const ERROR_THRESHOLD = 3; // Number of consecutive errors before automatic fallback

/**
 * Reset error count for a specific context
 * @param {string} context - The context to reset error count for
 */
export const resetErrorCount = (context) => {
  if (errorCounts[context]) {
    errorCounts[context] = 0;
  }
};

/**
 * Handle Firebase errors with contextual information
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred (e.g., 'Receipt Service', 'Auth Service')
 * @param {string} [featureFlag] - Feature flag to disable on repeated errors
 * @param {boolean} [throwError=true] - Whether to throw the error after handling
 * @returns {Error} The original error for further handling
 */
export const handleFirebaseError = (error, context, featureFlag = null, throwError = true) => {
  // Initialize error count for context if needed
  if (!errorCounts[context]) {
    errorCounts[context] = 0;
  }

  // Increment error count for this context
  errorCounts[context]++;

  // Get a user-friendly message based on Firebase error code
  const userMessage = getUserFriendlyMessage(error);

  // Log error with context
  console.error(`[${context}] ${userMessage}`, {
    code: error.code,
    message: error.message,
    context,
    timestamp: new Date().toISOString(),
    featureFlag: featureFlag || 'none',
    featureFlagEnabled: featureFlag ? isFeatureEnabled(featureFlag) : false
  });

  // Automatic feature toggle fallback if threshold exceeded
  if (featureFlag && isFeatureEnabled(featureFlag) && errorCounts[context] >= ERROR_THRESHOLD) {
    console.warn(`Disabling ${featureFlag} due to repeated errors in ${context}`);
    disableFeature(featureFlag);
    errorCounts[context] = 0; // Reset error count after fallback
  }

  // Create a new error with the user-friendly message
  const enhancedError = new Error(userMessage);
  enhancedError.originalError = error;
  enhancedError.code = error.code;
  enhancedError.context = context;

  // Rethrow error if needed
  if (throwError) {
    throw enhancedError;
  }

  return enhancedError;
};

/**
 * Get a user-friendly message based on Firebase error code
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
const getUserFriendlyMessage = (error) => {
  // Handle Firebase Auth errors
  if (error.code?.startsWith('auth/')) {
    switch (error.code) {
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use a stronger password.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email but different sign-in credentials.';
      case 'auth/requires-recent-login':
        return 'This operation requires recent authentication. Please log in again.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/operation-not-allowed':
        return 'This operation is not allowed.';
      case 'auth/popup-closed-by-user':
        return 'The authentication popup was closed before completing the sign-in.';
      default:
        return `Authentication error: ${error.message}`;
    }
  }

  // Handle Firestore errors
  if (error.code?.startsWith('firestore/')) {
    switch (error.code) {
      case 'firestore/permission-denied':
        return 'You don\'t have permission to access this data.';
      case 'firestore/not-found':
        return 'The requested document was not found.';
      case 'firestore/already-exists':
        return 'The document already exists.';
      case 'firestore/data-loss':
        return 'The operation resulted in unrecoverable data loss.';
      case 'firestore/failed-precondition':
        return 'Operation was rejected because the system is not in a state required for the operation\'s execution.';
      case 'firestore/aborted':
        return 'The operation was aborted.';
      case 'firestore/cancelled':
        return 'The operation was cancelled.';
      case 'firestore/invalid-argument':
        return 'Client specified an invalid argument.';
      case 'firestore/deadline-exceeded':
        return 'Deadline expired before operation could complete.';
      case 'firestore/resource-exhausted':
        return 'Resource has been exhausted (e.g. Firestore quota exceeded).';
      case 'firestore/unavailable':
        return 'The service is currently unavailable. Please try again later.';
      case 'firestore/internal':
        return 'An internal error occurred. Please try again later.';
      case 'firestore/unimplemented':
        return 'Operation is not implemented or not supported.';
      default:
        return `Database error: ${error.message}`;
    }
  }

  // Handle Storage errors
  if (error.code?.startsWith('storage/')) {
    switch (error.code) {
      case 'storage/object-not-found':
        return 'The requested file does not exist.';
      case 'storage/unauthorized':
        return 'You don\'t have permission to access this file.';
      case 'storage/canceled':
        return 'File operation was canceled.';
      case 'storage/unknown':
        return 'An unknown error occurred with file operation.';
      case 'storage/invalid-argument':
        return 'An invalid argument was provided to the file operation.';
      case 'storage/quota-exceeded':
        return 'Storage quota has been exceeded.';
      case 'storage/retry-limit-exceeded':
        return 'The maximum retry time has been exceeded.';
      case 'storage/invalid-checksum':
        return 'File on the client does not match the checksum of the file received by the server.';
      case 'storage/server-file-wrong-size':
        return 'File on the client does not match the size of the file received by the server.';
      default:
        return `Storage error: ${error.message}`;
    }
  }

  // Handle network errors
  if (error.message?.toLowerCase().includes('network') ||
      error.code === 'failed-precondition' ||
      error.message?.toLowerCase().includes('offline')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Handle timeout errors
  if (error.message?.toLowerCase().includes('timeout') ||
      error.code === 'deadline-exceeded') {
    return 'The operation timed out. Please try again later.';
  }

  // Handle permission errors
  if (error.message?.toLowerCase().includes('permission') ||
      error.code === 'permission-denied') {
    return 'You don\'t have permission to perform this action.';
  }

  // Default message
  return error.message || 'An unexpected error occurred.';
};

/**
 * Handle Firebase Authentication errors
 * @param {Error} error - The error object
 * @param {string} [context='Authentication'] - Context where the error occurred
 * @param {boolean} [throwError=true] - Whether to throw the error after handling
 * @returns {Error} The original error for further handling
 */
export const handleAuthError = (error, context = 'Authentication', throwError = true) => {
  return handleFirebaseError(error, context, 'firebaseDirectIntegration', throwError);
};

/**
 * Handle Firestore errors
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {string} [featureFlag] - Feature flag to disable on repeated errors
 * @param {boolean} [throwError=true] - Whether to throw the error after handling
 * @returns {Error} The original error for further handling
 */
export const handleFirestoreError = (error, context, featureFlag = null, throwError = true) => {
  return handleFirebaseError(error, context, featureFlag, throwError);
};

/**
 * Handle Storage errors
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {string} [featureFlag] - Feature flag to disable on repeated errors
 * @param {boolean} [throwError=true] - Whether to throw the error after handling
 * @returns {Error} The original error for further handling
 */
export const handleStorageError = (error, context, featureFlag = null, throwError = true) => {
  return handleFirebaseError(error, context, featureFlag, throwError);
};

// Export individual functions for named imports
export {
  handleFirebaseError,
  handleAuthError,
  handleFirestoreError,
  handleStorageError,
  resetErrorCount,
  getUserFriendlyMessage
};

// Export default object for default imports
export default {
  handleFirebaseError,
  handleAuthError,
  handleFirestoreError,
  handleStorageError,
  resetErrorCount,
  getUserFriendlyMessage
};
