import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';

import { db } from '../../../core/config/firebase';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import errorHandler from '../../../shared/utils/errorHandler'; // Import the error handler utility
// import { localCache } from '../../../shared/services/storage'; // Remove localCache import
import { getCache, setCache, invalidateCache } from '../../../shared/utils/cache'; // Import cache utility
import { logger } from '../../../shared/utils/logger';

const DEFAULT_SETTINGS = {
  notifications: {
    email: true,
    push: false,
    receiptUploads: true,
    monthlyReports: true,
    budgetAlerts: true,
  },
  display: {
    theme: 'light',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
  },
  receipts: {
    defaultCategory: null,
    autoCategories: true,
    saveImages: true,
    parseItems: true,
  },
  reports: {
    defaultDateRange: '30d',
    defaultGrouping: 'day',
    showBudget: true,
    charts: {
      preferredType: 'bar',
      colorScheme: 'default',
    },
  },
  categories: {
    showInactive: false,
    sortBy: 'name',
    budgetWarningThreshold: 80, // percentage
  },
  privacy: {
    shareAnalytics: true,
    storageConsent: true,
  },
};

/**
 * @typedef {object} UserSettings
 * @property {object} notifications - Notification settings.
 * @property {boolean} notifications.email - Email notifications enabled.
 * @property {boolean} notifications.push - Push notifications enabled.
 * @property {boolean} notifications.receiptUploads - Receipt upload notifications enabled.
 * @property {boolean} notifications.monthlyReports - Monthly reports notifications enabled.
 * @property {boolean} notifications.budgetAlerts - Budget alerts notifications enabled.
 * @property {object} display - Display settings.
 * @property {string} display.theme - Application theme ('light' or 'dark').
 * @property {string} display.currency - Preferred currency.
 * @property {string} display.dateFormat - Preferred date format.
 * @property {string} display.language - Preferred language.
 * @property {object} receipts - Receipt settings.
 * @property {string|null} receipts.defaultCategory - Default category for new receipts.
 * @property {boolean} receipts.autoCategories - Auto-categorization enabled.
 * @property {boolean} receipts.saveImages - Save receipt images enabled.
 * @property {boolean} receipts.parseItems - Parse line items enabled.
 * @property {object} reports - Report settings.
 * @property {string} reports.defaultDateRange - Default date range for reports.
 * @property {string} reports.defaultGrouping - Default grouping for reports.
 * @property {boolean} reports.showBudget - Show budget in reports.
 * @property {object} reports.charts - Chart settings.
 * @property {string} reports.charts.preferredType - Preferred chart type.
 * @property {string} reports.charts.colorScheme - Preferred chart color scheme.
 * @property {object} categories - Category settings.
 * @property {boolean} categories.showInactive - Show inactive categories.
 * @property {string} categories.sortBy - Sort categories by.
 * @property {number} categories.budgetWarningThreshold - Budget warning threshold percentage.
 * @property {object} privacy - Privacy settings.
 * @property {boolean} privacy.shareAnalytics - Share analytics data.
 * @property {boolean} privacy.storageConsent - Storage consent given.
 * // Add other relevant settings properties here
 */

/**
 * @typedef {object} UseSettingsReturn
 * @property {UserSettings} settings - User settings data.
 * @property {boolean} loading - Loading state.
 * @property {string|null} error - Error message if fetching/mutating failed.
 * @property {function(): Promise<void>} updateSettings - Function to update settings.
 * @property {function(): Promise<void>} resetSettings - Function to reset settings to default.
 * @property {function(string): any} getSetting - Function to get a specific setting value by path.
 * @property {function(): void} exportSettings - Function to export settings to a JSON file.
 * @property {function(File): Promise<void>} importSettings - Function to import settings from a JSON file.
 */

/**
 * @desc Custom hook for fetching, updating, resetting, exporting, and importing user settings.
 * Manages loading, error, and settings state. Uses client-side caching.
 * @returns {UseSettingsReturn} - Object containing settings data, state, and functions.
 */
