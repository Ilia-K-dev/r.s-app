import { processImage } from './imageProcessing';//correct

export const processReceipt = async (file, options = {}) => {
  try {
    // First process the image
    const processedImage = await processImage(file, options);
    
    // Add receipt-specific metadata
    const receiptMetadata = {
      type: 'receipt',
      processedAt: new Date().toISOString(),
      originalFileName: file.name,
      processingOptions: options
    };

    // Return processed file with metadata
    return {
      file: processedImage,
      metadata: receiptMetadata
    };
  } catch (error) {
    console.error('Receipt processing error:', error);
    throw new Error('Failed to process receipt');
  }
};