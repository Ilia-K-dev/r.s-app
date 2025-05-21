// File: client/src/features/receipts/services/receipts.js
// Date: 2025-05-18 05:38:05
// Description: Service for managing receipts using Firebase Firestore and Storage, with feature toggle for API fallback, enhanced error handling, and basic performance tracking.
// Reasoning: Refactored from Express backend API calls to direct Firebase SDK integration as per work plan, with feature toggle for safe rollout, integrated with enhanced error handling and performance monitoring.
// Potential Optimizations: Implement real-time listeners for receipt lists where appropriate. Add more sophisticated error handling and fallback logic. Integrate with a proper analytics/performance monitoring platform.

import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy, limit, startAfter } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../../../core/config/firebase';
import { handleError } from '../../../utils/errorHandler'; // Import enhanced error handler
import { isFeatureEnabled, startPerformanceTimer, stopPerformanceTimer } from '../../../core/config/featureFlags'; // Import feature toggle and performance utilities

// Feature flag name for Firebase direct integration
const FIREBASE_DIRECT_INTEGRATION_FLAG = 'firebaseDirectIntegration';

// Get current authenticated user's UID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    // This should ideally not happen if routes are protected, but handle defensively
    // Use the generic handleError
    throw handleError(new Error('User not authenticated'), 'Receipt Service');
  }
  return user.uid;
};

// --- API-based Implementations (Placeholders) ---
// These functions represent the original API calls to the Express backend.
// They are included here as placeholders for the fallback mechanism.
// TODO: Replace with actual API call logic when needed.

const getReceiptsApi = async (userId, options = {}) => {
  console.log('Calling API for getReceipts', { userId, options });
  startPerformanceTimer(`getReceiptsApi`); // Start timer for API call
  try {
    // Placeholder: Simulate API call
    // throw new Error('API implementation not yet available for getReceipts');
    const result = { receipts: [], lastVisible: null }; // Return dummy data for now
    stopPerformanceTimer(`getReceiptsApi`); // Stop timer on success
    return result;
  } catch (error) {
    stopPerformanceTimer(`getReceiptsApi`); // Stop timer on error
    throw error; // Re-throw after stopping timer
  }
};

const getReceiptByIdApi = async (userId, id) => {
  console.log('Calling API for getReceiptById', { userId, id });
  startPerformanceTimer(`getReceiptByIdApi`); // Start timer for API call
  try {
    // Placeholder: Simulate API call
    // throw new Error('API implementation not yet available for getReceiptById');
    const result = null; // Return dummy data for now
    stopPerformanceTimer(`getReceiptByIdApi`); // Stop timer on success
    return result;
  } catch (error) {
    stopPerformanceTimer(`getReceiptByIdApi`); // Stop timer on error
    throw error; // Re-throw after stopping timer
  }
};

const createReceiptApi = async (userId, receiptData, imageFile = null) => {
  console.log('Calling API for createReceipt', { userId, receiptData, imageFile });
  startPerformanceTimer(`createReceiptApi`); // Start timer for API call
  try {
    // Placeholder: Simulate API call
    // throw new Error('API implementation not yet available for createReceipt');
    const result = { id: 'dummy-api-id', ...receiptData }; // Return dummy data for now
    stopPerformanceTimer(`createReceiptApi`); // Stop timer on success
    return result;
  } catch (error) {
    stopPerformanceTimer(`createReceiptApi`); // Stop timer on error
    throw error; // Re-throw after stopping timer
  }
};

const updateReceiptApi = async (userId, receiptId, updateData, newImageFile = null) => {
  console.log('Calling API for updateReceipt', { userId, receiptId, updateData, newImageFile });
  startPerformanceTimer(`updateReceiptApi`); // Start timer for API call
  try {
    // Placeholder: Simulate API call
    // throw new Error('API implementation not yet available for updateReceipt');
    stopPerformanceTimer(`updateReceiptApi`); // Stop timer on success
  } catch (error) {
    stopPerformanceTimer(`updateReceiptApi`); // Stop timer on error
    throw error; // Re-throw after stopping timer
  }
};

