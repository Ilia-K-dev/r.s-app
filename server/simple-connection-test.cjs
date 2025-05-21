const admin = require('firebase-admin');

// Set actual emulator ports from your console output
// Use consistent IPv4 addressing (localhost) and actual emulator ports to address addressing and port mismatches
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081"; // Correct Firestore emulator port
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9100"; // Correct Auth emulator port

// Add timeout to prevent hanging
setTimeout(() => {
  console.error('Test timed out after 10 seconds');
  process.exit(1);
}, 10000);

// Simple initialization
// Simplify admin initialization to rely on environment variables for emulator connection
admin.initializeApp({
  projectId: 'demo-receipt-scanner' // Use project ID from new prompt
});

// Test Firestore with a simple read operation
console.log('Testing Firestore connection...');
admin.firestore().collection('test').get()
  .then(snapshot => {
    console.log('✅ Firestore connection successful!');

    // Now test Auth
    console.log('Testing Auth connection...');
    return admin.auth().listUsers(1);
  })
  .then(() => {
    console.log('✅ Auth connection successful!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Connection test failed:', error);
    process.exit(1);
  });
