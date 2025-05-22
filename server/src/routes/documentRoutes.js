const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth/auth'); // Assuming auth middleware location
const upload = require('../config/multer-config'); // Assuming multer configuration for file uploads

// Apply authentication middleware to document routes that require it
// Note: Some routes like upload might have specific middleware order
router.use(authenticate);

// POST /api/documents/upload - Document upload and processing
// Use multer middleware for file upload before the controller
router.post('/upload', upload.single('document'), documentController.uploadDocument);

// GET /api/documents/:id - Get a specific document/receipt
router.get('/:id', documentController.getDocument);

// PUT /api/documents/:id/correct - Submit corrections for a receipt
router.put('/:id/correct', documentController.submitCorrection);

// Add other document-related routes as needed (e.g., list documents)
// GET /api/documents - List documents for a user
router.get('/', documentController.listDocuments);


module.exports = router;
