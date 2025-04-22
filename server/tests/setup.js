const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

jest.mock('@google-cloud/vision');
jest.mock('firebase/storage');

global.console = {
  ...console,
  // Comment out below to see console logs during tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};