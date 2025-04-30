const documentService = require('../services/document/documentService');
const logger = require('../utils/logger');
const { AppError } = require('../utils/error/AppError'); // Assuming AppError exists

/**
 * @desc Handles document upload requests, processes the document using OCR and classification, and saves the data.
 * @route POST /api/documents/upload
 * @access Private (Authenticated User)
 * @param {object} req - Express request object
 * @param {object} req.file - The uploaded file object (from multer)
 * @param {string} [req.body.documentType='general'] - The type of document being uploaded
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No document file provided.', 400);
    }
    const userId = req.user?.uid;
    if (!userId) {
      throw new AppError('User not authenticated.', 401);
    }
    const documentType = req.body.documentType || 'general'; // Use provided type or default

    logger.info(`Received document upload request for user ${userId}, type: ${documentType}, filename: ${req.file.originalname}`);

    // 1. Upload file securely using the service
    const { imageUrl, gcsUri } = await documentService.handleUpload(req.file, userId, documentType);
    logger.info(`File uploaded for user ${userId}. GCS URI: ${gcsUri}`);

    // 2. Extract text using Vision API (using GCS URI)
    const textAnnotation = await documentService.extractTextFromGcsUri(gcsUri);
    logger.info(`Text extracted successfully for ${gcsUri}`);

    // 3. Classify document based on text
    const classificationResult = await documentService.classifyDocumentText(textAnnotation);
    logger.info(`Document classified as ${classificationResult.type} with confidence ${classificationResult.confidence}`);

    // 4. Prepare data for saving
    const documentData = {
      imageUrl, // Signed URL for client access
      gcsUri,   // GCS URI for potential backend processing
      extractedText: textAnnotation.text,
      classificationResult, // Includes type, confidence, vendor, metadata
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      status: 'processed', // Mark as processed
    };

    // 5. Save document metadata to Firestore
    const documentId = await documentService.saveDocumentData(userId, documentData);
    logger.info(`Document metadata saved to Firestore with ID: ${documentId}`);

    // 6. Send response back to client
    res.status(201).json({
      message: 'Document processed and saved successfully.',
      documentId: documentId,
      imageUrl: imageUrl, // Send back the accessible URL
      classification: classificationResult,
    });

  } catch (error) {
    // Log the detailed error but pass a potentially sanitized error to the client
    logger.error(`Error processing document upload for user ${req.user?.uid}: ${error.message}`, { stack: error.stack, name: error.name });
    // Use the centralized error handler
    next(error instanceof AppError ? error : new AppError('Failed to process document.', 500));
  }
};

/**
 * @desc Handles receipt correction requests.
 * @route PUT /api/documents/correct/:id
 * @access Private (Authenticated User, Owner)
 * @param {object} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.id - The ID of the document to correct.
 * @param {object} req.body - JSON object containing the corrected data.
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const correctReceipt = async (req, res, next) => {
  try {
    const documentId = req.params.id;
    const userId = req.user?.uid;
    const correctedData = req.body; // Expecting corrected data from client

    if (!documentId) {
      throw new AppError('Document ID is required for correction.', 400);
    }
    if (!userId) {
      throw new AppError('User not authenticated.', 401);
    }
    if (!correctedData || Object.keys(correctedData).length === 0) {
       throw new AppError('Corrected data is required.', 400);
    }

    logger.info(`Received correction request for document ${documentId} by user ${userId}`);

    // Call service to save the correction
    await documentService.saveCorrection(documentId, userId, correctedData);

    res.status(200).json({
      message: 'Receipt correction saved successfully.',
      documentId: documentId,
    });

  } catch (error) {
    logger.error(`Error saving receipt correction for document ${req.params?.id} by user ${req.user?.uid}: ${error.message}`, { stack: error.stack, name: error.name });
    next(error instanceof AppError ? error : new AppError('Failed to save receipt correction.', 500));
  }
};

/**
 * @desc Handles requests to fetch documents with filtering and pagination.
 * @route GET /api/documents
 * @access Private (Authenticated User)
 * @param {object} req - Express request object
 * @param {object} req.query - Query parameters for filtering and pagination
 * @param {number} [req.query.limit] - Maximum number of documents to return per page
 * @param {string} [req.query.startAfter] - Document ID to start fetching after (for cursor-based pagination)
 * @param {string} [req.query.documentType] - Filter by document type
 * @param {string} [req.query.category] - Filter by classified category
 * @param {string} [req.query.merchant] - Filter by classified merchant
 * @param {string} [req.query.startDate] - Filter documents from this date (ISO 8601)
 * @param {string} [req.query.endDate] - Filter documents up to this date (ISO 8601)
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
const getDocuments = async (req, res, next) => {
  try {
    const {
      limit,
      startAfter,
      documentType,
      category,
      merchant,
      startDate,
      endDate
    } = req.query;
    const userId = req.user.uid;

    const options = {
      limit: parseInt(limit), // Ensure limit is a number
      startAfter,
      documentType,
      category,
      merchant,
      startDate: startDate ? new Date(startDate) : undefined, // Convert dates
      endDate: endDate ? new Date(endDate) : undefined
    };

    // Call the service to get documents with pagination and filtering
    const { documents, lastVisible, hasNextPage } = await documentService.getDocuments(userId, options); // Assuming getDocuments function in service

    res.status(200).json({
      status: 'success',
      data: {
        documents,
        pagination: {
          lastVisible,
          hasNextPage
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching documents:', error);
    next(new AppError('Failed to fetch documents', 500));
  }
};


module.exports = {
  uploadDocument,
  correctReceipt,
  getDocuments
};
