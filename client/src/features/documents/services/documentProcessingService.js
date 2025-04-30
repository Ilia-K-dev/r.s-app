// Removed: import { storage, db } from '../../../core/config/firebase'; // No longer needed for direct access
import { api } from '../../../shared/services/api'; // Import the shared API utility
import { processImage } from '../utils/imageProcessing';
// Removed: import extractReceiptData from '../utils/receiptProcessing'; // This logic likely belongs server-side or in a different client service
// Removed: import validateReceipt from '../utils/validation'; // Receipt validation should happen server-side or use shared validation

const preprocessImage = async (file) => await processImage(file);

/**
 * Uploads a document file to the backend via API call.
 * @param {File} file - The file to upload.
 * @param {string} userId - The authenticated user's ID (though backend should get this from token).
 * @param {string} documentType - The type of document.
 * @returns {Promise<{imageUrl: string}>} - An object containing the URL of the uploaded file.
 */
const uploadDocument = async (file, userId, documentType) => {
  // Create FormData to send the file
  const formData = new FormData();
  formData.append('document', file); // 'document' must match the field name expected by multer on the server
  formData.append('documentType', documentType);
  // Note: userId is typically derived from the auth token on the server,
  // but sending it might be useful depending on backend implementation.

  try {
    // Use the shared api utility to post the form data
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for file uploads
      },
      // Add progress tracking if needed using axios config (onUploadProgress)
    });

    // Assuming the backend returns { imageUrl: '...' } upon successful upload
    if (response.data && response.data.imageUrl) {
      return { imageUrl: response.data.imageUrl };
    } else {
      throw new Error('Backend did not return the image URL after upload.');
    }
  } catch (error) {
    console.error('Error uploading document via API:', error);
    // Rethrow a more specific error or handle it as needed
    throw new Error(error.response?.data?.message || 'Failed to upload document.');
  }
};

/**
 * Parses extracted data (assuming this step is still needed client-side after OCR).
 * Note: Receipt validation and detailed parsing are often better handled server-side.
 * This function might need adjustment based on what the backend OCR process returns.
 * @param {object} extractedData - Data potentially returned from an OCR process.
 * @param {object} uploadResult - Result from the upload step (e.g., { imageUrl }).
 * @returns {object} - Formatted document data.
 */
const parseExtractedData = async (extractedData, uploadResult) => {
  // Basic client-side structuring. Complex validation/parsing should be server-side.
  console.warn("parseExtractedData called client-side. Consider moving complex parsing/validation server-side.");
  return {
    // id: uploadResult.id, // ID should ideally come from the backend after saving to Firestore
    imageUrl: uploadResult.imageUrl,
    extractedText: extractedData?.text || '', // Example: assuming OCR returns text
    ...extractedData, // Include other fields returned by OCR/backend if any
  };
};

export const documentProcessingService = {
  preprocessImage,
  uploadDocument,
  parseExtractedData, // Keep if basic client-side parsing is still desired
};