export const useSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user settings
  /**
   * @desc Fetches user settings from Firestore or cache.
   * Initializes default settings if no user settings are found.
   * Updates settings state.
   * @returns {Promise<void>}
   */
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(DEFAULT_SETTINGS); // Reset to default if user logs out
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `settings_${user.uid}`;
      const cachedSettings = getCache(cacheKey); // Use getCache

      if (cachedSettings) {
        setSettings(cachedSettings);
        setLoading(false);
        logger.info(`Fetched settings from cache for user ${user.uid}`); // Add logging
        return;
      }

      // Fetch from Firestore
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const userSettings = settingsDoc.data();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...userSettings,
        }));

        // Cache the settings
        setCache(cacheKey, userSettings, 30 * 60 * 1000); // Use setCache (cache for 30 minutes)
        logger.info(`Cached settings for user ${user.uid}`); // Add logging
      } else {
        // Initialize default settings for new user
        await setDoc(settingsRef, DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS); // Set default settings in state
        setCache(cacheKey, DEFAULT_SETTINGS, 30 * 60 * 1000); // Cache default settings
        logger.info(`Initialized and cached default settings for user ${user.uid}`); // Add logging
      }
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to load settings.');
      setError(userFriendlyMessage);
      logger.error(`Error fetching settings for user ${user.uid}: ${err.message}`); // Add logging
    } finally {
      setLoading(false);
    }
  }, [user]); // Dependency on user

  // Update settings
  /**
   * @desc Updates user settings in Firestore and local state.
   * Invalidates and updates the cache.
   * @param {object} newSettings - Object containing the new settings values to merge.
   * @param {string} [section=null] - Optional section key to update only a specific part of settings.
   * @returns {Promise<void>}
   * @throws {Error} - Throws an error if the update fails.
   */
  const updateSettings = useCallback(async (newSettings, section = null) => { // Wrap in useCallback
    if (!user) throw new Error('User not authenticated'); // Add auth check

    try {
      setLoading(true); // Set loading for update operations
      setError(null); // Clear previous errors

      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const updatedSettings = section
        ? {
            ...settings,
            [section]: {
              ...settings[section],
              ...newSettings,
            },
          }
        : {
            ...settings,
            ...newSettings,
          };

      await updateDoc(settingsRef, updatedSettings);
      setSettings(updatedSettings);

      // Update cache and invalidate to ensure next fetch gets fresh data
      const cacheKey = `settings_${user.uid}`;
      setCache(cacheKey, updatedSettings, 30 * 60 * 1000); // Use setCache
      invalidateCache(cacheKey); // Invalidate cache
      logger.info(`Updated and cached settings for user ${user.uid}`); // Add logging

      // showToast('Settings updated successfully', 'success'); // errorHandler handles toast
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to update settings.');
      setError(userFriendlyMessage);
      logger.error(`Error updating settings for user ${user.uid}: ${err.message}`); // Add logging
      throw err; // Re-throw for components that might need to catch
    } finally {
      setLoading(false); // Reset loading
    }
  }, [user, settings]); // Dependencies on user and settings state

  // Reset settings to default
  /**
   * @desc Resets user settings to default values in Firestore and local state.
   * @param {string} [section=null] - Optional section key to reset only a specific part of settings.
   * @returns {Promise<void>}
   * @throws {Error} - Throws an error if the reset fails.
   */
  const resetSettings = useCallback(async (section = null) => { // Wrap in useCallback
    if (!user) throw new Error('User not authenticated'); // Add auth check

    try {
      setLoading(true); // Set loading for reset operations
      setError(null); // Clear previous errors

      const resetValues = section ? { [section]: DEFAULT_SETTINGS[section] } : DEFAULT_SETTINGS;

      // Use updateSettings to handle the actual Firestore update and state/cache update
      await updateSettings(resetValues);
      // showToast('Settings reset successfully', 'success'); // errorHandler handles toast
      logger.info(`Reset settings for user ${user?.uid}`); // Add logging
    } catch (err) {
      const userFriendlyMessage = errorHandler(err, 'Failed to reset settings.');
      setError(userFriendlyMessage);
      logger.error(`Error resetting settings for user ${user?.uid}: ${err.message}`); // Add logging
      throw err;
    } finally {
      setLoading(false); // Reset loading
    }
  }, [user, updateSettings]); // Dependencies on user and updateSettings

  // Get a specific setting value
  /**
   * @desc Gets a specific setting value from the current settings state by dot notation path.
   * @param {string} path - The dot notation path to the setting (e.g., 'notifications.email').
   * @returns {any} - The value of the setting, or null if not found.
   */
  const getSetting = useCallback(path => { // Wrap in useCallback
    try {
      return path.split('.').reduce((obj, key) => obj[key], settings);
    } catch (err) {
      // This is a client-side error, use errorHandler directly
      errorHandler(err, `Failed to get setting at path: ${path}`);
      logger.error(`Error getting setting at path ${path} for user ${user?.uid}: ${err.message}`); // Add logging
      return null;
    }
  }, [settings, user]); // Dependencies on settings state and user

  // Export settings
  /**
   * @desc Exports the current user settings to a JSON file.
   * @returns {void}
   */
  const exportSettings = useCallback(() => { // Wrap in useCallback
    try {
      const settingsJson = JSON.stringify(settings, null, 2);
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'receipt-scanner-settings.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      // showToast('Settings exported successfully', 'success'); // errorHandler handles toast
      logger.info(`Settings exported for user ${user?.uid}`); // Add logging
    } catch (err) {
      errorHandler(err, 'Failed to export settings.');
      logger.error(`Error exporting settings for user ${user?.uid}: ${err.message}`); // Add logging
    }
  }, [settings, user]); // Dependencies on settings state and user

  // Import settings
  /**
   * @desc Imports settings from a JSON file and updates user settings in Firestore.
   * @param {File} file - The JSON file containing the settings to import.
   * @returns {Promise<void>}
   * @throws {Error} - Throws an error if the import fails (file reading or update).
   */
  const importSettings = useCallback(async file => { // Wrap in useCallback
    if (!user) throw new Error('User not authenticated'); // Add auth check

    try {
      setLoading(true); // Set loading for import operations
      setError(null); // Clear previous errors

      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          // Use updateSettings to handle the actual Firestore update and state/cache update
          await updateSettings(importedSettings);
          // showToast('Settings imported successfully', 'success'); // errorHandler handles toast
          logger.info(`Settings imported for user ${user.uid}`); // Add logging
        } catch (err) {
          // Handle parsing errors specifically
          const userFriendlyMessage = errorHandler(err, 'Invalid settings file.');
          setError(userFriendlyMessage);
          logger.error(`Error parsing or updating imported settings for user ${user.uid}: ${err.message}`); // Add logging
          // No need to re-throw here as updateSettings already throws
        } finally {
           setLoading(false); // Reset loading after import process
        }
      };
      reader.onerror = (err) => {
         const userFriendlyMessage = errorHandler(err, 'Failed to read settings file.');
         setError(userFriendlyMessage);
         logger.error(`Error reading imported settings file for user ${user.uid}: ${err.message}`); // Add logging
         setLoading(false); // Reset loading on file read error
      };
      reader.readAsText(file);
    } catch (err) {
      // This catch block might catch errors from readAsText or initial checks
      const userFriendlyMessage = errorHandler(err, 'Failed to import settings.');
      setError(userFriendlyMessage);
      logger.error(`Error importing settings for user ${user.uid}: ${err.message}`); // Add logging
      setLoading(false); // Reset loading on initial import error
    }
  }, [user, updateSettings]); // Dependencies on user and updateSettings


  // Load settings on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      setSettings(DEFAULT_SETTINGS); // Reset to default if user logs out
    }
  }, [user, fetchSettings]); // Dependency on user and fetchSettings

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    getSetting,
    exportSettings,
    importSettings,
  };
};

export default useSettings;
