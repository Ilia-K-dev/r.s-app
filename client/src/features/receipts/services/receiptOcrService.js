// File: client/src/features/receipts/services/receiptOcrService.js
// Date: 2025-05-10 05:05:07
// Description: Client-side service for performing OCR on receipt images using Tesseract.js.
// Reasoning: Migrated OCR functionality from the server to the client for cost efficiency as per work plan Task 2.2.
// Potential Optimizations: Implement image preprocessing (e.g., binarization, deskewing) before OCR for better accuracy. Use the Tesseract.js WASM version for potentially better performance.

import Tesseract from 'tesseract.js';
import { handleFirebaseError } from '../../../utils/errorHandler'; // Using the centralized error handler

/**
 * Performs OCR on a given image file using Tesseract.js.
 * @param {File} imageFile - The image file to perform OCR on.
 * @param {object} [options] - OCR configuration options (e.g., language).
 * @param {function} [onProgress] - Optional callback function for progress updates.
 * @returns {Promise<object>} - A promise that resolves with the OCR result (text, confidence, etc.).
 */
export const performOcr = async (imageFile, options = {}, onProgress = null) => {
  const { language = 'eng', enableHeb = false } = options;
  const langs = enableHeb ? 'eng+heb' : language;

  try {
    const { data } = await Tesseract.recognize(
      imageFile,
      langs,
      {
        logger: m => {
          if (onProgress) {
            // Report progress if callback is provided
            onProgress(m);
          } else {
            // Default logging if no callback
            console.log('OCR Progress:', m);
          }
        },
        // Add other Tesseract.js configuration options here if needed
        // e.g., preserve_interword_spaces: '1'
      }
    );

    // Return relevant data from the OCR result
    return {
      text: data.text,
      confidence: data.confidence,
      // Include other data properties if needed, e.g., words, lines, blocks
      // blocks: data.blocks,
      // lines: data.lines,
      // words: data.words,
    };

  } catch (error) {
    // Use centralized error handler for Tesseract errors
    // Tesseract errors might not be FirebaseError instances, but handleFirebaseError
    // can handle general Errors as well.
    throw handleFirebaseError(error, 'Receipt OCR Service');
  }
};

// You can add other OCR-related utility functions here if needed
// e.g., functions for image preprocessing before passing to Tesseract.js
