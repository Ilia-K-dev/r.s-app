// Import required libraries
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Initialize the app with emulator settings
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
initializeApp({ projectId: 'project-reciept-reader-id' });

// Get a firestore instance
const db = getFirestore();

// Basic test function
async function testFirestoreConnection() {
  try {
    console.log('Testing connection to Firestore emulator...');

    // Basic write operation
    const docRef = db.collection('test-collection').doc('test-doc');
    await docRef.set({ test: true });
    console.log('✓ Successfully wrote to Firestore emulator');

    // Basic read operation
    const docSnap = await docRef.get();
    console.log('✓ Successfully read from Firestore emulator:', docSnap.data());

    console.log('Connection test successful!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testFirestoreConnection();
