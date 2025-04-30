const { getStorage } = require('firebase-admin/storage');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const vision = require('@google-cloud/vision');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');
const { AppError } = require('../../utils/error/AppError');

const db = getFirestore();
let visionClient;
try {
  visionClient = new vision.ImageAnnotatorClient();
  logger.info('Google Cloud Vision client initialized successfully.');
} catch (error) {
  logger.error('Failed to initialize Google Cloud Vision client:', error);
}

// --- Classification Logic ---
const documentTypes = { /* ... [definitions as before] ... */ };
const vendorPatterns = { /* ... [definitions as before] ... */ };
const metadataPatterns = {
  // Improved patterns for receipt data
  date: /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d{4}[./-]\d{1,2}[./-]\d{1,2}|\w+\s+\d{1,2},\s+\d{4})/, // Various date formats
  total: /(?:TOTAL|BALANCE|AMOUNT DUE|GRAND TOTAL)[:\s]*[\$€£]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i, // Total amount with currency and commas
  // Add more patterns for other fields like subtotal, tax, payment method, etc.
};

/**
 * @desc Calculates a classification score based on text content and structure.
 * @param {string} fullText - The full extracted text.
 * @param {Array<object>} blocks - Array of text blocks with bounding boxes.
 * @param {object} criteria - Criteria for scoring (keywords, patterns, structure weight).
 * @returns {number} - Classification score between 0 and 1.
 */
function _calculateScore(fullText, blocks, criteria) {
  let score = 0;
  const text = fullText.toLowerCase();
  const blockCount = blocks?.length || 0;
  if (!text || blockCount === 0) return 0;
  const keywordMatches = criteria.keywords.filter(keyword => text.includes(keyword.toLowerCase())).length;
  score += (keywordMatches / criteria.keywords.length) * 0.5;
  const patternMatches = criteria.patterns.filter(pattern => pattern.test(text)).length;
  score += (patternMatches / criteria.patterns.length) * 0.3;
  score += _analyzeStructure(blocks) * 0.2;
  return Math.min(score, 1.0);
}

/**
 * @desc Extracts vendor information from the text annotation using predefined patterns.
 * @param {string} fullText - The full extracted text.
 * @param {Array<object>} blocks - Array of text blocks with bounding boxes.
 * @returns {object} - Extracted vendor information (name, website, phone, address) with confidence score.
 */
function _extractVendorInfo(fullText, blocks) {
    const vendor = { name: null, website: null, phone: null, address: null, confidence: 0 };
    if (!blocks || blocks.length === 0) return vendor;
    const sortedBlocks = blocks.sort((a, b) => (a.boundingBox?.vertices?.[0]?.y || 0) - (b.boundingBox?.vertices?.[0]?.y || 0));
    const topBlocks = sortedBlocks.slice(0, 5);
    for (const block of topBlocks) {
        const blockText = block.paragraphs?.map(p => p.words?.map(w => w.symbols?.map(s => s.text).join('')).join(' ')).join('\n') || '';
        if (!blockText) continue;
        const headerMatch = blockText.match(vendorPatterns.header);
        if (headerMatch && !vendor.name) { vendor.name = headerMatch[1].trim(); vendor.confidence += 0.4; }
        const websiteMatch = blockText.match(vendorPatterns.website);
        if (websiteMatch && !vendor.website) { vendor.website = websiteMatch[1]; vendor.confidence += 0.2; }
        const phoneMatch = blockText.match(vendorPatterns.phone);
        if (phoneMatch && !vendor.phone) { vendor.phone = phoneMatch[1].trim(); vendor.confidence += 0.2; }
        const addressMatch = blockText.match(vendorPatterns.address);
        if (addressMatch && !vendor.address) { vendor.address = addressMatch[1].trim(); vendor.confidence += 0.2; }
        if (vendor.name && (vendor.website || vendor.phone || vendor.address)) break;
    }
     if (!vendor.name && fullText) {
       const headerMatch = fullText.match(vendorPatterns.header);
       if (headerMatch) { vendor.name = headerMatch[1].trim(); vendor.confidence += 0.1; }
     }
    vendor.confidence = Math.min(vendor.confidence, 1.0);
    return vendor;
}

/**
 * @desc Extracts specific metadata fields from the text annotation using predefined patterns.
 * Includes confidence scores for extracted fields.
 * @param {string} fullText - The full extracted text.
 * @param {Array<object>} blocks - Array of text blocks with bounding boxes.
 * @param {Array<string>} fields - Array of field names to extract.
 * @returns {object} - Extracted metadata with values and confidence scores.
 */
