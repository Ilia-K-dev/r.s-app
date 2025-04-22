"use strict";
const express = require('express');
const { authenticateUser } = require('../middleware/auth/auth'); //good
const reportController = require('../controllers/reportController'); //good
const { validate } = require('../middleware/validation/validation'); //good
const { report: reportValidators } = require('../utils/validation/validators'); //good
const router = express.Router();
router.use(authenticateUser);
router.get('/spending', reportController.getSpendingReport);
module.exports = router;
