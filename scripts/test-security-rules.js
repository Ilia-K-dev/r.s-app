#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '..');

console.log('Running Firestore security rules tests...');

try {
  // Use npm's --prefix option to run commands in specific directories
  // This approach avoids issues with changing directories in a subprocess
  const command = 'firebase emulators:exec "npm --prefix server test:firestore"';
  
  execSync(command, { 
    stdio: 'inherit',
    cwd: projectRoot 
  });
  
  console.log('Firestore security rules tests completed successfully.');
  
  // Run Storage tests separately
  console.log('Running Storage security rules tests...');
  const storageCommand = 'firebase emulators:exec "npm --prefix server test:storage"';
  
  execSync(storageCommand, { 
    stdio: 'inherit',
    cwd: projectRoot 
  });
  
  console.log('Storage security rules tests completed successfully.');
  console.log('All security rules tests passed.');
  
  process.exit(0);
} catch (error) {
  console.error('Security rules tests failed:', error.message);
  process.exit(1);
}
