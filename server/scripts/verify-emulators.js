/**
 * Firebase Emulator Verification Script
 * Date: 2025-05-18
 * 
 * Verifies that Firebase emulators are running and accessible.
 * Checks specific IPv6 configurations for Firestore and Storage emulators.
 */

const http = require('http');
const { execSync } = require('child_process');

// Configuration
const PROJECT_ID = 'project-reciept-reader-id-test';
const EMULATOR_CONFIGS = [
  { name: 'Firestore', host: '::1', port: 8081 },
  { name: 'Storage', host: '::1', port: 9200 }
];

// Helper functions
function checkEmulatorConnection(service, host, port) {
  return new Promise((resolve) => {
    console.log(`Checking ${service} emulator at [${host}]:${port}...`);
    
    // For IPv6, we need special handling
    const options = {
      host: host,
      family: 6, // Force IPv6
      port: port,
      path: '/',
      method: 'HEAD',
      timeout: 2000
    };
    
    const req = http.request(options, (res) => {
      console.log(`✅ ${service} emulator is running on [${host}]:${port}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.error(`❌ Error connecting to ${service} emulator:`, err.message);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.error(`❌ Timeout connecting to ${service} emulator`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

async function main() {
  console.log('Firebase Emulator Verification');
  console.log('============================');
  console.log('');
  
  try {
    // Get emulator status from Firebase CLI
    console.log('Checking emulator status from Firebase CLI...');
    try {
      const output = execSync('firebase emulators:exec "echo Emulators are running" --only auth,firestore,storage').toString();
      console.log('Firebase CLI reports emulators are running');
    } catch (error) {
      console.error('Firebase emulators do not appear to be running according to Firebase CLI');
      console.log('');
      console.log('Please start emulators with:');
      console.log('  firebase emulators:start');
      process.exit(1);
    }
    
    // Check individual emulators
    console.log('');
    console.log('Checking individual emulator connections:');
    
    let allRunning = true;
    for (const config of EMULATOR_CONFIGS) {
      const running = await checkEmulatorConnection(config.name, config.host, config.port);
      allRunning = allRunning && running;
    }
    
    console.log('');
    if (allRunning) {
      console.log('✅ All emulators are running and accessible');
      process.exit(0);
    } else {
      console.error('❌ One or more emulators are not accessible');
      console.log('');
      console.log('Please check that:');
      console.log('1. Firebase emulators are started with "firebase emulators:start"');
      console.log('2. No firewall is blocking connections to the emulators');
      console.log('3. IPv6 is properly configured on your system');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error during verification:', error);
    process.exit(1);
  }
}

main();
