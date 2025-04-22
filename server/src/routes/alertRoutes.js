const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController'); #good
const { authenticateUser } = require('../middleware/auth/auth'); #good
const { validate } = require('../middleware/validation/validation'); #good

// Apply authentication to all routes
router.use(authenticateUser);

// Create alert
router.post('/',
  validate({
    body: {
      type: { type: 'string', required: true },
      message: { type: 'string', required: true },
      priority: { type: 'string', optional: true },
      metadata: { type: 'object', optional: true }
    }
  }),
  alertController.createAlert
);

// Get alerts
router.get('/',
  validate({
    query: {
      priority: { type: 'string', optional: true },
      category: { type: 'string', optional: true },
      status: { type: 'string', optional: true }
    }
  }),
  alertController.getAlerts
);

// Resolve alert
router.post('/:id/resolve',
  validate({
    params: {
      id: { type: 'string', required: true }
    },
    body: {
      resolution: { type: 'string', required: true }
    }
  }),
  alertController.resolveAlert
);

// Update preferences
router.put('/preferences',
  validate({
    body: {
      email: { type: 'boolean', optional: true },
      push: { type: 'boolean', optional: true },
      sms: { type: 'boolean', optional: true },
      categories: { type: 'array', optional: true }
    }
  }),
  alertController.updateAlertPreferences
);

// Get alert history
router.get('/history',
  validate({
    query: {
      startDate: { type: 'date', optional: true },
      endDate: { type: 'date', optional: true },
      type: { type: 'string', optional: true }
    }
  }),
  alertController.getAlertHistory
);

module.exports = router;