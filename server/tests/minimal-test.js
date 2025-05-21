import fetch from 'node-fetch';
global.fetch = fetch;

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import fs from 'fs';

let testEnv;

beforeAll(async () => {
  // Set up the test environment
  testEnv = await initializeTestEnvironment({
    projectId: 'project-reciept-reader-id',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      // indexes: fs.readFileSync('firestore.indexes.json', 'utf8'), // Optional: if you have custom indexes
    },
    storage: {
      rules: fs.readFileSync('storage.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  // Clean up the test environment
  await testEnv.cleanup();
});

describe('Minimal Test', () => {
  it('should initialize the test environment', async () => {
    // This test simply checks if the beforeAll block completed without errors
    expect(testEnv).toBeInstanceOf(RulesTestEnvironment);
  });
});
