// File: client/src/core/config/firebase.js
// Date: 2025-05-10
// Description: Firebase configuration and service initialization.
// Reasoning: Initializes Firebase app and services (Auth, Firestore, Storage) and configures offline persistence for Firestore.
// Potential Optimizations: Replace hardcoded config with environment variables for production.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'; // Import enableIndexedDbPersistence
import { getStorage } from 'firebase/storage';

// Log configuration and initialization steps
function log(message) {
  console.log(`[Firebase] ${message}`);
}

// Hardcoded configuration for development only
// In production, this would be replaced with environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAWx_ZcWGx8XoCl-fWO8TPJi7hzDrWjQ",
  authDomain: "project-reciept-reader-id.firebaseapp.com",
  projectId: "project-reciept-reader-id",
  storageBucket: "project-reciept-reader-id.appspot.com",
  messagingSenderId: "7474182423",
  appId: "1:747418219423:web:f77288088223d55c3aa",
  measurementId: "G-C7KLBLG2"
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
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      log("Firestore persistence failed: Multiple tabs open.");
    } else if (err.code == 'unimplemented') {
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
