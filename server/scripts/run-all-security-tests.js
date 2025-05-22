// File: server/scripts/run-all-security-tests.js
// Date: 2025-05-17 05:08:23
// Description: Script to find emulator port and run all security rules tests.
// Reasoning: Implements robust port detection and passes the detected port to the test environment via an environment variable.

const { spawn } = require('child_process');
const http = require('http');

// Try to find the Firestore emulator port
async function findFirestoreEmulatorPort() {
  // Common Firestore emulator ports to check
  const potentialPorts = [8080, 8085, 8090, 9000, 9090, 9099];
  
  console.log('Searching for Firestore emulator on common ports...');
  
  for (const port of potentialPorts) {
    try {
      const url = `http://localhost:${port}`;
      console.log(`Checking port ${port}...`);
      
      const response = await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          resolve(res);
        });
        
        req.on('error', (err) => {
          reject(err);
        });
        
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      
      console.log(`Found emulator on port ${port}`);
      return port;
    } catch (error) {
      // Continue to next port
    }
  }
  
  return null;
}

async function runTests() {
  console.log('Searching for Firebase emulators...');
  
  const firestorePort = await findFirestoreEmulatorPort();
  
  if (!firestorePort) {
    console.error('Firebase emulators do not appear to be running!');
    console.error('Please start them with: firebase emulators:start');
    console.error('Then run this script again.');
    process.exit(1);
  }
  
  console.log(`Firebase Firestore emulator found on port ${firestorePort}`);
  
  // Set environment variable to tell our tests which port to use
  process.env.FIRESTORE_EMULATOR_PORT = firestorePort;
  
  // Run Jest tests for all security rule tests
  const jest = spawn('npx', ['jest', 'tests/security', '--verbose'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env } // Pass current environment variables
  });
  
  jest.on('error', (error) => {
    console.error('Failed to start Jest:', error.message);
    process.exit(1);
  });
  
  jest.on('close', (code) => {
    if (code === 0) {
      console.log('All security rules tests completed successfully!');
    } else {
      console.error(`Security rules tests failed with exit code ${code}`);
      process.exit(code);
    }
  });
}

// Run the tests
runTests();
