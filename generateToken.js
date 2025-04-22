const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  signInWithEmailAndPassword, 
  AuthErrorCodes 
} = require('firebase/auth');
const { admin } = require('./server/config/firebase');

// Firebase Web App Configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);

/**
 * Generate an ID token for a given email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<string>} - ID token
 */
const generateIdToken = async (email, password) => {
  try {
    // Get Firebase Auth instance
    const auth = getAuth(firebaseApp);

    // Sign in the user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get the ID token
    const idToken = await userCredential.user.getIdToken();
    
    console.log('Generated ID Token:', idToken);
    
    // Optional: Verify the token using Admin SDK (for demonstration)
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log('Token Verification Successful');
      console.log('Decoded Token:', decodedToken);
    } catch (verificationError) {
      console.error('Token Verification Failed:', verificationError);
    }

    return idToken;
  } catch (error) {
    console.error('Error generating ID token:', error);

    // Provide more detailed error handling
    if (error.code === AuthErrorCodes.INVALID_PASSWORD) {
      console.error('Invalid password');
    } else if (error.code === AuthErrorCodes.USER_DELETED) {
      console.error('User not found');
    }

    throw error;
  }
};

// Function to demonstrate token generation
const runTokenGeneration = async () => {
  try {
    // Replace with your test user's email and password
    const testEmail = 'your-test-email@example.com';
    const testPassword = 'your-test-password';

    const idToken = await generateIdToken(testEmail, testPassword);
    
    console.log('ID Token successfully generated and verified');
    return idToken;
  } catch (error) {
    console.error('Token generation failed:', error);
    process.exit(1);
  }
};

// Run the token generation script
if (require.main === module) {
  runTokenGeneration();
}

module.exports = {
  generateIdToken,
  runTokenGeneration
};