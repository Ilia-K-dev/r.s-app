// File: server/scripts/test-emulator-connection.js
// Date: 2025-05-17 05:13:06
// Description: Script to test connections to common Firebase emulator ports.
// Reasoning: Helps diagnose emulator connection issues by verifying which ports are open and responding.

const fetch = require('node-fetch');
const http = require('http');

// Function to test connection to a port
async function testPort(host, port) {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}`, (res) => {
      console.log(`Port ${port}: CONNECTED (status ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`Port ${port}: ERROR (${err.message})`);
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      console.log(`Port ${port}: TIMEOUT`);
      resolve(false);
    });
  });
}

// Test multiple common emulator ports
async function testEmulatorPorts() {
  console.log('Testing connections to common Firebase emulator ports...\n');
  
  const ports = [
    { port: 4000, service: 'Emulator UI' },
    { port: 4400, service: 'Emulator Hub' },
    { port: 8080, service: 'Firestore Default' },
    { port: 8081, service: 'Firestore Alternate' },
    { port: 9000, service: 'Realtime Database' },
    { port: 9099, service: 'Auth' },
    { port: 9199, service: 'Storage' },
    { port: 5001, service: 'Functions' },
    { port: 9299, service: 'Pub/Sub' }
  ];
  
  for (const { port, service } of ports) {
    await testPort('localhost', port);
  }
  
  console.log('\nTesting complete.');
}

// Run the tests
testEmulatorPorts();
