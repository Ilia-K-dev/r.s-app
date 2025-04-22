import { storage, db } from '../../../core/config/firebase';//correct
import { processImage } from '../utils/imageProcessing';//correct
import { extractReceiptData } from '../utils/receiptProcessing';//correct
import { validateReceipt } from '../utils/validation';//correct

export const processDocument = async (file, userId) => {
  try {
    // Optimize and preprocess the image
    const optimizedImage = await processImage(file);
    
    // Upload the optimized image to Firebase Storage
    const storageRef = storage.ref(`receipts/${userId}/${Date.now()}_${file.name}`);
    await storageRef.put(optimizedImage);
    const imageUrl = await storageRef.getDownloadURL();

    // Extract receipt data using OCR
    const extractedData = await extractReceiptData(optimizedImage);

    // Validate the extracted data
    const { isValid, errors } = validateReceipt(extractedData);
    if (!isValid) {
      throw new Error('Invalid receipt data: ' + errors.join(', '));
    }

    // Save the processed receipt data to Firestore
    const receiptRef = await db.collection('receipts').add({
      userId,
      imageUrl,
      ...extractedData,
      createdAt: new Date().toISOString()
    });

    return {
      id: receiptRef.id,
      imageUrl,
      ...extractedData
    };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
};