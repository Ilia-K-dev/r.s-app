// File: server/jest.setup.js
// Date: 2025-05-17 04:24:21
// Description: Updated Jest setup file for Firebase emulator tests.
// Reasoning: Configures environment variables for emulator connection and sets a longer timeout.

// Increase timeout for Firebase emulator tests
jest.setTimeout(30000);

// Configure environment variables for emulator connection
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
