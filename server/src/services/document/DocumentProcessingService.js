const vision = require('@google-cloud/vision');
const sharp = require('sharp');
const { storage } = require('../../../config/firebase'); //good
const logger = require('../../utils/logger'); //good
const { AppError } = require('../../utils/error/AppError'); //good
const { parseReceipt } = require('../../services/receipts/ReceiptProcessingService') //good
const { parseInvoice } = require('../receipts/ReceiptProcessingService');//good
const Papa = require('papaparse');
const { preprocessImage } = require('../preprocessing'); //good

class DocumentProcessingService {
  constructor() {
    this.visionClient = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });

    // Advanced document processing configurations
    this.processingConfig = {
      maxWidth: 3000,
      maxHeight: 3000,
      quality: 90,
      defaultFormat: 'jpeg',
    };

    this.documentTypes = {
      receipt: {
        keywords: ['total', 'subtotal', 'tax', 'payment', 'change', 'cash', 'card'],
        patterns: [
          /total:?\s*\$?\d+\.\d{2}/i,
          /\d{2}\/\d{2}\/\d{2,4}/,
          /(?:visa|mastercard|amex)/i
        ],
        confidence: 0.6,
        metadataFields: ['date', 'total', 'paymentMethod']
      },
      invoice: {
        keywords: ['invoice', 'bill to', 'payment terms', 'due date', 'invoice number'],
        patterns: [
          /invoice\s*#?\d+/i,
          /due\s*date/i,
          /payment\s*terms/i
        ],
        confidence: 0.7,
        metadataFields: ['invoiceNumber', 'dueDate', 'terms']
      },
      warranty: {
        keywords: ['warranty', 'guarantee', 'coverage', 'expiration', 'serial'],
        patterns: [
          /warranty\s*period/i,
          /serial\s*number/i,
          /model\s*number/i
        ],
        confidence: 0.75,
        metadataFields: ['serialNumber', 'warrantyPeriod', 'productModel']
      }
    };

    // Common vendor patterns
    this.vendorPatterns = {
      header: /^([A-Z][A-Za-z0-9\s&.,'-]+)(?:\r?\n|$)/,
      website: /(?:www\.)?([a-zA-Z0-9-]+)\.(?:com|net|org)/i,
      phone: /(?:tel|phone|#):\s*([0-9-()+ ]{10,})/i,
      address: /(\d+[^,\n]+,[^,\n]+,[^,\n]+)/i
    };
  }

  // Main Processing Methods
  async processDocument(file, userId) {
    try {
      logger.info('Starting document processing', { 
        filename: file.originalname,
        userId 
      });
    
      
      // 1. Optimize image
      const optimizedBuffer = await this._optimizeImage(file.buffer);
      logger.info('Image optimized successfully');

      // 2. Upload and get image URL
      const imageUrl = await this._uploadImage(file, userId, optimizedBuffer);
      logger.info('Image uploaded successfully', { imageUrl });

      // 3. Extract text using Vision API
      const extractedText = await this._extractText(optimizedBuffer);
      logger.info('Text extracted successfully', { 
        confidence: extractedText.confidence 
      });

      // 4. Classify document
      const classification = await this.classifyDocument(extractedText);
      logger.info('Document classified', { 
        type: classification.type, 
        confidence: classification.confidence,
        possibleTypes: classification.possibleTypes
      });

      // 5. Process based on document type
      const processedData = await this._processBasedOnType(
        extractedText, 
        classification.type
      );
      logger.info('Document processed successfully');

      return {
        documentType: classification.type,
        confidence: classification.confidence,
        processedData,
        imageUrl,
        metadata: {
          originalFileName: file.originalname,
          processedAt: new Date(),
          textLayout: this._analyzeTextLayout(extractedText)
        }
      };
    } catch (error) {
      logger.error('Document processing error:', error);
      throw new AppError(error.message, 500);
    }
  }
  async classifyDocument(textData) {
    try {
      const classificationResult = await this._classifyDocumentType(textData);
      return classificationResult;
    } catch (error) {
      logger.error('Document classification error:', error);
      throw new AppError('Failed to classify document', 500);
    }
  }
  // Image Processing Methods
  async _optimizeImage(buffer) {
    try {
      // First use the preprocessing module for advanced optimizations
      const preprocessed = await preprocessImage(buffer, {
        noiseReduction: true,
        rotationCorrection: true,
        colorOptimization: true,
        qualityAdjustment: true
      });
  
      // Then apply our existing enhancements
      const metadata = await sharp(preprocessed).metadata();
        
      // Check if additional processing is needed
      if (!this._needsProcessing(metadata)) {
        return preprocessed;
      }
  
      // Calculate new dimensions while maintaining aspect ratio
      const dimensions = this._calculateDimensions(metadata);
  
      // Process image with advanced enhancements
      let pipeline = sharp(preprocessed)
        .resize(dimensions.width, dimensions.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .normalize()
        .sharpen()
        .linear(1.1, 0); // Slight contrast enhancement
  
      // Apply additional enhancements based on image analysis
      const stats = await pipeline.stats();
      pipeline = await this._enhanceImage(pipeline, metadata, stats);
  
      return pipeline.jpeg({ 
        quality: this.processingConfig.quality,
        chromaSubsampling: '4:4:4' // Higher quality color sampling
      }).toBuffer();
    } catch (error) {
      logger.error('Image optimization error:', error);
      throw new AppError('Failed to optimize image', 500);
    }
  }

  async _enhanceImage(pipeline, metadata, stats) {
    try {
      if (this._needsContrastEnhancement(stats)) {
        pipeline = pipeline.linear(1.1, -(stats.channels[0].mean * 0.1));
      }

      if (this._needsGammaCorrection(stats)) {
        pipeline = pipeline.gamma(1.2);
      }

      // Apply specific enhancements based on image type
      if (await this._isDocument(metadata, stats)) {
        pipeline = pipeline
          .threshold()
          .linear(1.5, 0)
          .sharpen({ sigma: 1.5 });
      } else if (await this._isPhoto(metadata, stats)) {
        pipeline = pipeline
          .modulate({
            brightness: 1.1,
            saturation: 1.2
          })
          .sharpen({ sigma: 1.0 });
      }

      return pipeline;
    } catch (error) {
      logger.error('Image enhancement error:', error);
      throw error;
    }
  }

  // Text Extraction Methods
  async _extractText(imageBuffer) {
    try {
      const [result] = await this.visionClient.textDetection(imageBuffer);
      
      if (!result.fullTextAnnotation) {
        throw new AppError('No text detected in image', 400);
      }

      // Process text blocks with position information
      const blocks = this._processTextBlocks(result.fullTextAnnotation.pages[0].blocks);

      // Extract text layout and structure
      const layout = this._analyzeLayout(blocks);

      return {
        fullText: result.fullTextAnnotation.text,
        blocks: blocks,
        layout: layout,
        confidence: result.fullTextAnnotation.confidence,
        language: this._detectLanguage(result.fullTextAnnotation.text)
      };
    } catch (error) {
      logger.error('Text extraction error:', error);
      throw new AppError('Failed to extract text from image', 500);
    }
  }

  _processTextBlocks(blocks) {
    return blocks.map(block => {
      const words = block.paragraphs.flatMap(para => 
        para.words.map(word => ({
          text: word.symbols.map(symbol => symbol.text).join(''),
          confidence: word.confidence,
          bounds: this._getBoundingBox(word.boundingBox),
          symbols: word.symbols.map(symbol => ({
            text: symbol.text,
            confidence: symbol.confidence,
            bounds: this._getBoundingBox(symbol.boundingBox)
          }))
        }))
      );

      return {
        text: words.map(w => w.text).join(' '),
        confidence: block.confidence,
        bounds: this._getBoundingBox(block.boundingBox),
        words: words,
        orientation: this._detectOrientation(block.boundingBox)
      };
    });
  }

  // Document Classification and Processing Methods
  async _classifyDocumentType(textData) {
    const { fullText, blocks } = textData;
    const scores = {};
    const metadata = {};

    // Calculate scores for each document type
    for (const [type, criteria] of Object.entries(this.documentTypes)) {
      scores[type] = this._calculateScore(fullText, blocks, criteria);
      if (scores[type] > criteria.confidence) {
        metadata[type] = this._extractMetadata(textData, criteria.metadataFields);
      }
    }

    // Get the highest scoring type
    const bestMatch = Object.entries(scores).reduce((best, current) => {
      return current[1] > best[1] ? current : best;
    }, ['unknown', 0]);

    // Extract vendor information
    const vendor = this._extractVendorInfo(fullText, blocks);

    // Get possible other types that met their confidence threshold
    const possibleTypes = Object.entries(scores)
      .filter(([type, score]) => {
        const threshold = this.documentTypes[type].confidence;
        return score >= threshold && type !== bestMatch[0];
      })
      .map(([type, score]) => ({
        type,
        confidence: score
      }));

    return {
      type: bestMatch[0],
      confidence: bestMatch[1],
      vendor,
      metadata: metadata[bestMatch[0]] || {},
      possibleTypes,
      textQuality: this._assessTextQuality(blocks),
      layoutAnalysis: this._analyzeLayout(blocks)
    };
  }

  async _processBasedOnType(textData, documentType) {
    switch(documentType) {
      case 'receipt':
        return this._processReceipt(textData);
      case 'invoice':
        return this._processInvoice(textData);
      default:
        return {
          type: 'unknown',
          text: textData.fullText
        };
    }
  }

  // Document-Specific Processing Methods
  _processReceipt(textData) {
    const receiptData = {
      vendor: this._extractVendor(textData.fullText),
      date: this._extractDate(textData.fullText),
      items: this._extractReceiptItems(textData.fullText),
      total: this._extractTotal(textData.fullText),
      paymentMethod: this._extractPaymentMethod(textData.fullText)
    };

    return {
      type: 'receipt',
      ...receiptData
    };
  }

  _processInvoice(textData) {
    const invoiceData = {
      invoiceNumber: this._extractInvoiceNumber(textData.fullText),
      date: this._extractDate(textData.fullText),
      total: this._extractTotal(textData.fullText),
      items: this._extractInvoiceItems(textData.fullText)
    };

    return {
      type: 'invoice',
      ...invoiceData
    };
  }

  // Helper Methods
  _getBoundingBox(boundingBox) {
    if (!boundingBox || !boundingBox.vertices) return null;

    const vertices = boundingBox.vertices;
    return {
      left: Math.min(...vertices.map(v => v.x)),
      right: Math.max(...vertices.map(v => v.x)),
      top: Math.min(...vertices.map(v => v.y)),
      bottom: Math.max(...vertices.map(v => v.y)),
      vertices: vertices
    };
  }

  _analyzeLayout(blocks) {
    return {
      columns: this._detectColumns(blocks),
      alignment: this._detectAlignment(blocks),
      tables: this._detectTables(blocks),
      orientation: this._detectDocumentOrientation(blocks)
    };
  }

  // Data Extraction Methods
  _extractVendorInfo(fullText, blocks) {
    const vendor = {
      name: null,
      website: null,
      phone: null,
      address: null,
      confidence: 0
    };

    // Prioritize finding vendor info near the top of the document using bounding box
    const sortedBlocks = blocks.sort((a, b) => {
      // Sort by vertical position (top)
      return a.bounds.top - b.bounds.top;
    });

    for (const block of sortedBlocks) { // Start from top
      const blockText = block.text;

      // Try to extract vendor name from header-like blocks
      const headerMatch = blockText.match(this.vendorPatterns.header);
      if (headerMatch) {
        vendor.name = headerMatch[1].trim();
        vendor.confidence += 0.4; // Higher confidence for header match
        // Once a likely header is found, we can potentially stop searching for name
      }

      // Extract website if present in the block
      const websiteMatch = blockText.match(this.vendorPatterns.website);
      if (websiteMatch && !vendor.website) {
        vendor.website = websiteMatch[1];
        vendor.confidence += 0.2;
      }

      // Extract phone number if present in the block
      const phoneMatch = blockText.match(this.vendorPatterns.phone);
      if (phoneMatch && !vendor.phone) {
        vendor.phone = phoneMatch[1];
        vendor.confidence += 0.2;
      }

      // Extract address if present in the block
      const addressMatch = blockText.match(this.vendorPatterns.address);
      if (addressMatch && !vendor.address) {
        vendor.address = addressMatch[1];
        vendor.confidence += 0.2;
      }

      // If we found a name and some contact info, we can potentially stop early
      if (vendor.name && (vendor.website || vendor.phone || vendor.address)) {
        break;
      }
    }

    // Fallback to searching the full text if not found in blocks
    if (!vendor.name) {
       const headerMatch = fullText.match(this.vendorPatterns.header);
       if (headerMatch) {
         vendor.name = headerMatch[1].trim();
         vendor.confidence += 0.1; // Lower confidence for full text match
       }
    }
     if (!vendor.website) {
       const websiteMatch = fullText.match(this.vendorPatterns.website);
       if (websiteMatch) {
         vendor.website = websiteMatch[1];
         vendor.confidence += 0.05;
       }
     }
     if (!vendor.phone) {
       const phoneMatch = fullText.match(this.vendorPatterns.phone);
       if (phoneMatch) {
         vendor.phone = phoneMatch[1];
         vendor.confidence += 0.05;
       }
     }
     if (!vendor.address) {
       const addressMatch = fullText.match(this.vendorPatterns.address);
       if (addressMatch) {
         vendor.address = addressMatch[1];
         vendor.confidence += 0.05;
       }
     }


    return vendor;
  }

  _extractDate(text) {
    const datePatterns = [
      /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/,
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return new Date(match[0]);
        } catch {
          continue;
        }
      }
    }

    return new Date();
  }

  _extractReceiptItems(text) {
    const itemPattern = /(.+?)\s+(\d+(?:\.\d{1,2})?)\s*(?:x\s*(\d+))?/g;
    const items = [];
    let match;

    while ((match = itemPattern.exec(text)) !== null) {
      const [, name, price, quantity = 1] = match;
      items.push({
        name: name.trim(),
        price: parseFloat(price),
        quantity: parseInt(quantity)
      });
    }

    return items;
  }

  _extractInvoiceItems(text) {
    // Similar to receipt items but with additional invoice-specific fields
    const items = this._extractReceiptItems(text);
    return items.map(item => ({
      ...item,
      itemCode: this._extractItemCode(item.name),
      description: item.name
    }));
  }

  _extractTotal(textData) {
    const { fullText, blocks } = textData;
    const totalPatterns = [
      /total:?\s*\$?(\d+(?:\.\d{2})?)/i,
      /\$?(\d+(?:\.\d{2})?)(?:\s*total)/i,
      /grand\s*total:?\s*\$?(\d+(?:\.\d{2})?)/i,
      /\$?(\d+(?:\.\d{2})?)(?:\s*grand\s*total)/i
    ];

    // Prioritize finding "total" or "grand total" near the bottom right
    const sortedBlocks = blocks.sort((a, b) => {
      // Sort by vertical position (bottom) then horizontal position (right)
      return (a.bounds.bottom - b.bounds.bottom) || (a.bounds.right - b.bounds.right);
    });

    for (const block of sortedBlocks.reverse()) { // Start from bottom right
      for (const pattern of totalPatterns) {
        const match = block.text.match(pattern);
        if (match) {
          logger.info(`Found potential total in block: "${block.text}"`);
          return parseFloat(match[1]);
        }
      }
    }

    // Fallback to searching the full text if not found in blocks
    for (const pattern of totalPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        logger.info(`Found potential total in full text: "${match[0]}"`);
        return parseFloat(match[1]);
      }
    }

    logger.warn('Total amount not found');
    return null;
  }

  _extractPaymentMethod(text) {
    const paymentMethods = {
      card: /credit|debit|visa|mastercard|amex|card/i,
      cash: /cash|money|paid/i,
      check: /check|cheque/i,
      other: /gift card|voucher|coupon/i
    };

    for (const [method, pattern] of Object.entries(paymentMethods)) {
      if (text.match(pattern)) {
        return method;
      }
    }

    return 'unknown';
  }

  _extractMetadata(textData, fields) {
    const { fullText, blocks } = textData;
    const metadata = {};
    const patterns = {
      date: /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/,
      total: /total:?\s*\$?(\d+\.\d{2})/i,
      paymentMethod: /(?:paid\s+(?:by|with)|payment\s+method|payment\s+type):\s*(\w+)/i,
      invoiceNumber: /invoice\s*#?\s*([A-Z0-9-]+)/i,
      dueDate: /due\s*(?:date|by):\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
      terms: /(?:payment\s+)?terms:\s*(.+?)(?:\n|$)/i,
      serialNumber: /serial\s*#?\s*([A-Z0-9-]+)/i,
      warrantyPeriod: /warranty\s*period:?\s*(.+?)(?:\n|$)/i,
      productModel: /model\s*#?\s*([A-Z0-9-]+)/i
    };

    const sortedBlocks = blocks.sort((a, b) => a.bounds.top - b.bounds.top); // Sort by vertical position

    fields.forEach(field => {
      if (patterns[field]) {
        const pattern = patterns[field];
        let foundMatch = false;

        // Prioritize blocks based on expected location (e.g., date near top, total near bottom)
        const relevantBlocks = sortedBlocks.filter(block => {
          const blockCenterY = (block.bounds.top + block.bounds.bottom) / 2;
          switch (field) {
            case 'date':
              return blockCenterY < 200; // Arbitrary threshold for top section
            case 'total':
              return blockCenterY > 800; // Arbitrary threshold for bottom section
            default:
              return true; // Search all blocks for other fields
          }
        });

        for (const block of relevantBlocks) {
          const match = block.text.match(pattern);
          if (match) {
            metadata[field] = match[1];
            foundMatch = true;
            logger.info(`Found metadata field "${field}" in block: "${block.text}"`);
            break; // Move to the next field once found
          }
        }

        // Fallback to searching the full text if not found in relevant blocks
        if (!foundMatch) {
           const match = fullText.match(pattern);
           if (match) {
             metadata[field] = match[1];
             logger.info(`Found metadata field "${field}" in full text: "${match[0]}" (fallback)`);
           }
        }
      }
    });

    return metadata;
  }

  _analyzeStructure(blocks) {
    let structureScore = 0;

    // Check for consistent line spacing
    const lineSpacings = blocks.map(block =>
      block.boundingBox?.top - (block.boundingBox?.bottom || 0)
    );
    const avgSpacing = lineSpacings.reduce((a, b) => a + b, 0) / lineSpacings.length;
    const spacingConsistency = lineSpacings.every(spacing =>
      Math.abs(spacing - avgSpacing) < avgSpacing * 0.2
    );
    if (spacingConsistency) structureScore += 0.3;

    // Check for aligned text
    const leftAlignments = blocks.map(block => block.boundingBox?.left || 0);
    const avgLeftAlign = leftAlignments.reduce((a, b) => a + b, 0) / leftAlignments.length;
    const alignmentConsistency = leftAlignments.every(align =>
      Math.abs(align - avgLeftAlign) < 20
    );
    if (alignmentConsistency) structureScore += 0.3;

    // Check for consistent font sizes
    const hasConsistentFontSize = blocks.every((block, i, arr) =>
      i === 0 || block.boundingBox?.height === arr[i-1].boundingBox?.height
    );
    if (hasConsistentFontSize) structureScore += 0.4;

    return structureScore;
  }

  _assessTextQuality(blocks) {
    let qualityScore = 0;
    let totalConfidence = 0;

    blocks.forEach(block => {
      if (block.confidence) {
        totalConfidence += block.confidence;
      }
    });

    const averageConfidence = totalConfidence / blocks.length;
    qualityScore = averageConfidence * 0.7;

    // Check for common OCR errors
    const commonErrors = blocks.some(block =>
      block.text.includes('?') || block.text.includes('')
    );
    if (!commonErrors) qualityScore += 0.3;

    return {
      score: qualityScore,
      confidence: averageConfidence,
      hasErrors: commonErrors
    };
  }

  _detectColumns(blocks) {
    const columnThreshold = 20; // pixels
    const leftPositions = blocks.map(block => block.boundingBox?.left).filter(Boolean);
    const uniquePositions = [...new Set(leftPositions)].sort((a, b) => a - b);

    const columns = [];
    let currentColumn = [uniquePositions[0]];

    uniquePositions.slice(1).forEach(pos => {
      if (Math.abs(pos - currentColumn[currentColumn.length - 1]) <= columnThreshold) {
        currentColumn.push(pos);
      } else {
        columns.push(Math.round(currentColumn.reduce((a, b) => a + b) / currentColumn.length));
        currentColumn = [pos];
      }
    });

    if (currentColumn.length > 0) {
      columns.push(Math.round(currentColumn.reduce((a, b) => a + b) / currentColumn.length));
    }

    return columns;
  }

  _detectOrientation(blocks) {
    const verticalText = blocks.filter(block => {
      const box = block.boundingBox;
      return box && (box.right - box.left) < (box.bottom - box.top);
    }).length;

    return {
      angle: verticalText > blocks.length / 2 ? 90 : 0,
      confidence: Math.abs((blocks.length - verticalText * 2) / blocks.length)
    };
  }

  _identifySections(blocks) {
    const sections = [];
    let currentSection = null;

    blocks.forEach((block, index) => {
      // Check if block starts a new section
      const isHeader = this._isLikelyHeader(block);

      if (isHeader) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: block.text,
          startIndex: index,
          blocks: [block]
        };
      } else if (currentSection) {
        currentSection.blocks.push(block);
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  _isLikelyHeader(block) {
    // Check if block has characteristics of a header
    return block.text.length < 50 && // Short text
           block.text === block.text.toUpperCase() && // All caps
           !block.text.includes('$') && // Not a price
           !/^\d+/.test(block.text); // Doesn't start with numbers
  }

  // Image Analysis Helper Methods
  _needsProcessing(metadata) {
    return (
      metadata.width > this.processingConfig.maxWidth ||
      metadata.height > this.processingConfig.maxHeight ||
      metadata.format !== this.processingConfig.defaultFormat ||
      this._needsQualityReduction(metadata) ||
      this._needsEnhancement(metadata)
    );
  }

  _needsQualityReduction(metadata) {
    return metadata.size > 2 * 1024 * 1024; // 2MB threshold
  }

  _needsEnhancement(metadata) {
    return metadata.density < 300 || metadata.depth < 8;
  }

  _needsContrastEnhancement(stats) {
    const { mean, std } = stats.channels[0];
    return std < 30 || (mean > 200 || mean < 50);
  }

  _needsGammaCorrection(stats) {
    return stats.channels[0].mean < 128;
  }

  async _isDocument(metadata, stats) {
    const isHighResolution = metadata.density >= 300;
    const hasLowColorVariance = stats.isMonochrome || 
      (stats.channels[0].std < 50 && stats.channels[1].std < 50 && stats.channels[2].std < 50);
    
    return isHighResolution && hasLowColorVariance;
  }

  async _isPhoto(metadata, stats) {
    const hasColorVariance = stats.channels[0].std > 30;
    const hasNaturalAspectRatio = Math.abs(metadata.width / metadata.height - 1.5) < 0.5;
    
    return hasColorVariance && hasNaturalAspectRatio;
  }
  _analyzeTextLayout(extractedText) {
    return {
      blocks: extractedText.blocks,
      layout: extractedText.layout,
      orientation: this._detectDocumentOrientation(extractedText.blocks)
    };
  }
  // Layout Analysis Methods
  _detectColumns(blocks) {
    const columnThreshold = 20; // pixels
    const leftPositions = blocks.map(block => block.bounds.left);
    const rightPositions = blocks.map(block => block.bounds.right);

    // Group close positions
    const columns = [];
    let currentColumn = [leftPositions[0]];

    leftPositions.slice(1).forEach(pos => {
      const lastPos = currentColumn[currentColumn.length - 1];
      if (Math.abs(pos - lastPos) <= columnThreshold) {
        currentColumn.push(pos);
      } else {
        columns.push(Math.round(currentColumn.reduce((a, b) => a + b) / currentColumn.length));
        currentColumn = [pos];
      }
    });

    if (currentColumn.length > 0) {
      columns.push(Math.round(currentColumn.reduce((a, b) => a + b) / currentColumn.length));
    }

    return columns;
  }

  _detectAlignment(blocks) {
    const alignments = blocks.map(block => {
      const { left, right } = block.bounds;
      const width = right - left;
      const threshold = width * 0.1;

      return {
        block: block.text.substring(0, 20) + "...",
        alignment: this._findColumnAlignment(block.bounds),
        indentation: left,
        width
      };
    });

    return alignments;
  }

  _findColumnAlignment(bounds) {
    // Implementation of column alignment detection
    const { left, right, width } = bounds;
    const pageWidth = 1000; // Assume standard page width
    const threshold = 20; // pixels

    if (Math.abs(left) <= threshold) return 'left';
    if (Math.abs(pageWidth - right) <= threshold) return 'right';
    if (Math.abs((pageWidth / 2) - (left + width / 2)) <= threshold) return 'center';
    
    return 'justified';
  }

  _detectTables(blocks) {
    const tables = [];
    let currentTable = null;

    blocks.forEach((block, index) => {
      const { bounds } = block;
      const isTableRow = this._isLikelyTableRow(block, blocks[index - 1], blocks[index + 1]);

      if (isTableRow && !currentTable) {
        currentTable = {
          bounds: { ...bounds },
          rows: [block]
        };
      } else if (isTableRow && currentTable) {
        currentTable.rows.push(block);
        currentTable.bounds.bottom = bounds.bottom;
      } else if (!isTableRow && currentTable) {
        if (currentTable.rows.length > 1) {
          tables.push(currentTable);
        }
        currentTable = null;
      }
    });

    return tables;
  }

  _isLikelyTableRow(block, prevBlock, nextBlock) {
    if (!block || !block.words || block.words.length < 2) return false;

    // Check for consistent spacing between words
    const wordSpacings = [];
    for (let i = 1; i < block.words.length; i++) {
      const spacing = block.words[i].bounds.left - block.words[i-1].bounds.right;
      wordSpacings.push(spacing);
    }

    const avgSpacing = wordSpacings.reduce((a, b) => a + b, 0) / wordSpacings.length;
    const hasConsistentSpacing = wordSpacings.every(spacing => 
      Math.abs(spacing - avgSpacing) < avgSpacing * 0.5
    );

    // Check alignment with adjacent blocks
    const verticalAlignment = prevBlock && nextBlock &&
      Math.abs(block.bounds.left - prevBlock.bounds.left) < 10 &&
      Math.abs(block.bounds.left - nextBlock.bounds.left) < 10;

    return hasConsistentSpacing && verticalAlignment;
  }

  // Orientation Detection Methods
  _detectOrientation(boundingBox) {
    if (!boundingBox || !boundingBox.vertices) return 0;

    const vertices = boundingBox.vertices;
    const width = Math.abs(vertices[1].x - vertices[0].x);
    const height = Math.abs(vertices[3].y - vertices[0].y);

    if (width > height) {
      return 0; // horizontal
    }
    return 90; // vertical
  }

  _detectDocumentOrientation(blocks) {
    // Count blocks with different orientations
    const orientations = blocks.map(block => block.orientation);
    const horizontalCount = orientations.filter(o => o === 0).length;
    const verticalCount = orientations.filter(o => o === 90).length;

    return horizontalCount >= verticalCount ? 0 : 90;
  }

  // Language Detection Method
  _detectLanguage(text) {
    const scripts = {
      latin: /[a-zA-Z]/,
      cyrillic: /[а-яА-Я]/,
      chinese: /[\u4E00-\u9FFF]/,
      japanese: /[\u3040-\u30FF]/,
      korean: /[\uAC00-\uD7AF]/
    };

    const scriptCounts = {};
    for (const [script, pattern] of Object.entries(scripts)) {
      scriptCounts[script] = (text.match(pattern) || []).length;
    }

    return Object.entries(scriptCounts)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  // Calculate document type score
  _calculateDocumentTypeScore(text, criteria) {
    const textLower = text.toLowerCase();
    let score = 0;

    // Check keywords
    const keywordMatches = criteria.keywords.filter(keyword => 
      textLower.includes(keyword.toLowerCase())
    ).length;
    score += keywordMatches / criteria.keywords.length * 0.6;

    // Check regex patterns
    const patternMatches = criteria.patterns.filter(pattern => 
      pattern.test(text)
    ).length;
    score += patternMatches / criteria.patterns.length * 0.4;

    return score;
  }

  // Dimension calculation method
  _calculateDimensions(metadata) {
    const aspectRatio = metadata.width / metadata.height;
    let width = metadata.width;
    let height = metadata.height;

    if (width > this.processingConfig.maxWidth) {
      width = this.processingConfig.maxWidth;
      height = Math.round(width / aspectRatio);
    }

    if (height > this.processingConfig.maxHeight) {
      height = this.processingConfig.maxHeight;
      width = Math.round(height * aspectRatio);
    }

    return { width, height };
  }
  extractItemCode(itemName) {
    const codePattern = /([A-Z0-9]{5,})|([A-Z]{2,}[0-9]{3,})/;
    const match = itemName.match(codePattern);
    return match ? match[0] : null;
  }
  // Image upload method
  async _uploadImage(file, userId, buffer) {
    try {
      const bucket = storage.bucket();
      const timestamp = Date.now();
      const fileName = `documents/${userId}/${timestamp}-${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(buffer, {
        metadata: { contentType: file.mimetype }
      });

      const [url] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });

      return url;
    } catch (error) {
      logger.error('Image upload error:', error);
      throw new AppError('Failed to upload image', 500);
    }
  }
}

module.exports = new DocumentProcessingService();
