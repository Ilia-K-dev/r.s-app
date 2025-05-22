// This script creates test users in the Firebase Authentication emulator

// This script creates test users in the Firebase Authentication emulator

// Set emulator environment variables
// Set emulator environment variables
// Use consistent IPv4 addressing (localhost) and actual emulator ports to address addressing and port mismatches
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081"; // Correct Firestore emulator port
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9100"; // Correct Auth emulator port
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199"; // Correct Storage emulator port

const admin = require('firebase-admin'); // Use CommonJS modules to address module system conflicts

console.log('Starting Authentication data seeding script...');

// Check if already initialized
if (admin.apps.length === 0) {
  // Check if running in emulator and initialize accordingly
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.log('Running in Authentication emulator environment.');
    // Simplify admin initialization to rely on environment variables for emulator connection
    admin.initializeApp({
      projectId: 'demo-receipt-scanner' // Use project ID from new prompt
    });
  } else {
    console.log('Running in production or other environment.');
    admin.initializeApp({
      projectId: 'project-reciept-reader-id',
      credential: admin.credential.applicationDefault(),
    });
  }
}

const auth = admin.auth();

// Test users to create
const testUsers = [
  {
    uid: 'user1',
    email: 'user1@example.com',
    password: 'password123',
    displayName: 'Test User 1'
  },
  {
    uid: 'user2',
    email: 'user2@example.com',
    password: 'password123',
    displayName: 'Test User 2'
  }
];

async function seedAuthentication() {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempting Authentication data seeding (Attempt ${i + 1}/${maxRetries})...`);

      // Clear existing users first
      try {
        console.log('Clearing existing users...');
        // List all users is not supported in the emulator, so we'll try to delete the known test users
        for (const user of testUsers) {
          try {
            await auth.deleteUser(user.uid);
            console.log(`  Deleted user: ${user.uid}`);
          } catch (error) {
            // User might not exist, ignore
          }
        }
      } catch (error) {
        console.log('Failed to clear users, continuing with creation');
      }

      // Create new test users
      for (const user of testUsers) {
        try {
          await auth.createUser({
            uid: user.uid,
            email: user.email,
            password: user.password,
            displayName: user.displayName,
            emailVerified: true
          });
          console.log(`  Created user: ${user.uid} (${user.email})`);
        } catch (error) {
          console.error(`  Failed to create user ${user.uid}:`, error);
        }
      }

      console.log('Authentication data seeding completed successfully');
      return; // Exit function if successful
    } catch (error) {
      console.error(`Error during Authentication data seeding (Attempt ${i + 1}/${maxRetries}):`, error);
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('Max retries reached for Authentication data seeding.');
        throw error; // Re-throw error if max retries reached
      }
    }
  }
}

// Execute the seeding
seedAuthentication();
