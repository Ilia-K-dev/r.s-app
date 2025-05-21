// CommonJS version
const { execSync } = require('child_process');
const { setTimeout } = require('timers/promises');

async function runWithRetry(command, retries = 5, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Running: ${command} (attempt ${attempt}/${retries})`);
      execSync(command, { stdio: 'inherit' });
      return true; // Success
    } catch (error) {
      console.error(`Attempt ${attempt} failed with error:`, error.message);
      if (attempt < retries) {
        console.log(`Waiting ${delay/1000} seconds before retrying...`);
        await setTimeout(delay);
      } else {
        console.error(`All ${retries} attempts failed for command: ${command}`);
        return false;
      }
    }
  }
}

async function seedAll() {
  console.log('Starting Firebase emulator seeding...');

  // Wait for emulators to fully initialize
  await setTimeout(5000);

  // First test connectivity
  console.log('Testing emulator connectivity...');
  const connectivityTest = await runWithRetry('node test-emulator-connection.js'); // test-emulator-connection.js is now CommonJS and uses correct ports
  if (!connectivityTest) {
    console.error('Emulator connectivity test failed after multiple attempts.');
    process.exit(1);
  }

  // Run seed scripts with retry logic
  const authSuccess = await runWithRetry('node seed-auth.cjs'); // Call the .cjs version
  if (authSuccess) {
    console.log('Auth seeding completed successfully');
  }

  const firestoreSuccess = await runWithRetry('node seed-firestore.cjs'); // Call the .cjs version
  if (firestoreSuccess) {
    console.log('Firestore seeding completed successfully');
  }

  console.log('Seeding process finished.');
}

seedAll().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
