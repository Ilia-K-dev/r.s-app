## Testing Infrastructure Setup
- [x] Unit test framework (Jest) - Setup started, tests failing
- [ ] Integration test setup
- [x] E2E test framework (Cypress) - Setup started, tests failing
- [ ] Test coverage reporting
- [x] Performance benchmarking - Setup started, script failing

// Install testing dependencies
cd client
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
npm install --save-dev cypress cypress-localstorage-commands @cypress/code-coverage

cd ../server
npm install --save-dev jest supertest

## Completed Steps
- Installed some testing dependencies in client and server directories.
- Created `client/jest.config.js`.
- Created `client/src/components/__tests__/Button.test.js` (unit test example).
- Created `scripts/performance-benchmark.js`.
- Created `client/src/setupTests.js`.
- Updated `babel.config.js` to include `@babel/preset-react`.

## Issues Encountered
- Client unit tests (`npm test`) are failing with a JSX syntax error, despite Babel configuration updates.
- Performance benchmark script (`node scripts/performance-benchmark.js`) is failing due to a Playwright browser executable issue.

## Remaining Work
- Resolve the JSX syntax error in client tests.
- Resolve the Playwright browser issue for the performance benchmark script.
- Complete integration test setup.
- Complete E2E test setup.
- Set up test coverage reporting.

// Create Jest config
Create: /client/jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// Create unit test examples
Create: /client/src/components/__tests__/Button.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalled();
  });
});

// Create performance benchmark
Create: /scripts/performance-benchmark.js
const { chromium } = require('playwright');
const lighthouse = require('lighthouse');

async function runPerformanceTest() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Measure First Contentful Paint
  await page.goto('http://localhost:3000');
  const performanceMetrics = await page.evaluate(() => {
    const perfEntries = performance.getEntries();
    return {
      fcp: perfEntries.find(e => e.name === 'first-contentful-paint')?.startTime,
      lcp: perfEntries.find(e => e.entryType === 'largest-contentful-paint')?.startTime,
    };
  });
  
  console.log('Performance Metrics:', performanceMetrics);
  await browser.close();
}

runPerformanceTest();

// **PAUSE**: Ask human to run "npm test" to verify testing setup
