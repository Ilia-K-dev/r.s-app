// client/src/core/config/featureFlags.js

import { openDB } from 'idb';

// IndexedDB configuration
const DB_NAME = 'featureFlagsDB';
const DB_VERSION = 1;
const STORE_NAME = 'flags';
const FLAGS_KEY = 'currentFlags'; // Key to store the main flags object in IndexedDB

// Default feature flags
const DEFAULT_FLAGS = {
  firebaseDirectIntegration: false, // Default state: Firebase direct integration is off
  analyticsDirectIntegration: false, // Default state: Analytics direct integration is off
  documentsDirectIntegration: false, // Default state: Documents direct integration is off
};

let featureFlags = {}; // In-memory cache of feature flags
let db = null; // IndexedDB database instance

// Performance timing for feature flags
const performanceTimers = {};

// Initialize IndexedDB
const initDatabase = async () => {
  if (db) return db;
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (oldVersion < 1) {
        // Create an object store for flags
        const store = db.createObjectStore(STORE_NAME);
        // You could add indexes here if needed, e.g., store.createIndex('by-name', 'name');
      }
    },
  });
  return db;
};

// Load feature flags from IndexedDB
const loadFeatureFlags = async () => {
  try {
    const db = await initDatabase();
    const savedData = await db.get(STORE_NAME, FLAGS_KEY);

    if (savedData && savedData.flags) {
      featureFlags = { ...DEFAULT_FLAGS, ...savedData.flags };
      console.log('Feature flags loaded from IndexedDB:', featureFlags);
    } else {
      featureFlags = { ...DEFAULT_FLAGS };
      console.log('No feature flags found in IndexedDB, using defaults:', featureFlags);
      // Save defaults to IndexedDB
      await saveFeatureFlags();
    }
  } catch (error) {
    console.error('Error loading feature flags from IndexedDB:', error);
    featureFlags = { ...DEFAULT_FLAGS }; // Fallback to default if IndexedDB fails
    console.log('Falling back to default feature flags due to IndexedDB error:', featureFlags);
  }
};

// Save feature flags to IndexedDB
const saveFeatureFlags = async () => {
  try {
    const db = await initDatabase();
    const timestamp = new Date().toISOString();
    // In a real app, you might get the current user ID here
    const auditInfo = { timestamp, userId: 'anonymous' }; // Placeholder user ID

    const dataToSave = {
      flags: featureFlags,
      version: DB_VERSION, // Simple versioning based on DB version
      audit: auditInfo,
    };

    await db.put(STORE_NAME, dataToSave, FLAGS_KEY);
    console.log('Feature flags saved to IndexedDB:', featureFlags);

    // Signal changes across tabs using localStorage (key change event)
    // We don't store data here, just trigger the 'storage' event
    localStorage.setItem(LOCAL_STORAGE_KEY_SIGNAL, Date.now().toString());

  } catch (error) {
    console.error('Error saving feature flags to IndexedDB:', error);
  }
};

// Key for signaling changes across tabs via localStorage
const LOCAL_STORAGE_KEY_SIGNAL = 'featureFlagsChangeSignal';

// Listen for changes signaled from other tabs
window.addEventListener('storage', (event) => {
  if (event.key === LOCAL_STORAGE_KEY_SIGNAL) {
    console.log('Feature flags change signaled from another tab. Reloading...');
    loadFeatureFlags(); // Reload flags from IndexedDB
  }
});

// Load flags when the script is first executed
loadFeatureFlags();

/**
 * Tracks the usage of a feature flag.
 * @param {string} featureName - The name of the feature.
 */
const trackFeatureUsage = (featureName) => {
  console.log(`[Feature Flag Usage] Checked: ${featureName}`);
  // TODO: Integrate with actual analytics platform (e.g., Google Analytics, Sentry)
  // Example: analytics.track('feature_flag_checked', { featureName, enabled: featureFlags[featureName] });
};

/**
 * Starts a performance timer for a feature flag.
 * @param {string} featureName - The name of the feature.
 */
export const startPerformanceTimer = (featureName) => {
  if (typeof performance !== 'undefined' && performance.now) {
    performanceTimers[featureName] = performance.now();
    console.log(`[Feature Flag Performance] Timer started for: ${featureName}`);
  } else {
    console.warn('[Feature Flag Performance] Performance timing not available.');
  }
};

