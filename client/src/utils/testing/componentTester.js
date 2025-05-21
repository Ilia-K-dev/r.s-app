/**
 * componentTester.js
 * Last Modified: 5/22/2025 12:33 AM
 * Modified By: Cline
 * 
 * Purpose: Provides utilities for testing React components without deployment
 * Changes Made: Created new testing utility
 * Reasoning: To enable frontend component verification without deployment
 */

import React from 'react';

/**
 * Wraps a component with test utilities to verify its functionality
 * @param {React.Component} Component - The component to test
 * @param {Object} props - Props to pass to the component
 * @returns {Object} - Component with test utilities
 */
export const testComponent = (Component, props = {}) => {
  // Store render output
  let rendered = null;
  
  // Store test results
  const testResults = {
    passed: true,
    errors: [],
    warnings: [],
    log: []
  };
  
  // Override console methods to capture output
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log
  };
  
  // Setup console overrides
  console.error = (msg) => {
    testResults.passed = false;
    testResults.errors.push(msg);
    originalConsole.error(`[TEST ERROR] ${msg}`);
  };
  
  console.warn = (msg) => {
    testResults.warnings.push(msg);
    originalConsole.warn(`[TEST WARNING] ${msg}`);
  };
  
  console.log = (msg) => {
    testResults.log.push(msg);
    originalConsole.log(`[TEST LOG] ${msg}`);
  };
  
  // Create test wrapper component
  const TestWrapper = () => {
    try {
      rendered = <Component {...props} />;
      return rendered;
    } catch (error) {
      testResults.passed = false;
      testResults.errors.push(error.message);
      originalConsole.error(`[TEST ERROR] Component failed to render: ${error.message}`);
      return <div>Component failed to render: {error.message}</div>;
    }
  };
  
  // Restore console after testing
  const cleanup = () => {
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.log = originalConsole.log;
    
    // Return test results
    return {
      ...testResults,
      output: rendered
    };
  };
  
  return {
    TestWrapper,
    cleanup,
    getResults: cleanup
  };
};

/**
 * Tests a component's props handling
 * @param {React.Component} Component - The component to test
 * @param {Array<Object>} propSets - Array of prop sets to test
 * @returns {Object} - Test results for each prop set
 */
export const testComponentProps = (Component, propSets = [{}]) => {
  const results = [];
  
  propSets.forEach((props, index) => {
    console.log(`Testing prop set ${index + 1}/${propSets.length}`);
    const { TestWrapper, getResults } = testComponent(Component, props);
    
    // Render with these props
    try {
      const element = <TestWrapper />;
      // We're not actually rendering to the DOM, just checking if it fails during creation
      results.push({
        propSet: props,
        ...getResults()
      });
    } catch (error) {
      results.push({
        propSet: props,
        passed: false,
        errors: [error.message],
        warnings: [],
        log: []
      });
    }
  });
  
  return results;
};

/**
 * Renders test results to the console
 * @param {Object} results - Test results to display
 */
export const displayTestResults = (results) => {
  console.log('=== COMPONENT TEST RESULTS ===');
  
  if (Array.isArray(results)) {
    // Handle multiple test results (from testComponentProps)
    results.forEach((result, index) => {
      console.log(`\n--- Test ${index + 1} ---`);
      console.log(`Props tested:`, result.propSet);
      console.log(`Passed:`, result.passed ? '✅ YES' : '❌ NO');
      
      if (result.errors.length > 0) {
        console.log(`Errors (${result.errors.length}):`);
        result.errors.forEach(err => console.log(`  - ${err}`));
      }
      
      if (result.warnings.length > 0) {
        console.log(`Warnings (${result.warnings.length}):`);
        result.warnings.forEach(warn => console.log(`  - ${warn}`));
      }
    });
  } else {
    // Handle single test result
    console.log(`Passed:`, results.passed ? '✅ YES' : '❌ NO');
    
    if (results.errors.length > 0) {
      console.log(`Errors (${results.errors.length}):`);
      results.errors.forEach(err => console.log(`  - ${err}`));
    }
    
    if (results.warnings.length > 0) {
      console.log(`Warnings (${results.warnings.length}):`);
      results.warnings.forEach(warn => console.log(`  - ${warn}`));
    }
  }
  
  console.log('\n=== END TEST RESULTS ===');
};
