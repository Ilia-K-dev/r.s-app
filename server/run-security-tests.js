/**
 * Run Security Rules Tests
 * A script to run the simplified Firestore security rules tests
 */
const { spawn } = require('child_process');

// Set environment variables for emulator connection
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9100';

console.log('=== Running Firebase Security Rules Tests ===');
console.log(`Using Firestore emulator at: ${process.env.FIRESTORE_EMULATOR_HOST}`);
console.log(`Using Auth emulator at: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);

// Run all security tests
const test = spawn('npx', ['jest', 'tests/security/simplified-firestore.test.js', 'tests/security/firestore.test.js', 'tests/security/storage.test.js'], {
  stdio: 'inherit',
  shell: true
});

test.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Security rules tests completed successfully');
  } else {
    console.error(`❌ Security rules tests failed with code ${code}`);
    process.exit(1);
  }
});
