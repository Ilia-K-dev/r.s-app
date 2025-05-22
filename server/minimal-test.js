// Polyfill fetch first
const fetch = require('node-fetch');
global.fetch = fetch;
global.Request = fetch.Request;
global.Response = fetch.Response;
global.Headers = fetch.Headers;

// Then import and run the actual test
require('./tests/security/firestore.test.js');
