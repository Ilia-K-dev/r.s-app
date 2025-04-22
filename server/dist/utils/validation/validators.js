"use strict";
const { body, param, query } = require('express-validator');
const { AppError } = require('../../utils/error/AppError'); //good 
const validateReceipt = {
    file: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/heic']
    }
};
const validators = {
    receipt: {
        create: [
            body('merchant').trim().notEmpty().withMessage('Merchant name is required'),
            body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number'),
            body('date').isISO8601().withMessage('Invalid date format'),
            body('category').trim().notEmpty().withMessage('Category is required'),
            body('items').isArray().withMessage('Items must be an array'),
            body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
            body('items.*.price').isFloat({ min: 0 }).withMessage('Item price must be a positive number'),
            body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1')
        ],
        update: [
            param('id').notEmpty().withMessage('Receipt ID is required'),
            body('merchant').optional().trim().notEmpty().withMessage('Merchant name cannot be empty'),
            body('total').optional().isFloat({ min: 0 }).withMessage('Total must be a positive number'),
            body('date').optional().isISO8601().withMessage('Invalid date format'),
            body('category').optional().trim().notEmpty().withMessage('Category cannot be empty')
        ],
        list: [
            query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
            query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
            query('category').optional().trim(),
            query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
        ]
    },
    category: {
        create: [
            body('name').trim().notEmpty().withMessage('Category name is required'),
            body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color format'),
            body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number')
        ]
    }
};
const validateUpload = (req, res, next) => {
    if (!req.file) {
        throw new AppError('No file uploaded', 400);
    }
    // Add file validation logic if necessary
    next();
};
module.exports = validators;
