const admin = require('firebase-admin');

// Set emulator environment variables with correct ports
// Make sure this matches actual emulator port
process.env.FIRESTORE_EMULATOR_HOST = "localhost:8081"; // Correct Firestore emulator port
// Make sure this matches actual emulator port
process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9100"; // Correct Auth emulator port

// Add timeout to prevent hanging
setTimeout(() => {
  console.error('Verification script timed out after 15 seconds');
  process.exit(1);
}, 15000);

// Initialize Firebase Admin
// Simplify admin initialization to rely on environment variables for emulator connection
admin.initializeApp({
  projectId: 'demo-receipt-scanner'
});

const db = admin.firestore();
const auth = admin.auth();

async function verifySeeding() {
  console.log('Verifying Firebase emulator data seeding...');

  // Verify Auth users
  try {
    console.log('\nChecking Authentication users:');
    // List users is not fully supported in emulator, so check specific users
    try {
      const user1 = await auth.getUser('user1');
      console.log('✅ User1 exists:', user1.uid, user1.email);
    } catch (error) {
      console.error('❌ User1 not found:', error.message);
    }

    try {
      const user2 = await auth.getUser('user2');
      console.log('✅ User2 exists:', user2.uid, user2.email);
    } catch (error) {
      console.error('❌ User2 not found:', error.message);
    }
  } catch (error) {
    console.error('Error checking Auth users:', error);
  }

  // Verify Firestore collections
  try {
    console.log('\nChecking Firestore collections:');
    const collections = ['receipts', 'documents', 'inventory', 'stockMovements', 'users'];

    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).limit(5).get();
        console.log(`✅ Collection '${collectionName}' has ${snapshot.size} documents`);

        if (snapshot.size > 0) {
          // Log the first document as an example
          const firstDoc = snapshot.docs[0];
          console.log(`  Sample document ${firstDoc.id}:`, firstDoc.data());
        }
      } catch (error) {
        console.error(`❌ Error checking collection '${collectionName}':`, error.message);
      }
    }
  } catch (error) {
    console.error('Error checking Firestore collections:', error);
  }

  console.log('\nVerification completed.');
}

verifySeeding()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
