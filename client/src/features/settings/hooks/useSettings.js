import { useState, useEffect, useCallback } from 'react';//correct
import { useAuth } from '../../../features/auth/hooks/useAuth';//correct
import { useToast } from '../../../shared/hooks/useToast';//correct
import { db } from '../../../core/config/firebase';//correct
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';//correct
import { logger } from '../../../shared/utils/logger';//correct
import { localCache } from '../../../shared/services/storage';//correct

const DEFAULT_SETTINGS = {
  notifications: {
    email: true,
    push: false,
    receiptUploads: true,
    monthlyReports: true,
    budgetAlerts: true
  },
  display: {
    theme: 'light',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'en'
  },
  receipts: {
    defaultCategory: null,
    autoCategories: true,
    saveImages: true,
    parseItems: true
  },
  reports: {
    defaultDateRange: '30d',
    defaultGrouping: 'day',
    showBudget: true,
    charts: {
      preferredType: 'bar',
      colorScheme: 'default'
    }
  },
  categories: {
    showInactive: false,
    sortBy: 'name',
    budgetWarningThreshold: 80 // percentage
  },
  privacy: {
    shareAnalytics: true,
    storageConsent: true
  }
};

export const useSettings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = `settings_${user.uid}`;
      const cachedSettings = localCache.get(cacheKey);
      
      if (cachedSettings) {
        setSettings(cachedSettings);
        setLoading(false);
        return;
      }

      // Fetch from Firestore
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const userSettings = settingsDoc.data();
        setSettings(prevSettings => ({
          ...prevSettings,
          ...userSettings
        }));
        
        // Cache the settings
        localCache.set(cacheKey, userSettings, 30 * 60 * 1000); // Cache for 30 minutes
      } else {
        // Initialize default settings for new user
        await setDoc(settingsRef, DEFAULT_SETTINGS);
      }
    } catch (err) {
      setError('Failed to load settings');
      logger.error('Error fetching settings:', err);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // Update settings
  const updateSettings = async (newSettings, section = null) => {
    if (!user) return;

    try {
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const updatedSettings = section
        ? {
            ...settings,
            [section]: {
              ...settings[section],
              ...newSettings
            }
          }
        : {
            ...settings,
            ...newSettings
          };

      await updateDoc(settingsRef, updatedSettings);
      setSettings(updatedSettings);
      
      // Update cache
      localCache.set(`settings_${user.uid}`, updatedSettings, 30 * 60 * 1000);
      
      showToast('Settings updated successfully', 'success');
    } catch (err) {
      logger.error('Error updating settings:', err);
      showToast('Failed to update settings', 'error');
      throw err;
    }
  };

  // Reset settings to default
  const resetSettings = async (section = null) => {
    try {
      const resetValues = section 
        ? { [section]: DEFAULT_SETTINGS[section] }
        : DEFAULT_SETTINGS;

      await updateSettings(resetValues);
      showToast('Settings reset successfully', 'success');
    } catch (err) {
      logger.error('Error resetting settings:', err);
      showToast('Failed to reset settings', 'error');
    }
  };

  // Get a specific setting value
  const getSetting = (path) => {
    try {
      return path.split('.').reduce((obj, key) => obj[key], settings);
    } catch (err) {
      logger.error('Error getting setting:', path, err);
      return null;
    }
  };

  // Export settings
  const exportSettings = () => {
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
    } catch (err) {
      logger.error('Error exporting settings:', err);
      showToast('Failed to export settings', 'error');
    }
  };

  // Import settings
  const importSettings = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);
          await updateSettings(importedSettings);
          showToast('Settings imported successfully', 'success');
        } catch (err) {
          throw new Error('Invalid settings file');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      logger.error('Error importing settings:', err);
      showToast('Failed to import settings', 'error');
    }
  };

  // Load settings on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    getSetting,
    exportSettings,
    importSettings
  };
};

export default useSettings;