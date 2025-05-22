// File: server/scripts/run-with-emulators.js
// Date: 2025-05-17 05:13:20
// Description: Wrapper script to automatically start Firebase emulators and run security rules tests, with improved port detection.
// Reasoning: Provides a convenient way to ensure emulators are running and the correct ports (including the hub port) are detected before executing tests.

const { spawn } = require('child_process');
const http = require('http');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const exec = promisify(require('child_process').exec);

// Variables to track processes
let emulatorProcess = null;
let testProcess = null;
let firestorePort = null;
let hubPort = null;

// Try to read the port from firebase.json
function getFirestorePortFromConfig() {
  try {
    const firebaseConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../firebase.json'), 'utf8'));
    if (firebaseConfig.emulators && firebaseConfig.emulators.firestore) {
      return firebaseConfig.emulators.firestore.port;
    }
  } catch (error) {
    console.warn('Could not read firestore port from firebase.json:', error.message);
  }
  return 8080; // Default port
}

// Check if emulators are already running
async function findFirestoreEmulatorPort() {
  // First try the port from config
  const configPort = getFirestorePortFromConfig();
  const potentialPorts = [configPort, 8080, 8085, 8090, 9000, 9090, 9099];
  
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

// Get the emulator hub port
async function getEmulatorHubPort() {
  try {
    await fetch('http://localhost:4400');
    return 4400;
  } catch (error) {
    return null;
  }
}


// Check for running emulator processes
async function checkForRunningEmulators() {
  try {
    // On Windows
    const { stdout } = await exec('netstat -ano | findstr LISTENING');
    
    // Get the Firestore port from config
    const configPort = getFirestorePortFromConfig();
    
    // Check for the port
    if (stdout.includes(`:${configPort}`)) {
      console.log(`Found existing emulator process on port ${configPort}`);
      return configPort;
    }
    
    return await findFirestoreEmulatorPort();
  } catch (error) {
    return await findFirestoreEmulatorPort();
  }
}

// Start emulators if not running
async function startEmulators() {
  const port = await checkForRunningEmulators();
  
  if (port) {
    console.log(`Firebase emulators are already running on port ${port}`);
    firestorePort = port;
    hubPort = await getEmulatorHubPort() || 4400; // Also find hub port if emulators are running
    return;
  }
  
  console.log('Starting Firebase emulators...');
  
  // Start emulators from parent directory (where firebase.json is)
  emulatorProcess = spawn('firebase', ['emulators:start'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '../..')
  });
  
  emulatorProcess.on('error', (error) => {
    console.error('Failed to start Firebase emulators:', error.message);
    process.exit(1);
  });
  
  // Wait for emulators to be ready
  await new Promise((resolve) => {
    // Try to check every second until we find the emulator
    const checkInterval = setInterval(async () => {
      const port = await findFirestoreEmulatorPort();
      if (port) {
        clearInterval(checkInterval);
        firestorePort = port;
        hubPort = await getEmulatorHubPort() || 4400; // Find hub port after starting
        console.log(`Firebase emulators are now running on port ${port}`);
        resolve();
      }
    }, 1000);
    
    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      console.log('Timed out waiting for emulators to start');
      resolve();
    }, 30000);
  });
}

// Run the tests
async function runTests() {
  console.log('Running simplified security rules test...');
  
  if (!firestorePort) {
    console.error('Could not determine Firestore emulator port');
    process.exit(1);
  }
  
  // Set environment variables to tell our tests which ports to use
  process.env.FIRESTORE_EMULATOR_PORT = firestorePort;
  process.env.FIREBASE_EMULATOR_HUB_PORT = hubPort; // Set hub port environment variable
  
  testProcess = spawn('node', ['scripts/test-security-rules.js'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env } // Pass current environment variables
  });
  
  return new Promise((resolve) => {
    testProcess.on('close', (code) => {
      resolve(code);
    });
  });
}

// Clean up processes on exit
function cleanUp() {
  if (emulatorProcess) {
    console.log('Stopping Firebase emulators...');
    emulatorProcess.kill();
  }
  
  if (testProcess) {
    testProcess.kill();
  }
}

// Run everything
async function main() {
  try {
    // Ensure clean exit
    process.on('SIGINT', cleanUp);
    process.on('SIGTERM', cleanUp);
    
    // Start emulators if needed
    await startEmulators();
    
    if (!firestorePort) {
      console.error('Could not find or start Firebase emulators');
      process.exit(1);
    }
    
    // Run tests
    const testResult = await runTests();
    
    // Clean up if we started the emulators
    if (emulatorProcess) {
      cleanUp();
    }
    
    process.exit(testResult);
  } catch (error) {
    console.error('Error:', error.message);
    cleanUp();
    process.exit(1);
  }
}

// Export the findFirestoreEmulatorPort function for use in other scripts
module.exports = {
  findFirestoreEmulatorPort
};

// Execute the main function
main();
