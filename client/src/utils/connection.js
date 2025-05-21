// File: client/src/utils/connection.js
// Date: 2025-05-10
// Description: Utility and hook for monitoring Firebase connection state.
// Reasoning: Provides real-time information about the application's connection to Firebase, enabling offline features and UI feedback.
// Potential Optimizations: Could add more detailed network status checks beyond just Firebase connection.

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database'; // Assuming Firebase Realtime Database is available for .info/connected
import { getDatabase } from 'firebase/database'; // Import getDatabase

// Get Realtime Database instance (assuming it's initialized elsewhere or can be initialized here)
// If Realtime Database is NOT used otherwise, consider if this is the best approach
// or if a different method for detecting network status is preferred.
// For now, assuming Realtime Database is available or can be added.
// NOTE: Need to ensure Realtime Database is initialized in firebase.js if not already.
// For now, we'll get the default instance.
let database;
try {
  database = getDatabase(); // Get default Realtime Database instance
} catch (e) {
  console.warn("Firebase Realtime Database not initialized. Connection monitoring may not work.", e);
  // Provide a fallback or handle this case appropriately
}


/**
 * Hook to monitor the application's connection state to Firebase.
 * @returns {boolean} True if connected, false otherwise.
 */
export const useFirebaseConnection = () => {
  const [isConnected, setIsConnected] = useState(true); // Assume connected initially

  useEffect(() => {
    if (!database) {
      // If database is not initialized, cannot monitor connection
      console.warn("Firebase Realtime Database not available for connection monitoring.");
      return;
    }

    const connectedRef = ref(database, '.info/connected');

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      setIsConnected(snapshot.val());
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []); // Empty dependency array means this effect runs once on mount

  return isConnected;
};

// You could also export the raw connection state if needed elsewhere
// export const firebaseConnectionState = useFirebaseConnection(); // This won't work outside a component/hook

// Utility function to get current connection status (less reactive than hook)
// export const checkFirebaseConnection = async () => {
//   if (!database) {
//     console.warn("Firebase Realtime Database not available for connection check.");
//     return false; // Or throw an error
//   }
//   const connectedRef = ref(database, '.info/connected');
//   const snapshot = await get(connectedRef); // Requires 'get' from 'firebase/database'
//   return snapshot.val();
// };