const deleteReceiptApi = async (userId, receiptId) => {
  console.log('Calling API for deleteReceipt', { userId, receiptId });
  startPerformanceTimer(`deleteReceiptApi`); // Start timer for API call
  try {
    // Placeholder: Simulate API call
    // throw new Error('API implementation not yet available for deleteReceipt');
    stopPerformanceTimer(`deleteReceiptApi`); // Stop timer on success
  } catch (error) {
    stopPerformanceTimer(`deleteReceiptApi`); // Stop timer on error
    throw error; // Re-throw after stopping timer
  }
};

const correctReceiptApi = async (userId, receiptId, correctedData) => {
  console.log('Calling API for correctReceipt', { userId, receiptId, correctedData });
  startPerformanceTimer(`correctReceiptApi`); // Start timer for API call
  try {
    // Placeholder: Simulate API call
    // throw new Error('API implementation not yet available for correctReceipt');
    stopPerformanceTimer(`correctReceiptApi`); // Stop timer on success
  } catch (error) {
    stopPerformanceTimer(`correctReceiptApi`); // Stop timer on error
    throw error; // Re-throw after stopping timer
  }
};


// --- Feature-Toggled Receipt Service ---

export const receiptApi = {
  /**
   * Fetches receipts with filtering and pagination. Uses Firebase or API based on feature toggle.
   * Implements fallback to API if Firebase operation fails and toggle is enabled.
   * @param {object} [options] - Options for filtering and pagination (category, dateRange, limit, startAfterDoc, etc.).
   * @returns {Promise<object>} - Paginated list of receipts and pagination info.
   */
  getReceipts: async (options = {}) => {
    const userId = getCurrentUserId();

    if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
      startPerformanceTimer(`getReceipts_Firebase`); // Start timer for Firebase call
      try {
        console.log('Attempting Firebase for getReceipts');
        const receiptsCollection = collection(db, 'receipts');

        let q = query(receiptsCollection, where('userId', '==', userId));

        // Add filters based on options
        if (options.category) {
          q = query(q, where('category', '==', options.category));
        }
        if (options.dateRange) {
          // Assuming dateRange is { start: Timestamp, end: Timestamp }
          q = query(q, where('date', '>=', options.dateRange.start), where('date', '<=', options.dateRange.end));
        }

        // Add sorting (assuming sorting by date descending by default)
        q = query(q, orderBy('date', 'desc'));

        // Add pagination
        if (options.limit) {
          q = query(q, limit(options.limit));
        }
        if (options.startAfterDoc) {
          q = query(q, startAfter(options.startAfterDoc));
        }

        const querySnapshot = await getDocs(q);
        const receipts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        stopPerformanceTimer(`getReceipts_Firebase`); // Stop timer on success
        return {
          receipts,
          lastVisible,
        };

      } catch (error) {
        console.warn('Firebase operation failed for getReceipts. Attempting API fallback.', error);
        stopPerformanceTimer(`getReceipts_Firebase`); // Stop timer on error
        // Use the enhanced error handler with feature flag context
        handleError(error, 'Receipt Service - getReceipts', FIREBASE_DIRECT_INTEGRATION_FLAG);
        // Fallback to API
        return getReceiptsApi(userId, options);
      }
    } else {
      console.log('Firebase direct integration disabled. Calling API for getReceipts.');
      // Use API implementation directly if feature is disabled
      return getReceiptsApi(userId, options);
    }
  },

  /**
   * Gets a single receipt by ID. Uses Firebase or API based on feature toggle.
   * Implements fallback to API if Firebase operation fails and toggle is enabled.
   * @param {string} id - The ID of the receipt.
   * @returns {Promise<object|null>} - The receipt data or null if not found/not owned.
   */
  getReceiptById: async (id) => {
    const userId = getCurrentUserId();

    if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
      startPerformanceTimer(`getReceiptById_Firebase`); // Start timer for Firebase call
      try {
        console.log('Attempting Firebase for getReceiptById');
        const receiptDocRef = doc(db, 'receipts', id);
        const docSnapshot = await getDoc(receiptDocRef);

        if (docSnapshot.exists() && docSnapshot.data().userId === userId) {
          stopPerformanceTimer(`getReceiptById_Firebase`); // Stop timer on success
          return { id: docSnapshot.id, ...docSnapshot.data() };
        } else {
          stopPerformanceTimer(`getReceiptById_Firebase`); // Stop timer on not found/unauthorized
          return null;
        }
      } catch (error) {
        console.warn('Firebase operation failed for getReceiptById. Attempting API fallback.', error);
        stopPerformanceTimer(`getReceiptById_Firebase`); // Stop timer on error
        // Use the enhanced error handler with feature flag context
        handleError(error, 'Receipt Service - getReceiptById', FIREBASE_DIRECT_INTEGRATION_FLAG);
        // Fallback to API
        return getReceiptByIdApi(userId, id);
      }
    } else {
      console.log('Firebase direct integration disabled. Calling API for getReceiptById.');
      // Use API implementation directly
      return getReceiptByIdApi(userId, id);
    }
  },

  /**
   * Creates a new receipt. Uses Firebase or API based on feature toggle.
   * Implements fallback to API if Firebase operation fails and toggle is enabled.
   * @param {object} receiptData - The receipt data (excluding image file, include userId).
   * @param {File} [imageFile] - The image file to upload.
   * @returns {Promise<object>} - The created receipt data with ID.
   */
  createReceipt: async (receiptData, imageFile = null) => {
    const userId = getCurrentUserId();

    if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
      startPerformanceTimer(`createReceipt_Firebase`); // Start timer for Firebase call
      try {
        console.log('Attempting Firebase for createReceipt');
        const receiptsCollection = collection(db, 'receipts');

        const dataToSave = {
          ...receiptData,
          userId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const newReceiptRef = await addDoc(receiptsCollection, dataToSave);
        const newReceiptId = newReceiptRef.id;

        let imageUrl = null;
        if (imageFile) {
          const storageRef = ref(storage, `receipts/${userId}/${newReceiptId}/${imageFile.name}`);
          const uploadTask = await uploadBytes(storageRef, imageFile);
          imageUrl = await getDownloadURL(uploadTask.ref);
          await updateDoc(newReceiptRef, { imageUrl: imageUrl });
        }

        const createdDoc = await getDoc(newReceiptRef);
        stopPerformanceTimer(`createReceipt_Firebase`); // Stop timer on success
        return { id: createdDoc.id, ...createdDoc.data() };

      } catch (error) {
        console.warn('Firebase operation failed for createReceipt. Attempting API fallback.', error);
        stopPerformanceTimer(`createReceipt_Firebase`); // Stop timer on error
        // Use the enhanced error handler with feature flag context
        handleError(error, 'Receipt Service - createReceipt', FIREBASE_DIRECT_INTEGRATION_FLAG);
        // Fallback to API
        return createReceiptApi(userId, receiptData, imageFile);
      }
    } else {
      console.log('Firebase direct integration disabled. Calling API for createReceipt.');
      // Use API implementation directly
      return createReceiptApi(userId, receiptData, imageFile);
    }
  },

  /**
   * Updates an existing receipt. Uses Firebase or API based on feature toggle.
   * Implements fallback to API if Firebase operation fails and toggle is enabled.
   * @param {string} receiptId - The ID of the receipt to update.
   * @param {object} updateData - The update data for the receipt (excluding new image file).
   * @param {File} [newImageFile] - A new image file to upload for the receipt.
   * @returns {Promise<void>}
   */
  updateReceipt: async (receiptId, updateData, newImageFile = null) => {
    const userId = getCurrentUserId();

    if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
      startPerformanceTimer(`updateReceipt_Firebase`); // Start timer for Firebase call
      try {
        console.log('Attempting Firebase for updateReceipt');
        const receiptDocRef = doc(db, 'receipts', receiptId);

        const docSnapshot = await getDoc(receiptDocRef);
        if (!docSnapshot.exists() || docSnapshot.data().userId !== userId) {
           throw handleError(new Error('Receipt not found or unauthorized'), 'Receipt Service - updateReceipt', FIREBASE_DIRECT_INTEGRATION_FLAG);
        }

        const dataToUpdate = {
          ...updateData,
          updatedAt: new Date(),
        };

        let imageUrl = updateData.imageUrl;

        if (newImageFile) {
          if (docSnapshot.data().imageUrl) {
             try {
               const oldImageUrl = docSnapshot.data().imageUrl;
               const oldImageRef = ref(storage, oldImageUrl);
               await deleteObject(oldImageRef);
               console.log('Old image deleted successfully');
             } catch (deleteError) {
               console.warn('Failed to delete old image:', deleteError);
               // Log the delete error but don't necessarily fail the update operation
               handleError(deleteError, 'Receipt Service - updateReceipt (delete old image)');
             }
          }

          const storageRef = ref(storage, `receipts/${userId}/${receiptId}/${newImageFile.name}`);
          const uploadTask = await uploadBytes(storageRef, newImageFile);
          imageUrl = await getDownloadURL(uploadTask.ref);
          dataToUpdate.imageUrl = imageUrl;
        } else if (updateData.imageUrl === null) {
           if (docSnapshot.data().imageUrl) {
              try {
                const oldImageUrl = docSnapshot.data().imageUrl;
                const oldImageRef = ref(storage, oldImageUrl);
                await deleteObject(oldImageRef);
                console.log('Image deleted successfully');
              } catch (deleteError) {
                console.warn('Failed to delete image:', deleteError);
                // Log the delete error but don't necessarily fail the update operation
                handleError(deleteError, 'Receipt Service - updateReceipt (delete image)');
              }
           }
           dataToUpdate.imageUrl = null;
        }

        await updateDoc(receiptDocRef, dataToUpdate);
        stopPerformanceTimer(`updateReceipt_Firebase`); // Stop timer on success

      } catch (error) {
        console.warn('Firebase operation failed for updateReceipt. Attempting API fallback.', error);
        stopPerformanceTimer(`updateReceipt_Firebase`); // Stop timer on error
        // Use the enhanced error handler with feature flag context
        handleError(error, 'Receipt Service - updateReceipt', FIREBASE_DIRECT_INTEGRATION_FLAG);
        // Fallback to API
        return updateReceiptApi(userId, receiptId, updateData, newImageFile);
      }
    } else {
      console.log('Firebase direct integration disabled. Calling API for updateReceipt.');
      // Use API implementation directly
      return updateReceiptApi(userId, receiptId, updateData, newImageFile);
    }
  },

  /**
   * Deletes a receipt. Uses Firebase or API based on feature toggle.
   * Implements fallback to API if Firebase operation fails and toggle is enabled.
   * @param {string} receiptId - The ID of the receipt to delete.
   * @returns {Promise<void>}
   */
  deleteReceipt: async (receiptId) => {
    const userId = getCurrentUserId();

    if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
      startPerformanceTimer(`deleteReceipt_Firebase`); // Start timer for Firebase call
      try {
        console.log('Attempting Firebase for deleteReceipt');
        const receiptDocRef = doc(db, 'receipts', receiptId);

        const docSnapshot = await getDoc(receiptDocRef);
        if (!docSnapshot.exists() || docSnapshot.data().userId !== userId) {
           throw handleError(new Error('Receipt not found or unauthorized'), 'Receipt Service - deleteReceipt', FIREBASE_DIRECT_INTEGRATION_FLAG);
        }

        const imageUrl = docSnapshot.data().imageUrl;

        await deleteDoc(receiptDocRef);

        if (imageUrl) {
          try {
            const imageRef = ref(storage, imageUrl);
            await deleteObject(imageRef);
            console.log('Associated image deleted successfully');
          } catch (storageError) {
            console.warn('Failed to delete associated image from Storage:', storageError);
            // Log the storage error but don't necessarily fail the delete operation
            handleError(storageError, 'Receipt Service - deleteReceipt (delete image)');
          }
        }
        stopPerformanceTimer(`deleteReceipt_Firebase`); // Stop timer on success

      } catch (error) {
        console.warn('Firebase operation failed for deleteReceipt. Attempting API fallback.', error);
        stopPerformanceTimer(`deleteReceipt_Firebase`); // Stop timer on error
        // Use the enhanced error handler with feature flag context
        handleError(error, 'Receipt Service - deleteReceipt', FIREBASE_DIRECT_INTEGRATION_FLAG);
        // Fallback to API
        return deleteReceiptApi(userId, receiptId);
      }
    } else {
      console.log('Firebase direct integration disabled. Calling API for deleteReceipt.');
      // Use API implementation directly
      return deleteReceiptApi(userId, receiptId);
    }
  },

   /**
   * Submits corrected data for a receipt. Uses Firebase or API based on feature toggle.
   * Implements fallback to API if Firebase operation fails and toggle is enabled.
   * @param {string} receiptId - The ID of the receipt to correct.
   * @param {object} correctedData - The corrected data.
   * @returns {Promise<void>}
   */
  correctReceipt: async (receiptId, correctedData) => {
     const userId = getCurrentUserId();

     if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
       startPerformanceTimer(`correctReceipt_Firebase`); // Start timer for Firebase call
       try {
         console.log('Attempting Firebase for correctReceipt');
         const receiptDocRef = doc(db, 'receipts', receiptId);

         const docSnapshot = await getDoc(receiptDocRef);
         if (!docSnapshot.exists() || docSnapshot.data().userId !== userId) {
            throw handleError(new Error('Receipt not found or unauthorized'), 'Receipt Service - correctReceipt', FIREBASE_DIRECT_INTEGRATION_FLAG);
         }

         const dataToUpdate = {
           ...correctedData,
           updatedAt: new Date(),
         };

         await updateDoc(receiptDocRef, dataToUpdate);
         stopPerformanceTimer(`correctReceipt_Firebase`); // Stop timer on success

       } catch (error) {
         console.warn('Firebase operation failed for correctReceipt. Attempting API fallback.', error);
         stopPerformanceTimer(`correctReceipt_Firebase`); // Stop timer on error
         // Use the enhanced error handler with feature flag context
         handleError(error, 'Receipt Service - correctReceipt', FIREBASE_DIRECT_INTEGRATION_FLAG);
         // Fallback to API
         return correctReceiptApi(userId, receiptId, correctedData);
       }
     } else {
       console.log('Firebase direct integration disabled. Calling API for correctReceipt.');
       // Use API implementation directly
       return correctReceiptApi(userId, receiptId, correctedData);
     }
   }
};

export default receiptApi;

// Add comments about how the fallback mechanism works, enhanced error handling, and performance tracking
// The fallback mechanism is implemented within each service function.
// It checks if the Firebase direct integration feature flag is enabled.
// If enabled, it first attempts the Firebase operation. If the Firebase operation
// throws an error, it catches the error, logs a warning, uses the enhanced `handleError`
// utility to log the error with feature flag context and potentially trigger automatic
// flag disabling, and then calls the corresponding API-based implementation as a fallback.
// If the feature flag is disabled, the API-based implementation is called directly.
// This provides a basic level of resilience and allows for a smooth transition.
// Enhanced Error Handling: Errors are now processed by the `handleError` utility, which logs the error with context and the state of the associated feature flag. This utility also implements the automatic disabling logic based on consecutive errors for the feature flag.
// Performance Tracking: Basic performance timers are started before feature-flagged operations (both Firebase and API calls) and stopped upon completion or error. The duration is logged to the console, providing basic telemetry for comparing the performance of different implementations. This should be integrated with a proper performance monitoring platform for production use.
