// Last updated: 2025-05-08 12:47:19
const BaseService = require('../core/BaseService');
const DocumentProcessingService = require('../document/DocumentProcessingService'); // Import DocumentProcessingService

class ReceiptProcessingService extends BaseService {
  constructor() {
    super();
    this.documentProcessingService = new DocumentProcessingService(); // Use DocumentProcessingService
    // Remove placeholder service instantiations
    // this.textExtractor = new TextExtractionService();
    // this.dataExtractor = new ReceiptDataExtractor();
  }
  
  async processReceipt(imageBuffer, userId) {
    try {
      // Use DocumentProcessingService methods for extraction
      const extractedText = await this.documentProcessingService._extractText(imageBuffer);
      const receiptData = await this.documentProcessingService._processReceipt(extractedText); // Use _processReceipt for data extraction
      
      await this.saveReceiptData(receiptData, userId);
      return receiptData;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Removed placeholder extraction methods
  // async extractTextFromImage(imageBuffer) { ... }
  // async extractDataFromText(text) { ... }

  async saveReceiptData(receiptData, userId) {
    // Assuming firestore is accessible and configured
    const firestore = require('../../config/firebase').firestore;
    await firestore().collection('receipts').add({
      ...receiptData,
      userId,
      createdAt: new Date(),
    });
  }
}
