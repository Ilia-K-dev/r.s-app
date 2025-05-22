// client/src/features/documents/utils/documentClassifier.js

/**
 * Classifies a document based on its extracted text content.
 * @param {string} text - The extracted text from the document.
 * @returns {{classification: 'receipt' | 'invoice' | 'generic', confidence: number}} - The classified document type and a confidence score.
 */
export const classifyDocument = (text) => {
  if (!text || text.trim() === '') {
    return { classification: 'generic', confidence: 0.1 }; // Low confidence for empty text
  }

  const lowerText = text.toLowerCase();

  // Simple pattern matching for classification
  let classification = 'generic';
  let confidence = 0.5; // Default confidence for generic

  // Receipt patterns
  if (lowerText.includes('receipt') || lowerText.includes('total') || lowerText.includes('cashier') || lowerText.includes('thank you')) {
    classification = 'receipt';
    confidence += 0.2; // Increase confidence
  }

  // Invoice patterns
  if (lowerText.includes('invoice') || lowerText.includes('bill to') || lowerText.includes('ship to') || lowerText.includes('due date')) {
    classification = 'invoice';
    confidence += 0.2; // Increase confidence
  }

  // If patterns for both receipt and invoice are present, refine or keep generic
  if (classification === 'receipt' && lowerText.includes('invoice')) {
      // More sophisticated logic might be needed here to differentiate
      // For now, if both are present, maybe lean towards generic or the one with more specific keywords
      // Let's keep the first match for simplicity in this basic version
  }


  // Ensure confidence is within a reasonable range (0 to 1)
  confidence = Math.min(1, Math.max(0, confidence));

  // Adjust confidence based on text length or other factors if needed
  // e.g., very short text might have lower confidence regardless of keywords

  return { classification, confidence };
};

// Add comments about classification algorithm and accuracy considerations
// Classification algorithm: This is a basic keyword-based pattern matching algorithm. It checks for the presence of specific terms commonly found in receipts and invoices to determine the document type.
// Accuracy considerations: This simple algorithm is prone to errors and has limited accuracy. It can be easily fooled by documents containing keywords from multiple types or by variations in language and formatting.
// To improve accuracy, future iterations could consider:
// - Using more sophisticated text analysis techniques (e.g., natural language processing libraries).
// - Training a machine learning model on a dataset of labeled documents.
// - Analyzing document structure and layout in addition to text content.
// - Using a larger and more diverse set of keywords and phrases.
// - Implementing fuzzy matching for keywords to handle typos or variations.
