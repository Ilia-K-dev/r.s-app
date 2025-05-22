// First polyfill fetch
const fetch = require('node-fetch');
global.fetch = fetch;
global.Request = fetch.Request;
global.Response = fetch.Response;
global.Headers = fetch.Headers;

// Then run Jest programmatically
const jest = require('jest');
const path = require('path');
const testPath = path.resolve(__dirname, './tests/security/firestore.test.js');

// Run Jest with specific options
jest.run(['--no-cache', testPath]);
