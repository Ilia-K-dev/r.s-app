"use strict";
// authRoutes.js - Authentication routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validation/validation');
const { validateAuth } = require('../utils/validation/validators');
// Define authController functions as middleware
const authMiddleware = {
    register: authController.register.bind(authController),
    login: authController.login.bind(authController),
    verifyToken: authController.verifyToken.bind(authController)
};
router.post('/register', authMiddleware.register);
router.post('/login', authMiddleware.login);
router.post('/verify-token', authMiddleware.verifyToken);
module.exports = router;
