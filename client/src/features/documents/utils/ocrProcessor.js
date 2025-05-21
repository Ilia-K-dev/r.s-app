// client/src/features/documents/utils/ocrProcessor.js

import Tesseract from 'tesseract.js';

// Initialize Tesseract worker (can be done once and reused)
// Consider creating/terminating workers based on need for performance
let worker = null;

const initializeWorker = async () => {
  if (!worker) {
    console.log('Initializing Tesseract worker...');
    worker = await Tesseract.createWorker('eng'); // Load English language data
    console.log('Tesseract worker initialized.');
  }
  return worker;
};

const terminateWorker = async () => {
  if (worker) {
    console.log('Terminating Tesseract worker...');
    await worker.terminate();
    worker = null;
    console.log('Tesseract worker terminated.');
  }
};

/**
 * Performs OCR on an image using Tesseract.js.
 * @param {File | string} image - The image file or URL to perform OCR on.
 * @param {function} onProgress - Callback function for progress updates.
 * @param {object} options - Optional configuration for Tesseract.js.
 * @returns {Promise<{text: string, confidence: number, words: Array<object>}>} - Extracted text, confidence score, and word details.
 */
export const performOcr = async (image, onProgress = () => {}, options = {}) => {
  try {
    const ocrWorker = await initializeWorker();

    // Set up progress tracking
    ocrWorker.setProgress(p => {
      onProgress(p.progress); // Report progress (0 to 1)
    });

    // Perform OCR
    const { data: { text, confidence, words } } = await ocrWorker.recognize(image, options);

    // Consider terminating the worker if it's not needed for subsequent operations
    // await terminateWorker(); // Optional: terminate worker after each use

    return { text, confidence, words };

  } catch (error) {
    console.error('Error during OCR processing:', error);
    // Consider terminating the worker on error as well
    // await terminateWorker(); // Optional: terminate worker on error
    throw error; // Re-throw the error for handling in the service/hook
  }
};

/**
 * Placeholder for image optimization before OCR.
 * Tesseract.js often works best with clean, high-contrast images.
 * @param {File} imageFile - The image file to optimize.
 * @returns {Promise<File>} - The optimized image file.
 */
export const optimizeImageForOcr = async (imageFile) => {
  console.log('Optimizing image for OCR (placeholder)...', imageFile.name);
  // TODO: Implement image optimization techniques here (e.g., grayscale, binarization, deskewing)
  // This might involve using HTML5 Canvas or a dedicated image processing library.
  return imageFile; // For now, just return the original file
};

// Add comments about OCR optimization techniques, performance, and cancellation
// OCR optimization techniques used: Currently a placeholder (`optimizeImageForOcr`). Potential techniques include converting to grayscale, binarization (converting to black and white), deskewing (straightening tilted images), and noise reduction. These can significantly improve OCR accuracy.
// Performance considerations for client-side processing: OCR can be computationally intensive, especially for large or complex images. Running it client-side can impact browser performance. Considerations include:
// - Using Web Workers to run OCR in a background thread, preventing UI blocking. Tesseract.js workers already help with this.
// - Optimizing images before processing to reduce the amount of data Tesseract needs to process.
// - Providing progress feedback to the user.
// - Implementing cancellation to allow users to stop long-running OCR operations.
// Cancellation support: Tesseract.js workers support cancellation. The `performOcr` function can be extended to accept a cancellation signal or object to stop the recognition process.