function _extractMetadata(fullText, blocks, fields) {
    const metadata = {}; // Initialize metadata object
    if (!blocks || blocks.length === 0 || !fullText) return metadata;

    fields.forEach(field => {
        if (metadataPatterns[field]) {
            const pattern = metadataPatterns[field];
            let extractedValue = null;
            let confidence = 0;

            // Prioritize finding the pattern within blocks
            for (const block of blocks) {
                 const blockText = block.paragraphs?.map(p => p.words?.map(w => w.symbols?.map(s => s.text).join('')).join(' ')).join('\n') || '';
                 if (!blockText) continue;
                 const match = blockText.match(pattern);
                 if (match && match[1]) {
                     extractedValue = match[1].trim();
                     confidence = 0.8; // Higher confidence for block match
                     break; // Found in a block, prioritize this
                 }
            }

            // If not found in blocks, try finding in the full text
            if (extractedValue === null) {
                const match = fullText.match(pattern);
                if (match && match[1]) {
                    extractedValue = match[1].trim();
                    confidence = 0.4; // Lower confidence for full text match
                }
            }

            if (extractedValue !== null) {
                metadata[field] = {
                    value: extractedValue,
                    confidence: confidence
                };
            }
        }
    });
    return metadata;
}

/**
 * @desc Analyzes the structural layout of text blocks to aid classification.
 * @param {Array<object>} blocks - Array of text blocks with bounding boxes.
 * @returns {number} - A score indicating structural characteristics (e.g., presence of varied line heights).
 */
function _analyzeStructure(blocks) {
    if (!blocks || blocks.length < 3) return 0;
    const heights = blocks.map(b => (b.boundingBox?.vertices?.[2]?.y || 0) - (b.boundingBox?.vertices?.[0]?.y || 0)).filter(h => h > 0);
    if (heights.length < 2) return 0.1;
    const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
    const hasVariedHeights = heights.some(h => Math.abs(h - avgHeight) > avgHeight * 0.5);
    return hasVariedHeights ? 0.5 : 0.2;
}
// --- End Classification Logic ---


/**
 * @desc Handles the secure upload of a document file to Firebase Cloud Storage.
 * Returns the GCS URI and a signed URL for client access.
 * @param {object} file - The file object to upload (e.g., from multer).
 * @param {string} userId - The ID of the user uploading the file.
 * @param {string} documentType - The type of document being uploaded (e.g., 'receipt').
 * @returns {Promise<{imageUrl: string, gcsUri: string}>} - A promise that resolves with the signed URL and GCS URI.
 * @throws {AppError} - Throws an error if upload fails or inputs are invalid.
 */
const handleUpload = async (file, userId, documentType) => {
  if (!file) throw new AppError('No file provided for upload.', 400);
  if (!userId) throw new AppError('User ID is required for upload.', 400);
  if (!getStorage) throw new AppError('Firebase Admin Storage is not initialized.', 500);

  const bucket = getStorage().bucket(); // Default bucket
  if (!bucket) throw new AppError('Firebase Storage bucket is not available.', 500);

  const fileExtension = file.originalname.split('.').pop();
  const filePath = `${documentType}s/${userId}/${uuidv4()}.${fileExtension}`;
  const fileUpload = bucket.file(filePath);
  const gcsUri = `gs://${bucket.name}/${filePath}`; // Construct GCS URI

  logger.info(`Attempting to upload file to GCS path: ${filePath} for user ${userId}`);

  try {
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: { userId, originalName: file.originalname, uploadTimestamp: Date.now().toString(), documentType }
      },
    });

    await new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        logger.error(`GCS upload stream error for ${filePath}: ${err.message}`, { stack: err.stack });
        reject(new AppError('Failed to upload document to storage.', 500));
      });
      stream.on('finish', () => {
        logger.info(`GCS upload finished successfully for ${filePath}`);
        resolve();
      });
      stream.end(file.buffer);
    });

    const signedUrlConfig = { action: 'read', expires: '03-09-2491' };
    const [signedUrl] = await fileUpload.getSignedUrl(signedUrlConfig);

    logger.info(`Generated signed URL for ${filePath}`);
    return { imageUrl: signedUrl, gcsUri: gcsUri }; // Return GCS URI too

  } catch (error) {
    logger.error(`Failed to upload document ${filePath} for user ${userId}: ${error.message}`, { stack: error.stack });
    throw new AppError('Server error during document upload.', 500);
  }
};

