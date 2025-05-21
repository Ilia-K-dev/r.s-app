// Import the necessary modules at the top of server/scripts/run-all-tests.js
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

// Add this at the beginning of the script
// Check if emulators are running first
try {
  console.log('Checking if Firebase emulators are running...');

  // Run the check-emulators script
  const checkEmulatorPath = path.join(__dirname, 'check-emulators.js');
  if (existsSync(checkEmulatorPath)) {
    execSync(`node ${checkEmulatorPath}`, { stdio: 'inherit' });
  } else {
    console.error('❌ check-emulators.js script not found. Proceeding anyway, but tests may fail if emulators are not running.');
  }

  // Continue with running tests
  console.log('\nRunning security rules tests...');

  // The rest of your test running code here...
  // Execute Jest tests for Firestore and Storage
  execSync('npx jest tests/security/firestore.test.js', { stdio: 'inherit' });
  execSync('npx jest tests/security/storage.test.js', { stdio: 'inherit' });
  execSync('npx jest tests/security/simplified-firestore.test.js', { stdio: 'inherit' });

  console.log('\nAll security rules tests passed!');

} catch (error) {
  // This will catch errors from the check-emulators script or the jest commands
  console.error('❌ Security rules tests failed.');
  process.exit(1);
}
