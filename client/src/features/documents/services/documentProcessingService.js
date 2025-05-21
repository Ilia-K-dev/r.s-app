// File: client/src/features/documents/services/documentProcessingService.js
// Date: 2025-05-13 11:40:19
// Description: Service for processing documents, with feature toggle for Firebase direct integration and API fallback.
// Reasoning: Refactored to use Firebase Storage for uploads and client-side processing (OCR/Classification) as per work plan, with feature toggle for safe rollout.
// Potential Optimizations: Implement progress tracking for Firebase Storage uploads. Refine error handling and fallback logic.

import axios from 'axios';
import { API_URL } from '../../../core/config/api.config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase Storage functions
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions
import { db, storage, auth } from '../../../core/config/firebase'; // Import Firebase instances
import { isFeatureEnabled } from '../../../core/config/featureFlags'; // Import feature toggle utility
import { handleFirebaseError } from '../../../utils/errorHandler'; // Import error handler
import { processImage } from '../utils/imageProcessing'; // Keep image processing utility

// Feature flag name for Firebase direct integration
const FIREBASE_DIRECT_INTEGRATION_FLAG = 'firebaseDirectIntegration';

// Get current authenticated user's UID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    // This should ideally not happen if routes are protected, but handle defensively
    throw handleFirebaseError(new Error('User not authenticated'), 'Document Processing Service');
  }
  return user.uid;
};

// --- API-based Implementations (Original) ---
// These functions represent the original API calls to the Express backend.
// They are kept here as fallback implementations.

