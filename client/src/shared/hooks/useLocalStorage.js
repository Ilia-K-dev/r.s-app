import { useState, useEffect } from 'react'; //correct

import { logger } from '../utils/logger'; //correct

export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);

      if (item) {
        // Parse stored json or if none return initialValue
        return JSON.parse(item);
      }

      // Return initial state if no stored value
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      logger.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = e => {
      if (e.key === key) {
        try {
          // If value was removed
          if (e.newValue === null) {
            setStoredValue(initialValue);
            return;
          }

          // Parse and set new value
          const newValue = JSON.parse(e.newValue);
          if (storedValue !== newValue) {
            setStoredValue(newValue);
          }
        } catch (error) {
          logger.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    // Add event listener
    window.addEventListener('storage', handleStorageChange);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, storedValue, initialValue]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = value => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to remove item from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      logger.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
