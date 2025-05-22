// File: client/src/features/documents/services/documentProcessingService.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { storage, db } from '../../../core/config/firebase';
import { isFeatureEnabled } from '../../../core/config/featureFlags';
import { handleFirestoreError, handleStorageError } from '../../../utils/errorHandler';
import api from '../../../shared/services/api';

/**
 * Upload a document to Firebase Storage
 * @param {File|Blob} file - The file to upload
 * @param {string} userId - The user ID
 * @param {string} documentType - The type of document (receipt, invoice, etc.)
 * @param {Object} metadata - Additional metadata for the document
 * @returns {Promise<Object>} Document data including download URL
 */
export const uploadDocument = async (file, userId, documentType, metadata = {}) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('documentProcessingDirectIntegration')) {
      // Create a unique file name
      const fileExtension = file.name ? file.name.split('.').pop() : 'pdf';
      const fileName = `${userId}_${documentType}_${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `documents/${userId}/${documentType}/${fileName}`);

      // Log upload start
      console.log(`[Document Processing] Uploading document to Firebase Storage: ${fileName}`);

      // Upload file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          userId,
          documentType,
          originalName: file.name || 'unknown',
          uploadDate: new Date().toISOString(),
        }
      });

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save metadata to Firestore
      const docData = {
        fileName,
        filePath: snapshot.ref.fullPath,
        downloadURL,
        userId,
        documentType,
        status: 'uploaded',
        createdAt: new Date().toISOString(),
        ...metadata
      };

      // Add document to Firestore
      const docRef = await addDoc(collection(db, 'documents'), docData);

      return {
        id: docRef.id,
        ...docData
      };
    } else {
      // Fallback to API call
      console.log('[Document Processing] Using API fallback for document upload');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('documentType', documentType);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleStorageError(error, 'Document Upload', 'documentProcessingDirectIntegration');
  }
};

/**
 * Process an uploaded document
 * @param {string} documentId - The document ID
 * @param {Object} processingOptions - Options for document processing
 * @returns {Promise<Object>} Processed document data
 */
export const processDocument = async (documentId, processingOptions = {}) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('documentProcessingDirectIntegration')) {
      // Get document from Firestore
      const docRef = doc(db, 'documents', documentId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        throw new Error('Document not found');
      }

      const documentData = docSnapshot.data();

      // Update document status to 'processing'
      await updateDoc(docRef, {
        status: 'processing',
        processingStartedAt: new Date().toISOString()
      });

      // For direct Firebase integration, we're simulating processing here
      // In a real implementation, you might trigger a Cloud Function
      // or use a client-side processing library

      // Simulate processing time
      console.log(`[Document Processing] Processing document: ${documentId}`);

      // Here you would implement actual processing logic based on document type
      // For example, OCR for receipts, data extraction for invoices, etc.

      // For this implementation, we'll simulate a successful processing result
      const processingResults = {
        extractedText: "Sample extracted text for demonstration purposes",
        detectedFields: {
          date: new Date().toISOString().split('T')[0],
          total: "42.99",
          merchant: "Sample Merchant"
        },
        confidence: 0.95,
        processingOptions
      };

      // Update document with processing results
      await updateDoc(docRef, {
        status: 'processed',
        processingCompletedAt: new Date().toISOString(),
        processingResults
      });

      return {
        id: documentId,
        ...documentData,
        status: 'processed',
        processingResults
      };
    } else {
      // Fallback to API call
      console.log('[Document Processing] Using API fallback for document processing');
      const response = await api.post(`/documents/${documentId}/process`, processingOptions);
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Document Processing', 'documentProcessingDirectIntegration');
  }
};

/**
 * Get document details
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} Document data
 */
export const getDocument = async (documentId) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('documentProcessingDirectIntegration')) {
      // Get document from Firestore
      const docRef = doc(db, 'documents', documentId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        throw new Error('Document not found');
      }

      return {
        id: documentId,
        ...docSnapshot.data()
      };
    } else {
      // Fallback to API call
      console.log('[Document Processing] Using API fallback for document retrieval');
      const response = await api.get(`/documents/${documentId}`);
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Document Retrieval', 'documentProcessingDirectIntegration');
  }
};

/**
 * Get documents for a user
 * @param {string} userId - The user ID
 * @param {Object} filters - Filters to apply (documentType, status, etc.)
 * @returns {Promise<Array>} Array of document data
 */
export const getUserDocuments = async (userId, filters = {}) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('documentProcessingDirectIntegration')) {
      // Create query for user documents
      let q = query(
        collection(db, 'documents'),
        where('userId', '==', userId)
      );

      // Apply additional filters if provided
      if (filters.documentType) {
        q = query(q, where('documentType', '==', filters.documentType));
      }

      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }

      // Get documents
      const querySnapshot = await getDocs(q);

      // Map documents to array
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return documents;
    } else {
      // Fallback to API call
      console.log('[Document Processing] Using API fallback for document listing');
      const response = await api.get('/documents', { params: { userId, ...filters } });
      return response.data;
    }
  } catch (error) {
    // Handle errors
    return handleFirestoreError(error, 'Document Listing', 'documentProcessingDirectIntegration');
  }
};

/**
 * Delete a document
 * @param {string} documentId - The document ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteDocument = async (documentId) => {
  try {
    // Check if Firebase direct integration is enabled
    if (isFeatureEnabled('documentProcessingDirectIntegration')) {
      // Get document from Firestore
      const docRef = doc(db, 'documents', documentId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        throw new Error('Document not found');
      }

      const documentData = docSnapshot.data();

      // Delete file from Storage if path exists
      if (documentData.filePath) {
        const storageRef = ref(storage, documentData.filePath);
        await deleteObject(storageRef);
      }

      // Delete document from Firestore
      await deleteDoc(docRef);

      return true;
    } else {
      // Fallback to API call
      console.log('[Document Processing] Using API fallback for document deletion');
      await api.delete(`/documents/${documentId}`);
      return true;
    }
  } catch (error) {
    // Handle errors
    return handleStorageError(error, 'Document Deletion', 'documentProcessingDirectIntegration');
  }
};

// Export all functions
export {
  uploadDocument,
  processDocument,
  getDocument,
  getUserDocuments,
  deleteDocument
};

// Export default object for default imports
export default {
  uploadDocument,
  processDocument,
  getDocument,
  getUserDocuments,
  deleteDocument
};