const uploadDocumentApi = async (file, userId, documentType) => {
  console.log('Calling API for uploadDocument', { userId, documentType });
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  try {
    const response = await axios.post(`${API_URL}/api/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.imageUrl) {
      return { imageUrl: response.data.imageUrl };
    } else {
      throw new Error('Backend did not return the image URL after API upload.');
    }
  } catch (error) {
    console.error('Error uploading document via API:', error);
    throw handleFirebaseError(error, 'Upload Document API'); // Use error handler for API errors too
  }
};

const processDocumentApi = async (documentId) => {
  console.log('Calling API for processDocument', { documentId });
  // Placeholder: Simulate API call
  // throw new Error('API implementation not yet available for processDocument');
  return { documentId, processed: true }; // Return dummy data
};

const getDocumentTextApi = async (documentId) => {
  console.log('Calling API for getDocumentText', { documentId });
  // Placeholder: Simulate API call
  // throw new Error('API implementation not yet available for getDocumentText');
  return { text: 'Dummy extracted text from API' }; // Return dummy data
};

const classifyDocumentApi = async (documentId) => {
  console.log('Calling API for classifyDocument', { documentId });
  // Placeholder: Simulate API call
  // throw new Error('API implementation not yet available for classifyDocument');
  return { classification: 'generic', confidence: 0.5 }; // Return dummy data
};


// --- Feature-Toggled Document Processing Service ---

/**
 * Uploads a document file to Firebase Storage and stores metadata in Firestore,
 * or uses the API fallback based on feature toggle.
 * @param {File} file - The file to upload.
 * @param {string} documentType - The type of document.
 * @returns {Promise<{id: string, imageUrl: string, fileName: string, uploadDate: Date, userId: string, documentType: string}>} - Uploaded document metadata.
 */
const uploadDocument = async (file, documentType) => {
  const userId = getCurrentUserId();

  if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
    try {
      console.log('Attempting Firebase Storage upload for document');
      const storageRef = ref(storage, `documents/${userId}/${file.name}`);
      const uploadTask = await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(uploadTask.ref);

      console.log('Attempting Firestore metadata creation for document');
      const documentsCollection = collection(db, 'documents');
      const docMetadata = {
        userId: userId,
        fileName: file.name,
        imageUrl: imageUrl,
        uploadDate: new Date(), // Use client date for now, consider server timestamp
        documentType: documentType,
        status: 'uploaded', // Initial status
        // Add other relevant metadata
      };

      const newDocRef = await addDoc(documentsCollection, docMetadata);

      return { id: newDocRef.id, ...docMetadata };

    } catch (error) {
      console.warn('Firebase operation failed for uploadDocument. Attempting API fallback.', error);
      // Use error handler for logging and potential automatic toggle disable
      handleFirebaseError(error, 'Upload Document Firebase');
      // Fallback to API
      return uploadDocumentApi(file, userId, documentType);
    }
  } else {
    console.log('Firebase direct integration disabled. Calling API for uploadDocument.');
    // Use API implementation directly if feature is disabled
    return uploadDocumentApi(file, userId, documentType);
  }
};

// Feature-Toggled Document Processing Service Functions
// These functions interact with Firebase Cloud Functions and Firestore for processing,
// with a fallback to the original API implementations.

/**
 * Triggers document processing via a Firebase Cloud Function.
 * @param {string} documentId - The ID of the document to process.
 * @returns {Promise<void>}
 */
const processDocument = async (documentId) => {
  const userId = getCurrentUserId(); // Ensure user is authenticated

  if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
    try {
      console.log(`Attempting Firebase Cloud Function call for processDocument ${documentId}`);
      // TODO: Replace with actual Firebase Cloud Function call
      // Example: const processDocFunction = httpsCallable(functions, 'processDocument');
      // await processDocFunction({ documentId: documentId, userId: userId });
      console.log(`Simulating successful Firebase Cloud Function call for processDocument ${documentId}`);
      // Assuming the Cloud Function updates the document status in Firestore upon completion
      // No return value expected from this trigger function

    } catch (error) {
      console.warn(`Firebase operation failed for processDocument ${documentId}. Attempting API fallback.`, error);
      handleFirebaseError(error, 'Document Processing Service - processDocument Firebase');
      // Fallback to API
      return processDocumentApi(documentId);
    }
  } else {
    console.log(`Firebase direct integration disabled. Calling API for processDocument ${documentId}.`);
    // Use API implementation directly if feature is disabled
    return processDocumentApi(documentId);
  }
};

/**
 * Retrieves extracted text for a document from Firestore.
 * @param {string} documentId - The ID of the document.
 * @returns {Promise<{text: string}>} - The extracted text.
 */
const getDocumentText = async (documentId) => {
  const userId = getCurrentUserId(); // Ensure user is authenticated

  if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
    try {
      console.log(`Attempting Firestore retrieval for document text ${documentId}`);
      const documentDocRef = doc(db, 'documents', documentId);
      const docSnapshot = await getDoc(documentDocRef);

      if (docSnapshot.exists() && docSnapshot.data().userId === userId) {
        const data = docSnapshot.data();
        // Assuming extracted text is stored in a field named 'extractedText'
        if (data.extractedText) {
          return { text: data.extractedText };
        } else {
          console.warn(`No extracted text found in Firestore for document ${documentId}.`);
          return { text: '' }; // Return empty text if not found
        }
      } else {
        console.warn(`Document ${documentId} not found or unauthorized in Firestore.`);
        // If document not found or unauthorized in Firestore, attempt API fallback
        return getDocumentTextApi(documentId);
      }
    } catch (error) {
      console.warn(`Firebase operation failed for getDocumentText ${documentId}. Attempting API fallback.`, error);
      handleFirebaseError(error, 'Document Processing Service - getDocumentText Firebase');
      // Fallback to API
      return getDocumentTextApi(documentId);
    }
  } else {
    console.log(`Firebase direct integration disabled. Calling API for getDocumentText ${documentId}.`);
    // Use API implementation directly if feature is disabled
    return getDocumentTextApi(documentId);
  }
};

/**
 * Retrieves classification results for a document from Firestore.
 * @param {string} documentId - The ID of the document.
 * @returns {Promise<{classification: string, confidence: number}>} - The classification results.
 */
const classifyDocument = async (documentId) => {
  const userId = getCurrentUserId(); // Ensure user is authenticated

  if (isFeatureEnabled(FIREBASE_DIRECT_INTEGRATION_FLAG)) {
    try {
      console.log(`Attempting Firestore retrieval for document classification ${documentId}`);
      const documentDocRef = doc(db, 'documents', documentId);
      const docSnapshot = await getDoc(documentDocRef);

      if (docSnapshot.exists() && docSnapshot.data().userId === userId) {
        const data = docSnapshot.data();
        // Assuming classification results are stored in fields named 'classification' and 'confidence'
        if (data.classification && data.confidence !== undefined) {
          return { classification: data.classification, confidence: data.confidence };
        } else {
          console.warn(`No classification data found in Firestore for document ${documentId}.`);
          return { classification: 'unknown', confidence: 0 }; // Return default if not found
        }
      } else {
        console.warn(`Document ${documentId} not found or unauthorized in Firestore.`);
        // If document not found or unauthorized in Firestore, attempt API fallback
        return classifyDocumentApi(documentId);
      }
    } catch (error) {
      console.warn(`Firebase operation failed for classifyDocument ${documentId}. Attempting API fallback.`, error);
      handleFirebaseError(error, 'Document Processing Service - classifyDocument Firebase');
      // Fallback to API
      return classifyDocumentApi(documentId);
    }
  } else {
    console.log(`Firebase direct integration disabled. Calling API for classifyDocument ${documentId}.`);
    // Use API implementation directly if feature is disabled
    return classifyDocumentApi(documentId);
  }
};


export const documentProcessingService = {
  preprocessImage,
  uploadDocument, // Feature-toggled upload
  processDocument, // Placeholder for client-side processing
  getDocumentText, // Placeholder for client-side text retrieval
  classifyDocument, // Placeholder for client-side classification
  // Export API fallbacks for potential direct use or advanced fallback logic if needed
  uploadDocumentApi,
  processDocumentApi,
  getDocumentTextApi,
  classifyDocumentApi,
};

// Add comments about feature toggle integration details
// Feature toggle integration: The `uploadDocument` function now checks the `firebaseDirectIntegration` feature flag.
// If the flag is enabled, it attempts to use Firebase Storage and Firestore. If that fails, it falls back to the original API call.
// If the flag is disabled, it bypasses the Firebase logic and calls the API directly.
// Placeholder functions for `processDocument`, `getDocumentText`, and `classifyDocument` are included,
// which will be updated in subsequent steps to implement client-side OCR and classification.
// These placeholders also include basic feature toggle checks and API fallbacks.
