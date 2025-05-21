"use client";

// Created: 5/9/2025, 11:21:17 PM
// Note: Test page with a simple button to check event handling.

import React from 'react';

const TestButtonPage: React.FC = () => {
  console.log('TestButtonPage rendering'); // Added for debugging

  return (
    <div>
      <h2>Test Button Page</h2>
      <button onClick={() => console.log('Test button clicked - Clean project')}>
        Click Me
      </button>
    </div>
  );
};

export default TestButtonPage;
