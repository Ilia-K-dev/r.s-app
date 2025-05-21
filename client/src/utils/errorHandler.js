// File: client/src/utils/errorHandler.js
// Date: 2025-05-18 05:37:47
// Description: Centralized utility for handling errors, with feature toggle awareness, automatic fallback logic, and basic error tracking per feature flag.
// Reasoning: Provides a consistent way to process errors, map them to user-friendly messages, log them with context (including feature toggle state), and implement automatic fallback for persistent errors associated with feature flags.
// Potential Optimizations: Integrate with a dedicated logging/error tracking service (e.g., Sentry). Refine fallback logic, error thresholds, and implement a robust gradual recovery system.

import { FirebaseError } from 'firebase/app';
import { isFeatureEnabled, disableFeature } from '../core/config/featureFlags'; // Import feature toggle utilities

// Map Firebase error codes to user-friendly messages
const firebaseErrorMessages = {
  // Auth Errors
  'auth/email-already-in-use': 'This email address is already in use.',
  'auth/invalid-email': 'The email address is invalid.',
  'auth/operation-not-allowed': 'Email/password sign in is not enabled.',
  'auth/weak-password': 'The password is too weak.',
  'auth/user-disabled': 'This user account has been disabled.',
  'auth/user-not-found': 'No user found with this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/popup-closed-by-user': 'Authentication popup closed.',
  'auth/cancelled-popup-request': 'Multiple authentication popups.',
  'auth/popup-blocked': 'Authentication popup blocked by browser.',
  'auth/network-request-failed': 'Network error. Please try again.',
  'auth/requires-recent-login': 'Please log in again to perform this action.',

  // Firestore Errors
  'permission-denied': 'You do not have permission to perform this action.',
  'not-found': 'The requested document was not found.',
  'unavailable': 'The service is currently unavailable. Please try again later.',
  'cancelled': 'The operation was cancelled.',
  'unknown': 'An unknown error occurred.',
  'invalid-argument': 'Invalid argument provided.',
  'deadline-exceeded': 'The operation timed out.',
  'resource-exhausted': 'Resource exhausted. You may have exceeded your quota.',
  'internal': 'An internal error occurred.',
  'unauthenticated': 'You must be authenticated to perform this action.',

  // Storage Errors
  'storage/unauthorized': 'You do not have permission to access this file.',
  'storage/canceled': 'The upload/download was cancelled.',
  'storage/unknown': 'An unknown error occurred during storage operation.',
  'storage/object-not-found': 'The requested file was not found.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  'storage/unauthenticated': 'You must be authenticated to perform storage operations.',
  'storage/cannot-slice-blob': 'File is too large or corrupted.',

  // Default message for unhandled Firebase errors
  'default-firebase': 'An unexpected Firebase error occurred.',
  // Default message for non-Firebase errors
  'default-general': 'An unexpected error occurred.',
  // Message for automatic fallback
  'automatic-fallback': 'Persistent errors detected. Falling back to API.',
};

// Track consecutive errors per feature flag for automatic disabling
const featureFlagErrorCounts = {};
const ERROR_THRESHOLD = 3; // Number of consecutive errors before automatic disabling

/**
 * Handles errors, logs them with context and feature toggle state,
 * implements automatic disabling for persistent errors associated with feature flags,
 * and returns a user-friendly message.
 * @param {Error} error The error object.
 * @param {string} context Optional context for logging (e.g., "Login", "Fetching Receipts").
 * @param {string} [featureName] Optional name of the feature flag associated with this operation.
 * @returns {string} A user-friendly error message.
 */
