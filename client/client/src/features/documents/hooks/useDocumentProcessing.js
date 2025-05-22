// File: client/src/features/documents/hooks/useDocumentProcessing.js
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import * as documentService from '../services/documentProcessingService';

/**
 * Hook for document processing operations
 * @returns {Object} Document processing methods and state
 */
export const useDocumentProcessing = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load user documents
  const loadDocuments = useCallback(async (filters = {}) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userDocuments = await documentService.getUserDocuments(user.uid, filters);
      setDocuments(userDocuments);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load a specific document
  const loadDocument = useCallback(async (documentId) => {
    setLoading(true);
    setError(null);

    try {
      const document = await documentService.getDocument(documentId);
      setCurrentDocument(document);
      return document;
    } catch (err) {
      setError(err.message || 'Failed to load document');
      console.error('Error loading document:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload a document
  const uploadDocument = useCallback(async (file, documentType, metadata = {}) => {
    if (!user) {
      setError('User not authenticated');
      return null;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress since Firebase Storage doesn't provide progress events directly
      // In a production app, you might use a different upload method that supports progress
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress > 95) {
            clearInterval(interval);
            progress = 95; // Cap at 95% until actual completion
          }
          setUploadProgress(Math.min(progress, 95));
        }, 300);

        return interval;
      };

      const progressInterval = simulateProgress();

      // Perform the actual upload
      const uploadedDocument = await documentService.uploadDocument(
        file,
        user.uid,
        documentType,
        metadata
      );

      // Clear the progress simulation
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update documents list
      setDocuments(prevDocs => [uploadedDocument, ...prevDocs]);
      setCurrentDocument(uploadedDocument);

      return uploadedDocument;
    } catch (err) {
      setError(err.message || 'Failed to upload document');
      console.error('Error uploading document:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }, [user]);

  // Process a document
  const processDocument = useCallback(async (documentId, processingOptions = {}) => {
    setProcessing(true);
    setError(null);

    try {
      const processedDocument = await documentService.processDocument(documentId, processingOptions);

      // Update current document and documents list
      setCurrentDocument(processedDocument);
      setDocuments(prevDocs => prevDocs.map(doc =>
        doc.id === documentId ? processedDocument : doc
      ));

      return processedDocument;
    } catch (err) {
      setError(err.message || 'Failed to process document');
      console.error('Error processing document:', err);
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  // Delete a document
  const deleteDocument = useCallback(async (documentId) => {
    setLoading(true);
    setError(null);

    try {
      await documentService.deleteDocument(documentId);

      // Update documents list
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));

      // Clear current document if it's the one being deleted
      if (currentDocument && currentDocument.id === documentId) {
        setCurrentDocument(null);
      }

      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete document');
      console.error('Error deleting document:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentDocument]);

  // Load documents when the user changes
  useEffect(() => {
    if (user) {
      loadDocuments();
    } else {
      setDocuments([]);
      setCurrentDocument(null);
    }
  }, [user, loadDocuments]);

  return {
    // State
    documents,
    currentDocument,
    loading,
    uploading,
    processing,
    uploadProgress,
    error,

    // Methods
    loadDocuments,
    loadDocument,
    uploadDocument,
    processDocument,
    deleteDocument,
    clearError
  };
};

// Export the hook
export default useDocumentProcessing;
