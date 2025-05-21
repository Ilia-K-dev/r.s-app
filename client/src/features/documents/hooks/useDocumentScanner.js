// File: client/src/features/documents/hooks/useDocumentScanner.js
// Date: 2025-05-10 05:06:59
// Description: Custom hook for document scanning and processing, now with client-side OCR and Firebase integration.
// Reasoning: Refactored to use client-side Tesseract.js for OCR and the refactored receiptApi for Firebase Storage/Firestore operations as per work plan Task 2.2.
// Potential Optimizations: Add progress tracking for OCR and Storage upload. Improve error handling granularity.

import { useState, useCallback, useRef } from 'react';

import { useToast } from '../../../shared/hooks/useToast';
import { logger } from '../../../shared/utils/logger';
import { useAuth } from '../../auth/hooks/useAuth';
// Removed import for documentProcessingService as its uploadDocument is replaced
// Removed import for visionService as OCR is now client-side
import { validateFile } from '../../../shared/utils/fileHelpers';
import { performOcr } from '../../receipts/services/receiptOcrService'; // Import client-side OCR service
import { receiptApi } from '../../receipts/services/receipts'; // Import refactored receipt API

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
    stage: 'idle', // 'idle' | 'preprocessing' | 'ocr-processing' | 'uploading-to-storage' | 'saving-to-firestore' | 'completed' | 'error'
    progress: 0,
  });

  // Ref to store cancellation token for ongoing operations (if needed for OCR/Upload)
  const cancelTokenRef = useRef(null); // Tesseract.js has its own cancellation

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
   * Performs client-side OCR and saves receipt data to Firebase.
   * @param {File|Blob} file - Document file to process
   * @param {object} [options={}] - Additional processing options (e.g., documentType)
   * @returns {Promise<object>} Processed document data (saved receipt data)
   */
  const processDocument = useCallback(
    async (file, options = {}) => {
      // Reset previous state
      setLoading(true);
      setError(null);
      setProcessingStatus({ stage: 'preprocessing', progress: 0 });

      try {
        // Validate file
        if (!validateDocument(file)) {
          throw new Error('Invalid file');
        }

        // Note: Tesseract.js has its own cancellation mechanism.
        // If needed, integrate AbortController with Tesseract.js worker.terminate()

        // Preprocess image (if necessary, e.g., for better OCR)
        // This step might be optional depending on imageProcessing utility
        // const processedImage = await documentProcessingService.preprocessImage(file);
        // For now, we'll use the original file for OCR and upload

        // Perform client-side OCR
        setProcessingStatus({ stage: 'ocr-processing', progress: 25 });
        const ocrResult = await performOcr(file, {
          // Pass OCR options if needed, e.g., language
          // onProgress: (m) => setProcessingStatus(prev => ({ ...prev, progress: 25 + m.progress * 50 })) // Example progress update
        });

        // Prepare receipt data - this structure needs to match your Firestore model
        // You'll likely need to extract specific fields from ocrResult.text here
        // For now, saving the raw text and confidence
        const receiptData = {
          // Example fields - adjust based on your actual receipt data structure
          // merchant: 'Extracted Merchant Name',
          // date: new Date(), // Or extracted date from OCR
          // total: parseFloat('Extracted Total'),
          extractedText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          // Add other relevant data extracted or defaulted
          documentType: options.documentType || 'receipt',
          // userId will be added by receiptApi.createReceipt
          // createdAt, updatedAt will be added by receiptApi.createReceipt
        };

        // Save receipt data and upload image to Firebase via refactored receiptApi
        setProcessingStatus({ stage: 'saving-to-firestore', progress: 75 });
        // The receiptApi.createReceipt now handles Storage upload and Firestore save
        const savedReceipt = await receiptApi.createReceipt(receiptData, file);


        // Update state with the saved receipt data
        setDocument(savedReceipt); // Assuming savedReceipt contains the full document data with ID
        setProcessingStatus({ stage: 'completed', progress: 100 });

        // Show success toast
        showToast('Receipt processed and saved successfully', 'success');

        return savedReceipt;
      } catch (err) {
        // Log error
        logger.error('Document processing error', err);

        // Set error state
        // Use handleFirebaseError for user-friendly messages
        const userFriendlyMessage = handleFirebaseError(err, 'Document Processing Hook');
        setError(userFriendlyMessage);
        setProcessingStatus({ stage: 'error', progress: 0 });

        // Show error toast
        showToast(userFriendlyMessage, 'error');

        throw err; // Re-throw the handled error message
      } finally {
        // Reset loading state
        setLoading(false);
      }
    },
    [user, showToast, validateDocument] // Add dependencies used in useCallback
  );

  /**
   * Cancel ongoing document processing
   */
  const cancelProcessing = useCallback(() => {
    // If Tesseract.js worker is active, terminate it here
    // Tesseract.js v5+ uses workers, need to manage their lifecycle if cancellation is required
    // For simplicity, this basic implementation doesn't include Tesseract worker cancellation.
    // If implemented, also need to handle potential partial Storage uploads/Firestore writes.

    // Reset state to idle
    setLoading(false);
    setProcessingStatus({ stage: 'idle', progress: 0 });
    showToast('Document processing cancelled', 'warning');

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
    isProcessing: loading || (processingStatus.stage !== 'idle' && processingStatus.stage !== 'completed' && processingStatus.stage !== 'error'),
  };
};

export default useDocumentScanner;
