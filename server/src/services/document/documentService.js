const admin = require('firebase-admin');
const db = admin.firestore();
const storage = admin.storage();
const visionService = require('./visionService'); // Assuming Vision service location
const { handleError, AppError } = require('../../utils/errorHandler'); // Assuming error handler utility
const { logInfo, logError } = require('../../utils/logger'); // Assuming logger utility
const { validateDocumentData } = require('../../utils/validation'); // Assuming validation utility

// Reference to the 'documents' collection
const documentsCollection = db.collection('documents');

/**
 * Processes an uploaded document (saves to storage, performs OCR) and saves metadata to Firestore.
 * @param {string} userId The ID of the user.
 * @param {Object} file The uploaded file object (from multer).
 * @returns {Promise<Object>} A promise that resolves with the saved document metadata.
 */
exports.processAndSaveDocument = async (userId, file) => {
  try {
    logInfo(`Processing and saving document for user: ${userId}`);

    // 1. Upload file to Firebase Storage
    const storagePath = `documents/${userId}/${Date.now()}_${file.originalname}`;
    const fileUpload = storage.bucket().file(storagePath);
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          userId: userId,
        },
      },
    });

    await new Promise((resolve, reject) => {
      blobStream.on('error', reject);
      blobStream.on('finish', resolve);
      blobStream.end(file.buffer);
    });

    const [url] = await fileUpload.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // A far future date
    });

    const gcsUri = `gs://${storage.bucket().name}/${storagePath}`;
    logInfo(`File uploaded to Storage: ${gcsUri}`);

    // 2. Perform OCR using Google Cloud Vision API
    logInfo(`Performing OCR for document: ${gcsUri}`);
    const ocrResult = await visionService.detectText(gcsUri);
    logInfo('OCR result obtained.');

    // 3. Parse OCR result into structured data (Placeholder)
    logInfo('Parsing OCR result (Placeholder)...');
    const parsedData = {
        merchant: 'Extracted Merchant', // Placeholder
        date: new Date(), // Placeholder
        total: 0, // Placeholder
        items: [], // Placeholder
        rawText: ocrResult.fullTextAnnotation ? ocrResult.fullTextAnnotation.text : '',
        confidence: ocrResult.fullTextAnnotation ? ocrResult.fullTextAnnotation.confidence : null,
        // Add more parsed fields and confidence scores
    };
    logInfo('OCR result parsed.');


    // 4. Save document metadata to Firestore
    logInfo(`Saving document metadata to Firestore for user: ${userId}`);
    const documentMetadata = {
      userId: userId,
      storagePath: storagePath,
      gcsUri: gcsUri,
      imageUrl: url, // Signed URL for easy access
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
      ocrResult: ocrResult, // Store raw OCR result
      parsedData: parsedData, // Store parsed data
      classification: { type: 'receipt' }, // Placeholder classification
      status: 'processed', // e.g., 'uploaded', 'processing', 'processed', 'error'
      // Add other relevant metadata
    };

    // Validate document metadata before saving (using Firestore rules validation is also key)
    // const validationErrors = validateDocumentData(documentMetadata); // Assuming a validation utility
    // if (validationErrors) {
    //     logError('Document metadata validation failed:', validationErrors);
    //     // Clean up uploaded file?
    //     throw new AppError('Invalid document data.', 400, validationErrors);
    // }


    const docRef = await documentsCollection.add(documentMetadata);
    logInfo(`Document metadata saved to Firestore with ID: ${docRef.id}`);

    return { id: docRef.id, ...documentMetadata };

  } catch (error) {
    logError(`Error processing and saving document for user ${userId}:`, error);
    // Consider cleaning up the uploaded file in case of processing/saving errors
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to process and save document.', 500, error.message);
  }
};

/**
 * Gets a specific document by ID for a given user.
 * @param {string} userId The ID of the user.
 * @param {string} documentId The ID of the document.
 * @returns {Promise<Object|null>} A promise that resolves with the document data or null if not found.
 */
exports.getDocument = async (userId, documentId) => {
  try {
    logInfo(`Fetching document ${documentId} for user: ${userId}`);
    const doc = await documentsCollection.doc(documentId).get();

    if (!doc.exists || doc.data().userId !== userId) {
      logInfo(`Document ${documentId} not found or does not belong to user ${userId}.`);
      return null;
    }
    logInfo(`Found document: ${documentId}`);
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    logError(`Error getting document ${documentId} for user ${userId}:`, error);
    throw new AppError('Failed to fetch document.', 500, error.message);
  }
};

/**
 * Submits corrections for a receipt document.
 * @param {string} userId The ID of the user.
 * @param {string} documentId The ID of the document to correct.
 * @param {Object} corrections The corrections data.
 * @returns {Promise<Object|null>} A promise that resolves with the updated document data or null if not found.
 */
exports.submitCorrection = async (userId, documentId, corrections) => {
  try {
    logInfo(`Submitting corrections for document ${documentId} by user: ${userId}`);
    const documentRef = documentsCollection.doc(documentId);
    const doc = await documentRef.get();

    if (!doc.exists || doc.data().userId !== userId) {
      logInfo(`Document ${documentId} not found or does not belong to user ${userId}.`);
      return null;
    }

    // Merge corrections into the parsed data or a separate corrections field
    const updatedData = {
      // Assuming corrections directly update fields in parsedData
      parsedData: {
        ...doc.data().parsedData,
        ...corrections,
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Optionally store original parsed data and corrections history
    };

    await documentRef.update(updatedData);
    logInfo(`Corrections submitted for document ${documentId}.`);

    // Fetch the updated document to return the latest data
    const updatedDoc = await documentRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };

  } catch (error) {
    logError(`Error submitting corrections for document ${documentId} by user ${userId}:`, error);
     if (error instanceof AppError) throw error;
    throw new AppError('Failed to submit corrections.', 500, error.message);
  }
};

/**
 * Lists documents for a given user.
 * @param {string} userId The ID of the user.
 * @param {Object} filters Optional filters for the query.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of document data.
 */
exports.listDocuments = async (userId, filters = {}) => {
  try {
    logInfo(`Fetching documents for user: ${userId} with filters:`, filters);
    let query = documentsCollection.where('userId', '==', userId);

    // Apply filters (e.g., by status, classification, date range)
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    if (filters.classificationType) {
        query = query.where('classification.type', '==', filters.classificationType);
    }
    // Add date range filtering if needed

    query = query.orderBy('uploadedAt', 'desc'); // Order by upload date

    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    logInfo(`Found ${documents.length} documents for user: ${userId}`);
    return documents;
  } catch (error) {
    logError(`Error listing documents for user ${userId}:`, error);
    throw new AppError('Failed to fetch documents.', 500, error.message);
  }
};