/**
 * Stops a performance timer for a feature flag and logs the duration.
 * @param {string} featureName - The name of the feature.
 */
export const stopPerformanceTimer = (featureName) => {
  if (typeof performance !== 'undefined' && performance.now && performanceTimers[featureName]) {
    const duration = performance.now() - performanceTimers[featureName];
    console.log(`[Feature Flag Performance] Timer stopped for: ${featureName}, Duration: ${duration.toFixed(2)}ms`);
    // TODO: Send duration to analytics/performance monitoring platform
    // Example: analytics.track('feature_flag_performance', { featureName, duration });
    delete performanceTimers[featureName]; // Clean up the timer
  } else if (typeof performance !== 'undefined' && performance.now) {
     console.warn(`[Feature Flag Performance] Timer not found for: ${featureName}`);
  }
};


/**
 * Checks if a specific feature is enabled.
 * @param {string} featureName - The name of the feature.
 * @returns {boolean} - True if the feature is enabled, false otherwise.
 */
export const isFeatureEnabled = (featureName) => {
  // Track usage whenever a flag is checked
  trackFeatureUsage(featureName);
  // Use the in-memory cache
  return !!featureFlags[featureName];
};

/**
 * Enables a specific feature.
 * @param {string} featureName - The name of the feature.
 */
export const enableFeature = async (featureName) => {
  if (featureFlags[featureName] === true) {
    console.log(`Feature "${featureName}" is already enabled.`);
    return;
  }
  featureFlags = { ...featureFlags, [featureName]: true };
  console.log(`Feature "${featureName}" enabled.`);
  await saveFeatureFlags();
};

/**
 * Disables a specific feature.
 * @param {string} featureName - The name of the feature.
 */
export const disableFeature = async (featureName) => {
  if (featureFlags[featureName] === false) {
    console.log(`Feature "${featureName}" is already disabled.`);
    return;
  }
  featureFlags = { ...featureFlags, [featureName]: false };
  console.log(`Feature "${featureName}" disabled.`);
  await saveFeatureFlags();
};

/**
 * Gets the current state of all feature flags.
 * @returns {object} - An object containing all feature flags and their states.
 */
export const getAllFeatureFlags = () => {
  // Return a copy of the in-memory cache
  return { ...featureFlags };
};

// Add comments about purpose and design
// Purpose: To provide a centralized system for controlling the visibility and behavior of features during development and rollout, with robust persistence, versioning, auditing, and basic analytics/performance tracking using IndexedDB and console logging.
// Design: Uses IndexedDB for persistent storage of feature flag states, version information, and audit logs. Maintains an in-memory cache (`featureFlags`) for quick access. Changes are synchronized across tabs using a localStorage signaling mechanism. Provides utility functions for checking, enabling, and disabling features, which update both the in-memory cache and IndexedDB. Includes basic console logging for feature usage tracking and performance timing, with placeholders for integration with dedicated analytics platforms.
// How to add new feature toggles: Add a new key-value pair to the `DEFAULT_FLAGS` object. The system will automatically handle loading, saving, and persistence for new flags added to the defaults. Add a description in `FeatureToggles.js`.
// Persistence: Feature flags are stored in an IndexedDB database named 'featureFlagsDB' in an object store named 'flags'. The main flags object is stored under the key 'currentFlags'.
// Versioning: A simple version number (`DB_VERSION`) is stored along with the flags. More complex versioning or migration logic can be added in the `upgrade` function of `openDB`.
// Auditing: Each save operation records a timestamp and a placeholder user ID (should be replaced with actual user ID in an authenticated context) in the audit field.
// Synchronization: A change to feature flags in one tab triggers a `storage` event in other tabs by writing a timestamp to a specific localStorage key (`featureFlagsChangeSignal`). The event listener in other tabs then reloads the flags from IndexedDB, ensuring all tabs are eventually consistent.
// Analytics: Basic usage tracking is implemented by logging to the console whenever `isFeatureEnabled` is called. Performance timing can be measured for specific code blocks using `startPerformanceTimer` and `stopPerformanceTimer`, with results logged to the console. These should be integrated with a proper analytics/performance monitoring platform for production use.
