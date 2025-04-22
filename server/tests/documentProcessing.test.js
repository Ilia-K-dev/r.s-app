const { DocumentProcessingService } = require('../src/services/document/DocumentProcessingService');//good 
const { extractText } = require('../src/services/document/DocumentProcessingService')//good 
const { TestDataGenerator } = require('../src/utils/misc/testUtils'); //good

describe('Document Processing Tests', () => {
  let documentScanner;
  let testUser;

  beforeAll(async () => {
    testUser = await TestDataGenerator.createTestUser();
    documentScanner = new DocumentScanner();
  });

  describe('Text Extraction', () => {
    test('should extract text from receipt image', async () => {
      const mockReceiptImage = await TestDataGenerator.generateMockReceiptImage();
      
      const extractedData = await documentScanner.processDocument(
        mockReceiptImage, 
        testUser.id
      );

      expect(extractedData).toHaveProperty('documentType', 'receipt');
      expect(extractedData).toHaveProperty('extractedText');
      expect(extractedData).toHaveProperty('parsedData');
    });

    test('should handle different document types', async () => {
      const mockInvoiceImage = await TestDataGenerator.generateMockInvoiceImage();
      
      const extractedData = await documentScanner.processDocument(
        mockInvoiceImage, 
        testUser.id
      );

      expect(extractedData).toHaveProperty('documentType', 'invoice');
    });
  });

  describe('Document Classification', () => {
    test('should correctly classify document types', () => {
      const receiptText = 'Total: $50.00 Walmart Receipt Date: 2023-06-15';
      const invoiceText = 'Invoice Number: INV-2023-001 Total Due: $500.00';
      
      const receiptType = DocumentScanner.classifyDocumentType(receiptText);
      const invoiceType = DocumentScanner.classifyDocumentType(invoiceText);

      expect(receiptType).toBe('receipt');
      expect(invoiceType).toBe('invoice');
    });
  });

  describe('Text Parsing', () => {
    test('should parse receipt text accurately', () => {
      const receiptText = `
        WALMART
        123 Main St
        Date: 2023-06-15
        
        Milk      $3.99
        Bread     $2.50
        Eggs      $4.50
        
        Total:    $10.99
      `;

      const parsedReceipt = TextExtractor.parseReceipt(receiptText);

      expect(parsedReceipt).toMatchObject({
        merchant: 'WALMART',
        total: 10.99,
        items: [
          { name: 'Milk', price: 3.99 },
          { name: 'Bread', price: 2.50 },
          { name: 'Eggs', price: 4.50 }
        ]
      });
    });
  });
});