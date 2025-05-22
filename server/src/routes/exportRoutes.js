const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth/auth'); // Assuming authentication middleware exists
const exportController = require('../controllers/exportController');
const { validate } = require('../middleware/validation/validation'); // Assuming validation middleware exists

// Apply authentication to all routes
router.use(authenticateUser);

// Export Routes (/api/exports)

// Route to generate a data export file
router.post(
  '/',
  validate({
    body: {
      reportType: { type: 'string', required: true, enum: ['receipts', 'inventory'] }, // Specify allowed report types
      format: { type: 'string', required: true, enum: ['csv', 'pdf', 'json'] }, // Specify allowed formats
      filters: { type: 'object', optional: true } // Allow optional filters
    }
  }),
  exportController.generateExport
);

// Route to download a previously generated export file
router.get(
  '/:id',
  validate({
    params: {
      id: { type: 'string', required: true } // Export ID is required
    }
  }),
  exportController.downloadExport
);

module.exports = router;
