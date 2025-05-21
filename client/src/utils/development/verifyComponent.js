/**
 * verifyComponent.js
 * Last Modified: 5/22/2025 12:34 AM
 * Modified By: Cline
 * 
 * Purpose: Provides utilities to verify components during development
 * Changes Made: Created new verification utility
 * Reasoning: To check frontend functionality without deployment
 */

import React from 'react';
import { runComponentTest } from '../testing/testRunner';

/**
 * Verifies a component and provides feedback
 * @param {React.Component} Component - Component to verify
 * @param {Object} props - Props to pass to component
 * @param {Function} callback - Callback with results
 */
export const verifyComponent = (Component, props = {}, callback = null) => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Component verification should only be used in development mode');
    return false;
  }
  
  const results = runComponentTest(Component, props);
  
  if (callback && typeof callback === 'function') {
    callback(results);
  }
  
  return results.passed;
};

/**
 * Creates a higher-order component that verifies a component on mount
 * @param {React.Component} Component - Component to verify
 * @param {Object} defaultProps - Default props for verification
 * @returns {React.Component} - Enhanced component
 */
export const withVerification = (Component, defaultProps = {}) => {
  // Return a wrapped component that includes verification
  return (props) => {
    // In development mode, verify the component on first render
    if (process.env.NODE_ENV === 'development') {
      React.useEffect(() => {
        const testProps = { ...defaultProps, ...props };
        verifyComponent(Component, testProps, (results) => {
          // Log verification results but don't block rendering
          if (!results.passed) {
            console.warn(`Component ${Component.name || 'Unknown'} verification failed`);
          }
        });
      }, []);
    }
    
    // Render the original component with all props
    return <Component {...props} />;
  };
};

/**
 * Makes component verification available globally for console use
 */
export const initializeComponentVerification = () => {
  if (process.env.NODE_ENV === 'development') {
    // Add to window for console access
    window.verifyComponent = verifyComponent;
    
    console.log('Component verification initialized. Use window.verifyComponent() in console.');
  }
};
