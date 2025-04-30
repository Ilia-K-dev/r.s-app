import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// --- Environment Variable Debugging ---
function debugEnvironmentVariables() {
  console.log('--- DEBUGGING ENVIRONMENT VARIABLES ---');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  // Log all REACT_APP_ variables found
  const reactAppVars = Object.keys(process.env).filter(key => key.startsWith('REACT_APP_'));
  console.log('Found REACT_APP_ variables:', reactAppVars);

  // Log specific Firebase keys and their values (or indicate if missing)
  const firebaseKeys = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];
  firebaseKeys.forEach(key => {
    console.log(`${key}:`, process.env[key] ? '*** SET ***' : '!!! NOT SET !!!'); // Avoid logging actual keys
  });
  console.log('--- END DEBUGGING ---');
}

// Call debug function early, only in development
if (process.env.NODE_ENV === 'development') {
  debugEnvironmentVariables();
}
// --- End Debugging ---


// Define required environment variable keys
const requiredEnvKeys = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

// Validate environment variables before creating the config object
const validateEnvVariables = () => {
  console.log("Validating Firebase environment variables...");
  const missingKeys = requiredEnvKeys.filter(key => 
    !process.env[key] || process.env[key].trim() === ''
  );
  
  if (missingKeys.length > 0) {
    const errorMsg = `CRITICAL ERROR: Missing or empty Firebase environment variables: ${missingKeys.join(', ')}. Check your .env file (e.g., .env.development in client/ folder), ensure all required REACT_APP_FIREBASE_... variables are set correctly, and restart the development server.`;
    console.error(errorMsg); 
    throw new Error(errorMsg); 
  }
  console.log("Firebase environment variables validated successfully.");
};

// Validate environment variables immediately
validateEnvVariables(); 

// Create the config object using the validated environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
  // Initialization check
  if (!getApps().length) {
    console.log("Initializing Firebase app...");
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized.");
  } else {
    console.log("Firebase app already initialized.");
    app = getApps()[0]; 
  }

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log("Firebase services (Auth, Firestore, Storage) initialized.");

} catch (error) {
  if (!error.message.startsWith('CRITICAL ERROR')) {
      console.error('Firebase service initialization failed:', error);
  }
  throw error; 
}

// Export initialized services
export { auth, db, storage, app }; 
export default app;
