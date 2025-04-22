const logger = require('../logger'); //good

class DocumentClassifier {
  constructor() {
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

  async classifyDocument(textData) {
    try {
      const { fullText, blocks } = textData;
      const scores = {};
      const metadata = {};

      // Calculate scores for each document type
      for (const [type, criteria] of Object.entries(this.documentTypes)) {
        scores[type] = this._calculateScore(fullText, blocks, criteria);
        if (scores[type] > criteria.confidence) {
          metadata[type] = this._extractMetadata(fullText, criteria.metadataFields);
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
    } catch (error) {
      logger.error('Document classification error:', error);
      throw new Error('Failed to classify document');
    }
  }

  _calculateScore(fullText, blocks, criteria) {
    let score = 0;
    const text = fullText.toLowerCase();

    // Check keywords
    const keywordMatches = criteria.keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    ).length;
    score += keywordMatches / criteria.keywords.length * 0.5;

    // Check patterns
    const patternMatches = criteria.patterns.filter(pattern => 
      pattern.test(text)
    ).length;
    score += patternMatches / criteria.patterns.length * 0.3;

    // Check text structure and layout
    score += this._analyzeStructure(blocks) * 0.2;

    return score;
  }

  _extractVendorInfo(fullText, blocks) {
    const vendor = {
      name: null,
      website: null,
      phone: null,
      address: null,
      confidence: 0
    };

    // Try to extract vendor name from header
    const headerMatch = fullText.match(this.vendorPatterns.header);
    if (headerMatch) {
      vendor.name = headerMatch[1].trim();
      vendor.confidence += 0.3;
    }

    // Extract website if present
    const websiteMatch = fullText.match(this.vendorPatterns.website);
    if (websiteMatch) {
      vendor.website = websiteMatch[1];
      vendor.confidence += 0.2;
    }

    // Extract phone number
    const phoneMatch = fullText.match(this.vendorPatterns.phone);
    if (phoneMatch) {
      vendor.phone = phoneMatch[1];
      vendor.confidence += 0.2;
    }

    // Extract address
    const addressMatch = fullText.match(this.vendorPatterns.address);
    if (addressMatch) {
      vendor.address = addressMatch[1];
      vendor.confidence += 0.3;
    }

    return vendor;
  }

  _extractMetadata(text, fields) {
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

    fields.forEach(field => {
      if (patterns[field]) {
        const match = text.match(patterns[field]);
        if (match) {
          metadata[field] = match[1];
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

  _analyzeLayout(blocks) {
    return {
      columns: this._detectColumns(blocks),
      orientation: this._detectOrientation(blocks),
      sections: this._identifySections(blocks)
    };
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
      block.text.includes('?') || block.text.includes('�')
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
}

module.exports = new DocumentClassifier();