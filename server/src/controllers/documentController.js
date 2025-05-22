const documentService = require('../services/document/documentService'); // Assuming service location
const { handleError } = require('../utils/errorHandler'); // Assuming error handler utility
const { logInfo } = require('../utils/logger'); // Assuming logger utility
const DocumentProcessingOrchestrator = require('../services/orchestration/DocumentProcessingOrchestrator'); // Import the orchestrator

// POST /api/documents/upload - Document upload and processing
exports.uploadDocument = async (req, res) => {
  try {
    const userId = req.user.uid; // Assuming user ID is available from authentication middleware
    const file = req.file; // Assuming multer has processed the file upload
    logInfo(`User ${userId} attempting to upload document.`);

    if (!file) {
      throw new AppError('No file uploaded.', 400);
    }

    // Use the orchestrator to process the document
    const orchestrator = new DocumentProcessingOrchestrator();
    // Note: The orchestrator's processDocument method in the work plan
    // takes documentId and userId. The upload process here provides a file.
    // We need to adapt this. The orchestrator should likely take the file
    // and handle saving the document to get an ID before processing.
    // Let's adjust the orchestrator usage based on the upload flow.

    // Re-evaluating the orchestrator's processDocument signature in the work plan:
    // `async processDocument(documentId, userId)`
    // This suggests the document is already saved and has an ID before orchestration.
    // The current `uploadDocument` saves the document *during* processing via `documentService.processAndSaveDocument`.

    // To align with the orchestrator's signature, the upload process should
    // first save the raw document (maybe just the file info and user ID)
    // to get a documentId, and *then* call the orchestrator with that ID.

    // This requires modifying the upload flow significantly.
    // Let's stick closer to the work plan's instruction to use the orchestrator
    // in the controller, but acknowledge the mismatch in function signatures
    // and the need for further refactoring of the upload flow later.

    // For now, let's assume the orchestrator will be adapted to take the file
    // directly for the initial processing step, or that a preceding step
    // saves the document and provides an ID.

    // Let's modify the controller to call the orchestrator, assuming the orchestrator
    // will handle the initial save and subsequent processing.
    // We'll need to pass the file and userId to the orchestrator.

    const orchestrator = new DocumentProcessingOrchestrator();
    // Assuming the orchestrator will have a method like `processUploadedDocument`
    // that takes the file and userId and returns the processed document data.
    // The work plan snippet showed `orchestrator.processDocument(req.params.documentId, req.user.uid);`
    // which doesn't fit the upload flow.

    // Let's use a placeholder call to the orchestrator for now, reflecting the *intent*
    // of using it for processing, and mark this for future refinement based on the
    // actual orchestrator implementation and upload flow.

    // Placeholder call:
    // const documentData = await orchestrator.processDocument(file, userId); // This signature doesn't match work plan

    // Let's go back to the work plan's snippet for the controller update:
    // const processDocument = async (req, res) => { ... orchestrator.processDocument(req.params.documentId, req.user.uid); ... }
    // This snippet seems to be for a *different* route or function, perhaps one that
    // triggers processing for an *already uploaded* document, identified by ID in params.

    // The current controller has `uploadDocument`. The work plan's snippet
    // for the controller update doesn't seem to apply directly to `uploadDocument`.

    // Let's re-read the work plan for Task 2.3 to ensure I haven't missed anything.
    // "Update controller to use orchestrator // File: server/src/controllers/documentController.js"
    // The snippet provided is:
    // const processDocument = async (req, res) => {
    //   try {
    //     const orchestrator = new DocumentProcessingOrchestrator();
    //     const result = await orchestrator.processDocument(
    //       req.params.documentId,
    //       req.user.uid
    //     );
    //     res.json(result);
    //   } catch (error) {
    //     next(error);
    //   }
    // };
    // This snippet defines a *new* function `processDocument` and uses `req.params.documentId`.
    // This suggests the work plan intends to add a *new route/function* for processing
    // an already uploaded document, rather than modifying the `uploadDocument` function.

    // Okay, new plan: Add the `processDocument` function as shown in the work plan
    // to the `server/src/controllers/documentController.js` file. This function
    // will be responsible for triggering orchestration for a document given its ID.

    // I will insert this new function after the existing `uploadDocument` function.

    const documentData = await documentService.processAndSaveDocument(userId, file);
    res.status(201).json(documentData);

  } catch (error) {
    handleError(res, error);
  }
};

// Add the new processDocument function from the work plan snippet
const processDocument = async (req, res, next) => { // Added `next` as it's used in the snippet
  try {
    const orchestrator = new DocumentProcessingOrchestrator();
    const result = await orchestrator.processDocument(
      req.params.documentId,
      req.user.uid
    );
    res.json(result);
  } catch (error) {
    next(error); // Use `next` to pass error to error handling middleware
  }
};

// Need to export this new function if it's intended to be a route handler
// Assuming it will be used as a route handler:
// exports.processDocument = processDocument; // Add this export later if confirmed as route

// Keep existing functions below
// GET /api/documents/:id - Get a specific document/receipt
exports.getDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const documentId = req.params.id;
    logInfo(`User ${userId} requesting document: ${documentId}`);
    const document = await documentService.getDocument(userId, documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }
    res.status(200).json(document);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/documents/:id/correct - Submit corrections for a receipt
exports.submitCorrection = async (req, res) => {
  try {
    const userId = req.user.uid;
    const documentId = req.params.id;
    const corrections = req.body; // Assuming corrections data is in the request body
    logInfo(`User ${userId} submitting corrections for document ${documentId}:`, corrections);
    const updatedDocument = await documentService.submitCorrection(userId, documentId, corrections);
     if (!updatedDocument) {
      return res.status(404).json({ message: 'Document not found or unauthorized.' });
    }
    res.status(200).json(updatedDocument);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/documents - List documents for a user
exports.listDocuments = async (req, res) => {
  try {
    const userId = req.user.uid;
    // Add filtering/pagination options from req.query if needed
    logInfo(`User ${userId} requesting document list.`);
    const documents = await documentService.listDocuments(userId, req.query);
    res.status(200).json(documents);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/documents/:id - Get a specific document/receipt
exports.getDocument = async (req, res) => {
  try {
    const userId = req.user.uid;
    const documentId = req.params.id;
    logInfo(`User ${userId} requesting document: ${documentId}`);
    const document = await documentService.getDocument(userId, documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found.' });
    }
    res.status(200).json(document);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT /api/documents/:id/correct - Submit corrections for a receipt
exports.submitCorrection = async (req, res) => {
  try {
    const userId = req.user.uid;
    const documentId = req.params.id;
    const corrections = req.body; // Assuming corrections data is in the request body
    logInfo(`User ${userId} submitting corrections for document ${documentId}:`, corrections);
    const updatedDocument = await documentService.submitCorrection(userId, documentId, corrections);
     if (!updatedDocument) {
      return res.status(404).json({ message: 'Document not found or unauthorized.' });
    }
    res.status(200).json(updatedDocument);
  } catch (error) {
    handleError(res, error);
  }
};

// GET /api/documents - List documents for a user
exports.listDocuments = async (req, res) => {
  try {
    const userId = req.user.uid;
    // Add filtering/pagination options from req.query if needed
    logInfo(`User ${userId} requesting document list.`);
    const documents = await documentService.listDocuments(userId, req.query);
    res.status(200).json(documents);
  } catch (error) {
    handleError(res, error);
  }
};
