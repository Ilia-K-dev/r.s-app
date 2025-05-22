/**
 * testRunner.js
 * Last Modified: 5/22/2025 12:34 AM
 * Modified By: Cline
 * 
 * Purpose: Provides functions to test components programmatically
 * Changes Made: Created new test runner utility
 * Reasoning: To enable component testing without deployment
 */

import React from 'react';
import { testComponent, displayTestResults } from './componentTester';

/**
 * Tests a component and returns results
 * @param {React.Component} Component - Component to test
 * @param {Object} props - Props to pass to component
 * @param {Object} options - Test options
 * @returns {Object} - Test results
 */
export const runComponentTest = (Component, props = {}, options = {}) => {
  console.log(`Testing component ${Component.name || 'Unknown'}`);
  
  const { TestWrapper, getResults } = testComponent(Component, props);
  
  try {
    // Create component (doesn't actually render to DOM)
    const element = <TestWrapper />;
    const results = getResults();
    
    // Display results to console if requested
    if (options.logResults !== false) {
      displayTestResults(results);
    }
    
    return {
      ...results,
      componentName: Component.name || 'Unknown'
    };
  } catch (error) {
    console.error('Error in test runner:', error);
    return {
      passed: false,
      errors: [error.message],
      warnings: [],
      log: [],
      componentName: Component.name || 'Unknown'
    };
  }
};

/**
 * Tests multiple components and aggregates results
 * @param {Object} componentMap - Map of component names to components
 * @param {Object} propsMap - Map of component names to props
 * @returns {Object} - Aggregated test results
 */
export const runTestSuite = (componentMap, propsMap = {}) => {
  const results = {
    total: Object.keys(componentMap).length,
    passed: 0,
    failed: 0,
    componentResults: {}
  };
  
  console.log(`Running test suite with ${results.total} components`);
  
  Object.entries(componentMap).forEach(([name, Component]) => {
    const props = propsMap[name] || {};
    const componentResult = runComponentTest(Component, props, { logResults: false });
    
    results.componentResults[name] = componentResult;
    
    if (componentResult.passed) {
      results.passed += 1;
    } else {
      results.failed += 1;
    }
  });
  
  // Log summary
  console.log(`=== TEST SUITE RESULTS ===`);
  console.log(`Total components: ${results.total}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log(`\nFailed components:`);
    Object.entries(results.componentResults)
      .filter(([_, result]) => !result.passed)
      .forEach(([name, result]) => {
        console.log(`- ${name}: ${result.errors.length} errors`);
      });
  }
  
  return results;
};

// Export a simple testing function that can be used directly in the console
window.testComponent = (componentPath) => {
  try {
    // Dynamic import - note this will only work for components exported as default
    import(`../../../${componentPath}`)
      .then(module => {
        const Component = module.default;
        runComponentTest(Component);
      })
      .catch(error => {
        console.error(`Failed to import component from path: ${componentPath}`, error);
      });
  } catch (error) {
    console.error(`Error testing component: ${error.message}`);
  }
};
