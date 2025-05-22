// File: server/scripts/test-security-rules.js
// Date: 2025-05-17
// Description: Script to find emulator ports and run all security rules tests.
// Reasoning: Ensures emulators are running and passes detected ports to the test environment for comprehensive security test execution.

const { spawn } = require('child_process');
const http = require('http');

// Try to find the Firestore emulator port
async function findFirestoreEmulatorPort() {
  const potentialPorts = [8081, 8080, 8085, 8090, 9000, 9090, 9099];

  for (const port of potentialPorts) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          resolve(res);
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      return port;
    } catch (error) {
      // Continue to next port
    }
  }
  return null;
}

// Try to find the Storage emulator port
async function findStorageEmulatorPort() {
  const potentialPorts = [9199, 9299, 9099, 9000];

  for (const port of potentialPorts) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
          resolve(res);
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      return port;
    } catch (error) {
      // Continue to next port
    }
  }
  return null;
}

async function runAllSecurityTests() {
  console.log('Finding Firebase emulator ports...');

  const firestorePort = await findFirestoreEmulatorPort();
  const storagePort = await findStorageEmulatorPort();

  if (!firestorePort && !storagePort) {
    console.error('Firebase emulators do not appear to be running!');
    console.error('Please start them with: firebase emulators:start');
    process.exit(1);
  }

  if (firestorePort) {
    console.log(`Found Firestore emulator on port ${firestorePort}`);
    process.env.FIRESTORE_EMULATOR_PORT = firestorePort;
  } else {
    console.warn('Firestore emulator not found, Firestore tests may fail');
  }

  if (storagePort) {
    console.log(`Found Storage emulator on port ${storagePort}`);
    process.env.STORAGE_EMULATOR_PORT = storagePort;
  } else {
    console.warn('Storage emulator not found, Storage tests may fail');
  }

  console.log('Running all security tests...');

  const jest = spawn('npx', ['jest', 'tests/security'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env }
  });

  jest.on('error', (error) => {
    console.error('Failed to start Jest:', error.message);
    process.exit(1);
  });

  jest.on('close', (code) => {
    if (code === 0) {
      console.log('All security tests completed successfully!');
    } else {
      console.error(`Security tests failed with exit code ${code}`);
      process.exit(code);
    }
  });
}

runAllSecurityTests();