export const handleError = (error, context = 'Application', featureName = null) => {
  const featureEnabled = featureName ? isFeatureEnabled(featureName) : undefined; // Check flag state if featureName is provided
  console.error(`[${context} Error]${featureName ? ` Feature Flag (${featureName}) Enabled: ${featureEnabled}` : ''}`, error); // Log the full error with toggle state

  let userMessage = firebaseErrorMessages['default-general'];
  let isFirebaseError = false;

  if (error instanceof FirebaseError) {
    isFirebaseError = true;
    const errorCode = error.code;
    userMessage = firebaseErrorMessages[errorCode] || firebaseErrorMessages['default-firebase'];
    console.error(`[${context} Firebase Error] Code: ${errorCode}, Message: ${error.message}`);
  } else if (error instanceof Error) {
    // Handle standard JavaScript errors or errors thrown from other parts of the app
    console.error(`[${context} General Error] Message: ${error.message}`);
    userMessage = error.message || firebaseErrorMessages['default-general'];
  } else {
    // Handle cases where the thrown value is not an Error object
    console.error(`[${context} Unknown Error]`, error);
    userMessage = firebaseErrorMessages['default-general'];
  }

  // --- Automatic Disabling Logic ---
  if (featureName && featureEnabled) {
    // Increment error count for this feature flag
    featureFlagErrorCounts[featureName] = (featureFlagErrorCounts[featureName] || 0) + 1;
    console.warn(`[${context} Error] Consecutive errors for feature "${featureName}": ${featureFlagErrorCounts[featureName]}`);

    if (featureFlagErrorCounts[featureName] >= ERROR_THRESHOLD) {
      console.error(`[${context} Error] Error threshold reached (${ERROR_THRESHOLD}) for feature "${featureName}". Automatically disabling flag.`);
      disableFeature(featureName); // Automatically disable the feature flag
      userMessage = firebaseErrorMessages['automatic-fallback']; // Provide fallback message
      // Reset error count after disabling
      featureFlagErrorCounts[featureName] = 0;
      console.warn(`[Feature Flag State Change] Feature "${featureName}" has been automatically disabled due to persistent errors.`);
      // TODO: Implement notification system (e.g., send alert to monitoring)
    }
  } else if (featureName && !featureEnabled) {
     // If the feature was already disabled, reset its error count
     featureFlagErrorCounts[featureName] = 0;
  } else {
      // If no featureName is provided, reset all counts (or handle differently based on strategy)
      // For now, we'll just not track/disable if no featureName is given
  }

  // TODO: Implement Gradual Recovery System
  // If a flag was auto-disabled, periodically check if the underlying issue is resolved
  // and gradually re-enable the flag for a small percentage of users/requests.

  return userMessage;
};

// Helper function to handle non-Firebase errors if needed separately, or can use handleError
export const handleGeneralError = (error, context = 'Application') => {
   console.error(`[${context} General Error]`, error);
   let userMessage = firebaseErrorMessages['default-general'];
   if (error instanceof Error) {
      userMessage = error.message || userMessage;
   }
   return userMessage;
};


// Add comments about tracking errors per feature flag, logging toggle state, automatic disabling, and gradual recovery placeholder
// Tracking errors per feature flag: The `featureFlagErrorCounts` object tracks consecutive errors for each unique `featureName` provided to `handleError`.
// Logging toggle state: The current state of the associated feature flag is logged along with every error to provide context for debugging.
// Automatic disabling logic: If a `featureName` is provided and the corresponding feature flag is enabled, a counter for that flag is incremented when an error occurs. If the counter reaches `ERROR_THRESHOLD` consecutive errors, the feature flag is automatically disabled via `disableFeature`, and a specific fallback message is returned. This provides a basic automatic rollback mechanism in case of persistent issues with a feature-flagged implementation. The counter is reset for a feature flag if it is disabled or if the error handling is called without a featureName.
// Gradual Recovery System: A placeholder comment indicates the need for a system to periodically attempt to re-enable auto-disabled flags, potentially for a small percentage of traffic, to check if the issue is resolved and gradually recover. This is not yet implemented.
// Notifications: A console warning is logged when a feature flag is automatically disabled. This should be replaced with or augmented by a proper notification system (e.g., sending alerts to monitoring or logging services).
