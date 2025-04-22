const DocumentProcessingService = require('../src/services/document/DocumentProcessingService');
const visionMock = require('../tests/__mocks__/@google-cloud/vision');
const storageMock = require('../tests/__mocks__/firebase/storage');
const fs = require('fs').promises;
const path = require('path');

jest.mock('@google-cloud/vision', () => visionMock);
jest.mock('firebase/storage', () => storageMock);

let processingService;

beforeAll(() => {
  processingService = new DocumentProcessingService();
});

describe('DocumentProcessingService', () => {
  
  describe('Image Preprocessing', () => {
    
    test('should optimize image', async () => {
      const buffer = await fs.readFile(path.join(__dirname, 'fixtures/test-image.jpg')); 
      const optimizedImage = await processingService._optimizeImage(buffer);
      
      expect(optimizedImage).toBeInstanceOf(Buffer);
      expect(optimizedImage.length).toBeLessThan(buffer.length);
    });

    test('should enhance image based on stats', async () => {
      const lowContrastImage = await fs.readFile(path.join(__dirname, 'fixtures/low-contrast.jpg'));
      const enhancedImage = await processingService._optimizeImage(lowContrastImage);

      const lowContrastStats = await sharp(lowContrastImage).stats();
      const enhancedStats = await sharp(enhancedImage).stats();

      expect(enhancedStats.channels[0].mean).toBeGreaterThan(lowContrastStats.channels[0].mean);
      expect(enhancedStats.channels[0].std).toBeGreaterThan(lowContrastStats.channels[0].std);
    });

  });

  describe('Text Extraction', () => {
    
    test('should extract text from image', async () => {
      const buffer = await fs.readFile(path.join(__dirname, 'fixtures/document.jpg'));
      visionMock.mockResponse({
        fullTextAnnotation: {
          text: 'Sample Document Text',
          pages: [{
            blocks: [{
              paragraphs: [{
                words: [
                  { symbols: [{ text: 'Sample' }] },
                  { symbols: [{ text: 'Document' }] },
                  { symbols: [{ text: 'Text' }] }
                ]
              }]
            }]
          }],
          confidence: 0.95
        }
      });

      const extractedText = await processingService._extractText(buffer);

      expect(extractedText).toEqual({
        fullText: 'Sample Document Text',
        blocks: expect.any(Array),
        layout: expect.any(Object),
        confidence: 0.95,
        language: 'latin'
      });
    });

    test('should throw error if no text detected', async () => {
      const buffer = await fs.readFile(path.join(__dirname, 'fixtures/blank.jpg'));
      visionMock.mockResponse({ fullTextAnnotation: null });

      await expect(processingService._extractText(buffer)).rejects.toThrow('No text detected');
    });

  });

  describe('Document Classification', () => {
    
    test('should classify document type', async () => {
      const textData = { fullText: 'Sample receipt with total: $10.00 and date: 01/01/2023' };
      const classification = await processingService._classifyDocumentType(textData);

      expect(classification).toEqual({
        type: 'receipt',
        confidence: expect.any(Number)
      });
    });

    test('should return unknown for unrecognized document', async () => {
      const textData = { fullText: 'Unrecognized document content' };  
      const classification = await processingService._classifyDocumentType(textData);

      expect(classification).toEqual({
        type: 'unknown',
        confidence: expect.any(Number)
      });
    });

  });

  describe('Receipt Processing', () => {
    
    test('should extract receipt data', () => {
      const receiptText = `
        Sample Store
        123 Main St
        01/01/2023

        Item 1   $5.00
        Item 2   $10.00

        Subtotal  $15.00
        Tax       $1.00 
        Total     $16.00

        Cash      $20.00
        Change    $4.00
      `;
      const receiptData = processingService._processReceipt({ fullText: receiptText });

      expect(receiptData).toMatchObject({
        type: 'receipt',
        vendor: 'Sample Store',
        date: expect.any(Date),
        total: 16,
        items: [
          { name: 'Item 1', price: 5, quantity: 1 },
          { name: 'Item 2', price: 10, quantity: 1 }
        ],
        paymentMethod: 'cash'
      });
    });

    test('should handle missing fields', () => {
      const receiptText = `
        Sample Store
        01/01/2023

        Item 1   $5.00
      `;
      const receiptData = processingService._processReceipt({ fullText: receiptText });

      expect(receiptData).toMatchObject({
        vendor: 'Sample Store',
        date: expect.any(Date),
        total: null,
        items: [{ name: 'Item 1', price: 5, quantity: 1 }],
        paymentMethod: 'unknown'
      });
    });

  });

  describe('Invoice Processing', () => {
    
    test('should extract invoice data', () => {
      const invoiceText = `
        ACME Inc.
        Invoice #ABC123
        01/01/2023

        Bill To:
        John Smith

        Service 1    $100.00
        Service 2    $150.00

        Total Due    $250.00  
        Terms: Net 30
      `;
      const invoiceData = processingService._processInvoice({ fullText: invoiceText });

      expect(invoiceData).toMatchObject({
        type: 'invoice',
        invoiceNumber: 'ABC123',
        date: expect.any(Date),
        total: 250,
        items: [
          { name: 'Service 1', price: 100, quantity: 1 },
          { name: 'Service 2', price: 150, quantity: 1 } 
        ]
      });
    });

  });

  describe('Layout Analysis', () => {
    
    test('should detect columns', () => {
      const blocks = [
        { bounds: { left: 10, right: 100 } },
        { bounds: { left: 15, right: 105 } },
        { bounds: { left: 200, right: 300 } },
        { bounds: { left: 205, right: 305 } }
      ];
      const columns = processingService._detectColumns(blocks);
      
      expect(columns).toEqual([12, 202]);
    });

    test('should detect tables', () => {
      const blocks = [
        { bounds: {}, words: [{ text: 'Header 1' }, { text: 'Header 2' }] },
        { bounds: {}, words: [{ text: 'Row 1 Col 1' }, { text: 'Row 1 Col 2' }] },  
        { bounds: {}, words: [{ text: 'Row 2 Col 1' }, { text: 'Row 2 Col 2' }] },
        { bounds: {}, words: [{ text: 'Not a table row' }] }
      ];
      const tables = processingService._detectTables(blocks);

      expect(tables).toEqual([
        expect.objectContaining({
          rows: blocks.slice(0, 3) 
        })
      ]);
    });

  });

  describe('File Upload', () => {
    
    test('should upload processed image', async () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('mock image')  
      };
      const mockUserId = 'user123';
      const mockUrl = 'https://example.com/test.jpg';

      storageMock.bucket.mockReturnValue({
        file: jest.fn().mockReturnValue({
          save: jest.fn(),
          getSignedUrl: jest.fn().mockResolvedValue([mockUrl])
        })
      });

      const imageUrl = await processingService._uploadImage(mockFile, mockUserId, mockFile.buffer);

      expect(imageUrl).toBe(mockUrl);
      expect(storage.bucket).toHaveBeenCalled();
      expect(storage.bucket().file).toHaveBeenCalledWith(expect.stringContaining(mockFile.originalname));
    });

  });

  describe('Integration Tests', () => {
    
    test('should process document end-to-end', async () => {
      const mockFile = {
        originalname: 'receipt.jpg',
        mimetype: 'image/jpeg',
        buffer: await fs.readFile(path.join(__dirname, 'fixtures/receipt.jpg'))
      };
      const mockUserId = 'user123';
      const mockImageUrl = 'https://example.com/receipt.jpg';

      visionMock.mockResponse({
        fullTextAnnotation: {
          text: 'Receipt OCR Result',
          // ... other receipt text data
        },
        confidence: 0.9
      });

      storageMock.bucket.mockReturnValue({
        file: jest.fn().mockReturnValue({
          save: jest.fn(),
          getSignedUrl: jest.fn().mockResolvedValue([mockImageUrl])
        })
      });

      const result = await processingService.processDocument(mockFile, mockUserId);

      expect(result).toEqual({
        documentType: 'receipt',
        confidence: expect.any(Number),
        processedData: expect.any(Object),
        imageUrl: mockImageUrl,
        metadata: expect.objectContaining({
          originalFileName: mockFile.originalname,
          processedAt: expect.any(Date),
          textLayout: expect.any(Object)
        })
      });

      expect(visionMock.annotateImage).toHaveBeenCalled();
      expect(storage.bucket).toHaveBeenCalled();
    });

  });

  describe('Error Handling', () => {
    
    test('should throw error on image processing failure', async () => {
      const mockFile = { buffer: Buffer.from('invalid image') };
      await expect(processingService.processDocument(mockFile, 'user123'))
        .rejects.toThrow('Failed to optimize image');
    });

    test('should throw error on OCR failure', async () => {
      const mockFile = {
        originalname: 'invalid.jpg',
        mimetype: 'image/jpeg', 
        buffer: await fs.readFile(path.join(__dirname, 'fixtures/invalid.jpg'))
      };
      visionMock.mockResponse(new Error('OCR error'));

      await expect(processingService.processDocument(mockFile, 'user123'))
        .rejects.toThrow('Failed to extract text');
    });

  });

  describe('Logging', () => {
    
    test('should log processing steps', async () => {
      const mockLogger = {
        info: jest.fn(),
        error: jest.fn()
      };
      jest.spyOn(processingService, 'logger', 'get').mockReturnValue(mockLogger);

      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: await fs.readFile(path.join(__dirname, 'fixtures/test-image.jpg'))
      };

      visionMock.mockResponse({
        fullTextAnnotation: { text: 'Test' }  
      });

      await processingService.processDocument(mockFile, 'user123');

      expect(mockLogger.info).toHaveBeenCalledWith('Starting document processing', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('Image optimized successfully');
      expect(mockLogger.info).toHaveBeenCalledWith('Image uploaded successfully', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('Text extracted successfully', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('Document classified', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('Document processed successfully');
    });

    test('should log errors', async () => {
      const mockLogger = {
        error: jest.fn()  
      };
      jest.spyOn(processingService, 'logger', 'get').mockReturnValue(mockLogger);

      const mockFile = { buffer: Buffer.from('invalid image') };

      await expect(processingService.processDocument(mockFile, 'user123'))
        .rejects.toThrow('Failed to optimize image');
      
      expect(mockLogger.error).toHaveBeenCalledWith('Document processing error:', expect.any(Error));
    });
    
  });

  describe('Performance', () => {
    
    test('should process document within timeout', async () => {
      const mockFile = {
        originalname: 'receipt.jpg',
        mimetype: 'image/jpeg',
        buffer: await fs.readFile(path.join(__dirname, 'fixtures/receipt.jpg'))
      };
      const mockUserId = 'user123';

      visionMock.mockResponse({
        fullTextAnnotation: {
          text: 'Receipt OCR Result',
          // ... other receipt text data
        },
        confidence: 0.9
      });

      storageMock.bucket.mockReturnValue({
        file: jest.fn().mockReturnValue({
          save: jest.fn(),
          getSignedUrl: jest.fn().mockResolvedValue(['https://example.com/receipt.jpg'])
        })
      });

      const timeout = 5000;
      const startTime = Date.now();

      await processingService.processDocument(mockFile, mockUserId);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(timeout);
    }, 10000);

  });

});