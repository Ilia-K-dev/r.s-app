const express = require('express');
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/auth/auth'); // Assuming auth middleware exists
const upload = require('../../config/multer-config'); // Assuming multer is configured

const router = express.Router();

// Route for uploading documents (receipts, etc.)
// Applying authentication middleware and multer for single file upload
router.post(
  '/upload',
  authenticateToken,
  upload.single('document'), // 'document' should match the field name in FormData
  documentController.uploadDocument
);

// Add other document-related routes here if needed

// Add route for receipt correction
router.put(
  '/correct/:id', // Using PUT for updates to a specific document
  authenticateToken,
  documentController.correctReceipt
);

// Route for fetching documents (receipts, etc.) with filtering and pagination
router.get(
  '/',
  authenticateToken,
  validate({
    query: {
      limit: { type: 'number', required: true },
      startAfter: { type: 'string', optional: true },
      documentType: { type: 'string', optional: true, enum: ['receipt', 'other'] }, // Assuming documentType field
      category: { type: 'string', optional: true }, // Assuming category field
      merchant: { type: 'string', optional: true }, // Assuming merchant field
      startDate: { type: 'date', optional: true }, // Assuming a date field like 'date' or 'receiptDate'
      endDate: { type: 'date', optional: true }
    }
  }),
  documentController.getDocuments // New controller function
);

module.exports = router;
