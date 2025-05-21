// client/src/features/documents/hooks/useDocumentProcessing.js

import { useState, useCallback } from 'react';
import { documentProcessingService } from '../services/documentProcessingService';
import { handleFirebaseError } from '../../../utils/errorHandler'; // Use the centralized error handler

/**
 * Custom hook for managing the document processing flow (upload, OCR, classification).
 * Handles state for loading, error, and progress.
 */
const useDocumentProcessing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0); // Overall progress (0 to 1)
  const [documentData, setDocumentData] = useState(null); // To store processed document data

  // State for tracking individual step progress (optional, for more detailed UI)
  const [stepProgress, setStepProgress] = useState({
    upload: 0,
    ocr: 0,
    classification: 0,
  });

  // State for cancellation (placeholder)
  const [isCancelled, setIsCancelled] = useState(false);
  const cancelProcessing = useCallback(() => {
    console.log('Processing cancellation requested.');
    setIsCancelled(true);
    // TODO: Implement actual cancellation logic in service/utility functions
  }, []);


  /**
   * Starts the document processing flow.
   * @param {File} file - The document file to process.
   * @param {string} documentType - The type of document.
   */
  const startProcessing = useCallback(async (file, documentType) => {
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setStepProgress({ upload: 0, ocr: 0, classification: 0 });
    setDocumentData(null);
    setIsCancelled(false); // Reset cancellation state

    try {
      // Step 1: Preprocess Image (if needed)
      // Assuming preprocessImage updates progress or is quick
      // const processedFile = await documentProcessingService.preprocessImage(file);
      const processedFile = file; // Use original file for now

      // Check for cancellation before starting upload
      if (isCancelled) {
        console.log('Processing cancelled before upload.');
        setIsLoading(false);
        return;
      }

      // Step 2: Upload Document
      // The uploadDocument service function now handles feature toggle and fallback
      const uploadResult = await documentProcessingService.uploadDocument(
        processedFile,
        documentType,
        // Add progress callback for upload if service supports it
        // (progressEvent) => {
        //   const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total) / 100;
        //   setStepProgress(prev => ({ ...prev, upload: percentCompleted }));
        //   setProgress(percentCompleted * 0.3); // Example: Upload is 30% of total progress
        // }
      );
      setStepProgress(prev => ({ ...prev, upload: 1 })); // Mark upload as complete
      setProgress(0.3); // Update overall progress

      // Check for cancellation after upload
      if (isCancelled) {
        console.log('Processing cancelled after upload.');
        setIsLoading(false);
        return;
      }

      // Step 3: Perform OCR (Client-side or API via service)
      // The processDocument service function will handle feature toggle and fallback
      const ocrResult = await documentProcessingService.processDocument(
        uploadResult.id, // Assuming upload returns an ID
        // Add progress callback for OCR if service supports it
        // (progress) => {
        //   setStepProgress(prev => ({ ...prev, ocr: progress }));
        //   setProgress(0.3 + progress * 0.5); // Example: OCR is 50% of total progress (0.3 + 0.5 = 0.8)
        // }
      );
       setStepProgress(prev => ({ ...prev, ocr: 1 })); // Mark OCR as complete
       setProgress(0.8); // Update overall progress


      // Check for cancellation after OCR
      if (isCancelled) {
        console.log('Processing cancelled after OCR.');
        setIsLoading(false);
        return;
      }

      // Step 4: Classify Document (Client-side or API via service)
      // The classifyDocument service function will handle feature toggle and fallback
      const classificationResult = await documentProcessingService.classifyDocument(
        uploadResult.id, // Assuming classification needs document ID
        // Or pass extracted text directly: ocrResult.text
      );
      setStepProgress(prev => ({ ...prev, classification: 1 })); // Mark classification as complete
      setProgress(1); // Update overall progress

      // Combine results and set final document data
      const finalDocumentData = {
        ...uploadResult, // Includes id, imageUrl, etc.
        extractedText: ocrResult?.text,
        classification: classificationResult?.classification,
        classificationConfidence: classificationResult?.confidence,
        // Add other relevant processed data
      };
      setDocumentData(finalDocumentData);

    } catch (err) {
      // Use the centralized error handler
      const userFriendlyMessage = handleFirebaseError(err, 'Document Processing Hook');
      setError(userFriendlyMessage);
      console.error('Document processing failed:', err);
      // Consider resetting progress or setting it to a failed state
      setProgress(0);
      setStepProgress({ upload: 0, ocr: 0, classification: 0 });
    } finally {
      setIsLoading(false);
      setIsCancelled(false); // Reset cancellation state
    }
  }, [isCancelled]); // Add isCancelled to dependency array

  return {
    isLoading,
    error,
    progress,
    stepProgress,
    documentData,
    startProcessing,
    cancelProcessing,
  };
};

export default useDocumentProcessing;

// Add comments about progress tracking, cancellation, and feature toggle integration
// Progress tracking: The hook uses `progress` state for overall progress (0 to 1) and `stepProgress` for individual steps (upload, ocr, classification). Progress updates should be passed from the service/utility functions via callbacks.
// Cancellation support: The hook provides a `cancelProcessing` function and tracks `isCancelled` state. This state should be checked at appropriate points in the processing flow (e.g., before/after async operations) to stop further execution. Actual cancellation within ongoing async operations (like Tesseract OCR or large file uploads) needs to be implemented in the respective service/utility functions.
// Feature toggle integration details: The hook relies on the `documentProcessingService` functions (`uploadDocument`, `processDocument`, etc.), which are now feature-toggled internally. The hook itself doesn't need to directly check the feature flag, as the service layer handles the switching and fallback logic.
