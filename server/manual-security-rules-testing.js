const admin = require('firebase-admin');
const fs = require('fs');
const { resolve } = require('path');

// Initialize the admin SDK
try {
  admin.initializeApp({
    projectId: 'project-reciept-reader-id'
  });

  // Set up emulator connection
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081';

  const db = admin.firestore();

  // Function to test security rules manually
  async function testSecurityRules() {
    console.log('=== Manual Security Rules Testing ===');

    // 1. Clear existing data
    console.log('Clearing test data...');
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const deletePromises = [];
    snapshot.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });
    await Promise.all(deletePromises);

    // 2. Create test user documents
    console.log('Creating test user documents...');
    await usersRef.doc('test-user-1').set({
      name: 'Test User 1',
      email: 'user1@example.com',
      userId: 'test-user-1',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await usersRef.doc('test-user-2').set({
      name: 'Test User 2',
      email: 'user2@example.com',
      userId: 'test-user-2',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('Test data created successfully.');
    console.log('You can now run the security rules tests.');

    // 3. Output test command
    console.log('\nTo run the tests, use:');
    console.log('cd server ; npx jest tests/security/simplified-firestore.test.js');
  }

  // Run the test
  testSecurityRules().catch(error => {
    console.error('Error during manual testing:', error);
  });

} catch (error) {
  console.error('Failed to initialize admin SDK:', error);
}