/**
 * @desc Extracts text and layout information from an image stored in GCS using Google Cloud Vision API.
 * @param {string} gcsUri - The GCS URI of the image file (gs://bucket-name/path/to/file).
 * @returns {Promise<object>} - An object containing fullTextAnnotation.
 * @throws {AppError} - Throws an error if Vision API call fails or input is invalid.
 */
const extractTextFromGcsUri = async (gcsUri) => {
  if (!visionClient) throw new AppError('Vision client is not initialized.', 500);
  if (!gcsUri || !gcsUri.startsWith('gs://')) throw new AppError('Valid GCS URI is required.', 400);

  try {
    logger.info(`Sending request to Vision API for text detection from GCS URI: ${gcsUri}`);
    const [result] = await visionClient.textDetection(gcsUri); // Use GCS URI directly

    if (result.error) {
        logger.error('Google Cloud Vision API error:', result.error);
        throw new AppError(`Vision API Error: ${result.error.message}`, 500);
    }

    logger.info(`Successfully received text detection result from Vision API for ${gcsUri}.`);
    return result.fullTextAnnotation || { text: '', pages: [] };
  } catch (error) {
    logger.error(`Failed to extract text using Vision API from ${gcsUri}: ${error.message}`, { stack: error.stack });
    throw new AppError('Failed to extract text from image.', 500);
  }
};


/**
 * @desc Classifies the document based on extracted text annotation.
 * @param {object} textAnnotation - The fullTextAnnotation object from Vision API.
 * @returns {Promise<object>} - Classification results including type, confidence, vendor, metadata.
 */
const classifyDocumentText = async (textAnnotation) => {
  logger.info('Starting document classification.');
  if (!textAnnotation || !textAnnotation.text) {
      logger.warn('No text content found for classification.');
      return { type: 'unknown', confidence: 0, vendor: {}, metadata: {} };
  }

  const fullText = textAnnotation.text;
  const blocks = textAnnotation.pages?.[0]?.blocks || [];

  const scores = {};
  const extractedMetadata = {};

  for (const [type, criteria] of Object.entries(documentTypes)) {
    scores[type] = _calculateScore(fullText, blocks, criteria);
    if (scores[type] >= criteria.confidence) {
      extractedMetadata[type] = _extractMetadata(fullText, blocks, criteria.metadataFields);
    }
  }

  let bestMatchType = 'unknown';
  let bestMatchScore = 0;
  for (const [type, score] of Object.entries(scores)) {
      if (score > bestMatchScore && score >= documentTypes[type].confidence) {
          bestMatchScore = score;
          bestMatchType = type;
      }
  }

  const vendorInfo = _extractVendorInfo(fullText, blocks);

  const result = {
    type: bestMatchType,
    confidence: bestMatchScore,
    vendor: vendorInfo,
    metadata: extractedMetadata[bestMatchType] || {},
  };
  logger.info(`Classification result: Type=${result.type}, Confidence=${result.confidence.toFixed(2)}`);
  return result;
};

/**
 * @desc Saves the processed document data to Firestore.
 * @param {string} userId - The authenticated user's ID.
 * @param {object} documentData - The data to save (including classification, vendor, metadata, imageUrl, etc.).
 * @returns {Promise<string>} - The ID of the newly created Firestore document.
 * @throws {AppError} - If saving fails or inputs are invalid.
 */
