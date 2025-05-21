// File: client/src/core/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Log configuration and initialization steps
function log(message) {
  console.log(`[Firebase] ${message}`);
}

// Firebase configuration - Using environment variables with fallbacks for development
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAWx_ZcWGx8XoCl-fWO8TPJi7hzDrWjQ",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "project-reciept-reader-id.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "project-reciept-reader-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "project-reciept-reader-id.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "7474182423",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:747418219423:web:f77288088223d55c3aa",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-C7KLBLG2"
};

// Initialize Firebase
log("Initializing Firebase app...");
const app = initializeApp(firebaseConfig);
log("Firebase app initialized successfully");

// Initialize services
const auth = getAuth(app);
log("Auth service initialized");

const db = getFirestore(app);
log("Firestore service initialized");

// Enable offline persistence for Firestore
// This allows the app to work offline and sync data when back online.
// The default cache size is 40 MB. Consider setting a specific cache size limit
// based on expected data volume and device storage constraints if needed.
enableIndexedDbPersistence(db)
  .then(() => {
    log("Firestore offline persistence enabled");
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      log("Firestore persistence failed: Multiple tabs open.");
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      log("Firestore persistence failed: Browser does not support persistence.");
    } else {
      log("Firestore persistence failed:", err);
    }
  });

const storage = getStorage(app);
log("Storage service initialized");

// Export Firebase services
export { app, auth, db, storage };
