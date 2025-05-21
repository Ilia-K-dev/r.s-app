// File: server/tests/setup.js
// Description: Jest setup file to polyfill fetch for the test environment.

import fetch from 'node-fetch';

beforeAll(async () => {
  globalThis.fetch = fetch;
});
