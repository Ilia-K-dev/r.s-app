/**
 * DebugPanel.js
 * Last Modified: 5/22/2025 12:33 AM
 * Modified By: Cline
 * 
 * Purpose: Debug panel component for testing UI in development
 * Changes Made: Created new debug component
 * Reasoning: To enable frontend testing without deployment
 */

import React, { useState } from 'react';
import { testComponent, testComponentProps, displayTestResults } from '../../utils/testing/componentTester';

/**
 * Debug panel component for testing React components
 */
const DebugPanel = ({ position = 'bottom-right' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [componentToTest, setComponentToTest] = useState(null);
  const [testResults, setTestResults] = useState(null);
  
  // Position styles
  const positionStyles = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0',
  };
  
  // Available test components (to be populated by your app)
  const availableComponents = {
    // Add your components here to make them available for testing
    // Example: 'UserProfile': UserProfile,
  };
  
  // Run tests on selected component
  const runTests = () => {
    if (!componentToTest) return;
    
    const Component = availableComponents[componentToTest];
    if (!Component) return;
    
    const results = testComponentProps(Component, [{}]);
    setTestResults(results);
    displayTestResults(results);
  };
  
  // Toggle panel expansion
  const togglePanel = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={`fixed ${positionStyles[position]} z-50`}>
      {/* Debug Panel Button */}
      <button
        onClick={togglePanel}
        className="bg-gray-800 text-white p-2 rounded-tl-md shadow-lg text-xs hover:bg-gray-700 transition-colors"
      >
        {isExpanded ? 'Hide Debug Panel' : 'Debug Panel'}
      </button>
      
      {/* Debug Panel Content */}
      {isExpanded && (
        <div className="bg-gray-800 text-white p-4 rounded-tl-md shadow-lg w-64">
          <h3 className="text-sm font-bold mb-2">Component Testing</h3>
          
          <label className="block text-xs mb-2">
            Select Component:
            <select
              value={componentToTest || ''}
              onChange={(e) => setComponentToTest(e.target.value)}
              className="mt-1 block w-full bg-gray-700 text-white text-xs p-1 rounded"
            >
              <option value="">-- Select Component --</option>
              {Object.keys(availableComponents).map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          
          <button
            onClick={runTests}
            disabled={!componentToTest}
            className="bg-blue-600 text-white text-xs p-1 rounded w-full disabled:opacity-50 hover:bg-blue-500 transition-colors"
          >
            Run Tests
          </button>
          
          {testResults && (
            <div className="mt-4 text-xs">
              <h4 className="font-bold mb-1">Test Results:</h4>
              <div className="bg-gray-700 p-2 rounded max-h-40 overflow-auto">
                {testResults.map((result, i) => (
                  <div key={i} className="mb-2">
                    <div>Test {i+1}: {result.passed ? '✅ Passed' : '❌ Failed'}</div>
                    {result.errors.length > 0 && (
                      <div className="text-red-400">
                        Errors: {result.errors.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugPanel;
