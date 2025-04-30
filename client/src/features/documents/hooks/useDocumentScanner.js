import { useState, useCallback, useRef } from 'react';

import { useToast } from '../../../shared/hooks/useToast';
import { logger } from '../../../shared/utils/logger';
import { useAuth } from '../../auth/hooks/useAuth';
import { documentProcessingService } from '../services/documentProcessingService';
import { visionService } from '../services/visionService';
import { validateFile } from '../../../shared/utils/fileHelpers'; // Updated import

/**
 * Custom hook for document scanning and processing
 * @returns {Object} Document scanning methods and state
 */
export const useDocumentScanner = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // State for tracking document scanning process
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState({
    stage: 'idle', // 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
    progress: 0,
  });

  // Ref to store cancellation token for ongoing operations
  const cancelTokenRef = useRef(null);

  /**
   * Validate file before processing
   * @param {File} file - File to validate
   * @returns {boolean} - Validation result
   */
  const validateDocument = useCallback(
    file => {
      const validationResult = validateFile(file);

      if (!validationResult.isValid) {
        showToast(validationResult.errors[0], 'error');
        return false;
      }
      return true;
    },
    [showToast]
  );

  /**
   * Process document from file or camera input
   * @param {File|Blob} file - Document file to process
   * @param {Object} [options={}] - Additional processing options
   * @returns {Promise<Object>} Processed document data
   */
  const processDocument = useCallback(
    async (file, options = {}) => {
      // Reset previous state
      setLoading(true);
      setError(null);
      setProcessingStatus({ stage: 'uploading', progress: 0 });

      try {
        // Validate file
        if (!validateDocument(file)) {
          throw new Error('Invalid file');
        }

        // Create cancellation token
        const cancelToken = new AbortController();
        cancelTokenRef.current = cancelToken;

        // Update processing status
        setProcessingStatus({ stage: 'processing', progress: 25 });

        // Process image
        const processedImage = await documentProcessingService.preprocessImage(file);

        // Upload to storage
        setProcessingStatus({ stage: 'processing', progress: 50 });
        const uploadResult = await documentProcessingService.uploadDocument(
          processedImage,
          user.id,
          options.documentType || 'receipt'
        );

        // Extract text using Vision API
        setProcessingStatus({ stage: 'processing', progress: 75 });
        const extractedData = await visionService.processReceipt(uploadResult.imageUrl);

        // Final processing and validation
        const finalDocument = await documentProcessingService.parseExtractedData(
          extractedData,
          uploadResult
        );

        // Update state
        setDocument(finalDocument);
        setProcessingStatus({ stage: 'completed', progress: 100 });

        // Show success toast
        showToast('Document processed successfully', 'success');

        return finalDocument;
      } catch (err) {
        // Log error
        logger.error('Document processing error', err);

        // Set error state
        setError(err.message || 'Failed to process document');
        setProcessingStatus({ stage: 'error', progress: 0 });

        // Show error toast
        showToast(err.message || 'Document processing failed', 'error');

        throw err;
      } finally {
        // Reset loading state
        setLoading(false);
      }
    },
    [user, showToast, validateDocument, documentProcessingService]
  );

  /**
   * Cancel ongoing document processing
   */
  const cancelProcessing = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
      setLoading(false);
      setProcessingStatus({ stage: 'idle', progress: 0 });
      showToast('Document processing cancelled', 'warning');
    }
  }, [showToast]);

  /**
   * Reset document scanner state
   */
  const resetScanner = useCallback(() => {
    setDocument(null);
    setError(null);
    setProcessingStatus({ stage: 'idle', progress: 0 });
  }, []);

  return {
    // State
    document,
    loading,
    error,
    processingStatus,

    // Methods
    processDocument,
    cancelProcessing,
    resetScanner,

    // Utility state
    isProcessing: loading || processingStatus.stage === 'processing',
  };
};

export default useDocumentScanner;
