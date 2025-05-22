// server/scripts/check-emulators.js
const fetch = require('node-fetch');

const PROJECT_ID = 'project-reciept-reader-id-test';

async function checkEmulator(service, hosts, ports) {
  console.log(`Checking for ${service} emulator...`);

  for (const host of hosts) {
    for (const port of ports) {
      try {
        console.log(`  Trying ${host}:${port}...`);
        const response = await fetch(`http://${host}:${port}/emulator/v1/projects/${PROJECT_ID}`);
        if (response.ok) {
          console.log(`✅ ${service} emulator found on ${host}:${port}`);
          return { host, port };
        }
      } catch (error) {
        // Continue to next host/port
      }
    }
  }

  console.error(`❌ ${service} emulator not found. Make sure it's running with 'firebase emulators:start'`);
  return null;
}

async function main() {
  const hosts = ['localhost', '[::1]', '127.0.0.1'];

  // Check for Firestore emulator
  const firestoreInfo = await checkEmulator('Firestore', hosts, [8080, 8081, 9000]);

  // Check for Storage emulator
  const storageInfo = await checkEmulator('Storage', hosts, [9199, 9200, 9000]);

  if (!firestoreInfo || !storageInfo) {
    console.error('\n❌ One or more emulators were not found.');
    console.log('\nPlease ensure Firebase emulators are running with:');
    console.log('  firebase emulators:start');
    console.log('\nThen check the emulator UI at http://127.0.0.1:4000 to verify they started correctly.');
    process.exit(1);
  } else {
    console.log('\n✅ All required emulators are running.');
    console.log(`\nFirestore: ${firestoreInfo.host}:${firestoreInfo.port}`);
    console.log(`Storage: ${storageInfo.host}:${storageInfo.port}`);
    console.log('\nYou can now run the security rules tests.');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Error checking emulators:', error);
  process.exit(1);
});
