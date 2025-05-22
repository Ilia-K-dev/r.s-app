// CommonJS version
// Set emulator environment variables with correct ports and use localhost for consistency
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081"; // Correct Firestore emulator port
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9100"; // Correct Auth emulator port
process.env.FIREBASE_STORAGE_EMULATOR_HOST = "localhost:9199"; // Correct Storage emulator port

const admin = require('firebase-admin'); // Use CommonJS modules for consistency

// Initialize Firebase Admin
// Simplify admin initialization to rely on environment variables for emulator connection
admin.initializeApp({
  projectId: 'demo-receipt-scanner'
});

async function testConnections() {
  try {
    console.log('Testing Firestore connection...');
    const db = admin.firestore();
    console.log('Attempting to write to Firestore...');
    await db.collection('test').doc('connection-test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: 'Connection successful'
    });
    console.log('Firestore write successful.');
    console.log('✅ Firestore connection successful!');

    console.log('Testing Auth connection...');
    console.log('Attempting to create test user...');
    try {
      const userRecord = await admin.auth().createUser({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      });
      console.log('Auth user creation successful.');
      console.log('✅ Auth connection successful! Created user:', userRecord.uid);

      // Clean up test user
      console.log('Attempting to delete test user...');
      await admin.auth().deleteUser(userRecord.uid);
      console.log('Test user deleted.');
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('✅ Auth connection successful! (User already exists)');
      } else {
        throw error;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

testConnections()
  .then(success => {
    if (!success) process.exit(1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