const saveDocumentData = async (userId, documentData) => {
  if (!userId || !documentData) throw new AppError('User ID and document data are required to save.', 400);

  logger.info(`Attempting to save document data for user ${userId}`);
  try {
    const dataToSave = {
        userId,
        imageUrl: documentData.imageUrl, // From upload
        gcsUri: documentData.gcsUri,     // From upload
        extractedText: documentData.extractedText, // From Vision
        classification: {              // From classification
            type: documentData.classificationResult.type,
            confidence: documentData.classificationResult.confidence,
        },
        vendor: documentData.classificationResult.vendor, // From classification
        metadata: documentData.classificationResult.metadata, // From classification
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('documents').add(dataToSave);
    logger.info(`Document data saved successfully with ID: ${docRef.id} for user ${userId}`);
    return docRef.id;
  } catch (error) {
    logger.error(`Failed to save document data for user ${userId}: ${error.message}`, { stack: error.stack });
    throw new AppError('Failed to save document data to database.', 500);
  }
};

/**
 * @desc Saves corrected receipt data to Firestore.
 * @param {string} documentId - The ID of the document to correct.
 * @param {string} userId - The authenticated user's ID.
 * @param {object} correctedData - The corrected data from the client.
 * @throws {AppError} - If saving fails or document not found/owned by user.
 */
const saveCorrection = async (documentId, userId, correctedData) => {
  if (!documentId || !userId || !correctedData) {
    throw new AppError('Document ID, user ID, and corrected data are required to save correction.', 400);
  }

  logger.info(`Attempting to save correction for document ${documentId} by user ${userId}`);
  try {
    const docRef = db.collection('documents').doc(documentId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new AppError('Document not found.', 404);
    }

    const documentData = doc.data();

    // Verify document ownership
    if (documentData.userId !== userId) {
      throw new AppError('Unauthorized: You do not own this document.', 403);
    }

    // Store original OCR result if not already stored
    const originalOcrResult = documentData.originalOcrResult || {
        extractedText: documentData.extractedText,
        classification: documentData.classification,
        vendor: documentData.vendor,
        metadata: documentData.metadata,
    };

    // Update document with corrected data and original OCR result
    const updateData = {
      correctedData: correctedData, // Store the corrected data provided by the user
      originalOcrResult: originalOcrResult, // Preserve the original OCR result
      updatedAt: FieldValue.serverTimestamp(),
      // Optionally update status or add a flag indicating correction
      status: 'corrected',
    };

    await docRef.update(updateData);
    logger.info(`Correction saved successfully for document ${documentId}`);

  } catch (error) {
    logger.error(`Failed to save correction for document ${documentId} by user ${userId}: ${error.message}`, { stack: error.stack });
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to save document correction.', 500);
  }
};


/**
 * @desc Fetches documents for a user with filtering and pagination.
 * @param {string} userId - The ID of the user.
 * @param {object} [options] - Options for filtering, sorting, and pagination.
 * @param {number} [options.limit] - Maximum number of results to return.
 * @param {string} [options.startAfter] - Document ID to start pagination after (cursor).
 * @param {string} [options.documentType] - Filter by document type ('receipt', 'other').
 * @param {string} [options.category] - Filter by category (assuming category is stored in classification.metadata).
 * @param {string} [options.merchant] - Filter by merchant (assuming merchant is stored in vendor.name).
 * @param {Date} [options.startDate] - Filter by start date (assuming a date field like 'createdAt').
 * @param {Date} [options.endDate] - Filter by end date (assuming a date field like 'createdAt').
 * @returns {Promise<{documents: object[], lastVisible: string|null, hasNextPage: boolean}>} - Paginated list of documents and pagination info.
 * @throws {AppError} - If fetching fails or user ID is missing.
 */
const getDocuments = async (userId, options = {}) => {
  if (!userId) throw new AppError('User ID is required to fetch documents.', 400);

  logger.info(`Fetching documents for user ${userId} with options: ${JSON.stringify(options)}`);
  try {
    let query = db.collection('documents').where('userId', '==', userId);

    // Apply filters
    if (options.documentType) {
      query = query.where('classification.type', '==', options.documentType); // Assuming type is stored in classification
    }
    if (options.category) {
      // Assuming category is stored in classification.metadata.category.value
      query = query.where('classification.metadata.category.value', '==', options.category);
    }
    if (options.merchant) {
      // Assuming merchant name is stored in vendor.name
      query = query.where('vendor.name', '==', options.merchant);
    }
    if (options.startDate) {
      // Assuming documents have a 'createdAt' timestamp field
      query = query.where('createdAt', '>=', options.startDate);
    }
    if (options.endDate) {
      // Assuming documents have a 'createdAt' timestamp field
      query = query.where('createdAt', '<=', options.endDate);
    }

    // Apply sorting (defaulting to createdAt descending)
    const sortBy = options.sortBy || 'createdAt'; // Assuming a default sort field
    const sortOrder = options.sortOrder || 'desc'; // Default to descending for recent items
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    if (options.startAfter) {
      const startAfterDoc = await db.collection('documents').doc(options.startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      } else {
         logger.warn(`StartAfter document not found for user ${userId}: ${options.startAfter}`);
         // Optionally handle this error or return the first page
      }
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Determine the last visible document for the next page
    const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;
    const hasNextPage = options.limit && snapshot.docs.length === options.limit; // Check if the number of results equals the limit

    logger.info(`Fetched ${documents.length} documents for user ${userId}. Has next page: ${hasNextPage}`);
    return { documents, lastVisible, hasNextPage };

  } catch (error) {
    logger.error(`Error fetching documents for user ${userId}: ${error.message}`, { stack: error.stack });
    throw new AppError('Failed to fetch documents.', 500);
  }
};


module.exports = {
  handleUpload,
  extractTextFromGcsUri,
  classifyDocumentText,
  saveDocumentData,
  saveCorrection,
  getDocuments
};
