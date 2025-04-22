"use strict";
const { body, param, query } = require('express-validator');
const { AppError } = require('../../utils/error/AppError'); //good
class ValidationService {
    constructor() {
        // Common validators that can be reused across different models
        this.commonValidators = {
            pagination: [
                query('page')
                    .optional()
                    .isInt({ min: 1 })
                    .withMessage('Page must be a positive integer'),
                query('limit')
                    .optional()
                    .isInt({ min: 1, max: 100 })
                    .withMessage('Limit must be between 1 and 100')
            ],
            dateRange: [
                query('startDate')
                    .optional()
                    .matches(this.patterns.date)
                    .withMessage('Invalid start date format (YYYY-MM-DD)'),
                query('endDate')
                    .optional()
                    .matches(this.patterns.date)
                    .withMessage('Invalid end date format (YYYY-MM-DD)')
                    .custom((endDate, { req }) => {
                    if (req.query.startDate && endDate < req.query.startDate) {
                        throw new Error('End date must be after start date');
                    }
                    return true;
                })
            ],
            sorting: [
                query('sortBy')
                    .optional()
                    .isString()
                    .withMessage('Invalid sort field'),
                query('sortOrder')
                    .optional()
                    .isIn(['asc', 'desc'])
                    .withMessage('Sort order must be either "asc" or "desc"')
            ]
        };
        this.validators = {
            auth: this._createAuthValidators(),
            receipt: this._createReceiptValidators(),
            product: this._createProductValidators(),
            category: this._createCategoryValidators(),
            inventory: this._createInventoryValidators()
        };
        // Common validation patterns
        this.patterns = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            phone: /^\+?[\d\s-]{10,}$/,
            date: /^\d{4}-\d{2}-\d{2}$/,
            price: /^\d+(\.\d{1,2})?$/
        };
    }
    // Authentication Validators
    _createAuthValidators() {
        return {
            register: [
                body('email')
                    .trim()
                    .isEmail()
                    .withMessage('Valid email is required')
                    .matches(this.patterns.email)
                    .withMessage('Invalid email format'),
                body('password')
                    .isLength({ min: 8 })
                    .withMessage('Password must be at least 8 characters')
                    .matches(this.patterns.password)
                    .withMessage('Password must contain letters and numbers'),
                body('name')
                    .optional()
                    .trim()
                    .isLength({ min: 2 })
                    .withMessage('Name must be at least 2 characters')
            ],
            login: [
                body('email').trim().isEmail().withMessage('Valid email is required'),
                body('password').notEmpty().withMessage('Password is required')
            ]
        };
    }
    // Receipt Validators
    _createReceiptValidators() {
        return {
            create: [
                body('merchant').trim().notEmpty().withMessage('Merchant name is required'),
                body('date').matches(this.patterns.date).withMessage('Invalid date format'),
                body('total')
                    .matches(this.patterns.price)
                    .withMessage('Invalid total amount'),
                body('items').isArray().withMessage('Items must be an array'),
                body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
                body('items.*.price')
                    .matches(this.patterns.price)
                    .withMessage('Invalid item price'),
                body('items.*.quantity')
                    .isInt({ min: 1 })
                    .withMessage('Invalid quantity')
            ],
            update: [
                param('id').isString().withMessage('Invalid receipt ID'),
                body('merchant').optional().trim().notEmpty(),
                body('date').optional().matches(this.patterns.date),
                body('total').optional().matches(this.patterns.price),
                body('items').optional().isArray()
            ]
        };
    }
    // Product Validators
    _createProductValidators() {
        return {
            create: [
                body('name').trim().notEmpty().withMessage('Product name is required'),
                body('category').trim().notEmpty().withMessage('Category is required'),
                body('sku').optional().trim().isLength({ min: 3 }),
                body('price')
                    .matches(this.patterns.price)
                    .withMessage('Invalid price format'),
                body('minStockLevel')
                    .optional()
                    .isInt({ min: 0 })
                    .withMessage('Minimum stock level must be non-negative'),
                body('reorderPoint')
                    .optional()
                    .isInt({ min: 0 })
                    .withMessage('Reorder point must be non-negative'),
                body('unit')
                    .optional()
                    .isIn(['piece', 'kg', 'g', 'l', 'ml'])
                    .withMessage('Invalid unit')
            ],
            update: [
                param('id').isString().withMessage('Invalid product ID'),
                body('name').optional().trim().notEmpty(),
                body('category').optional().trim().notEmpty(),
                body('price').optional().matches(this.patterns.price),
                body('minStockLevel').optional().isInt({ min: 0 }),
                body('reorderPoint').optional().isInt({ min: 0 })
            ]
        };
    }
    // Category Validators
    _createCategoryValidators() {
        return {
            create: [
                body('name')
                    .trim()
                    .notEmpty()
                    .withMessage('Category name is required')
                    .isLength({ min: 2, max: 50 })
                    .withMessage('Category name must be between 2 and 50 characters'),
                body('description')
                    .optional()
                    .trim()
                    .isLength({ max: 200 })
                    .withMessage('Description must not exceed 200 characters'),
                body('color')
                    .optional()
                    .matches(/^#[0-9A-Fa-f]{6}$/)
                    .withMessage('Invalid color format (use hex format: #RRGGBB)'),
                body('budget')
                    .optional()
                    .isFloat({ min: 0 })
                    .withMessage('Budget must be a positive number')
            ],
            update: [
                param('id').isString().withMessage('Invalid category ID'),
                body('name').optional().trim().isLength({ min: 2, max: 50 }),
                body('description').optional().trim().isLength({ max: 200 }),
                body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
                body('budget').optional().isFloat({ min: 0 })
            ]
        };
    }
    // Inventory Validators
    _createInventoryValidators() {
        return {
            stockUpdate: [
                body('quantity')
                    .isInt()
                    .withMessage('Quantity must be a whole number'),
                body('type')
                    .isIn(['add', 'remove', 'adjust'])
                    .withMessage('Invalid stock update type'),
                body('reason')
                    .trim()
                    .notEmpty()
                    .withMessage('Reason is required'),
                body('location')
                    .optional()
                    .trim()
                    .notEmpty()
                    .withMessage('Location cannot be empty if provided')
            ],
            transfer: [
                body('sourceLocation')
                    .trim()
                    .notEmpty()
                    .withMessage('Source location is required'),
                body('destinationLocation')
                    .trim()
                    .notEmpty()
                    .withMessage('Destination location is required'),
                body('quantity')
                    .isInt({ min: 1 })
                    .withMessage('Quantity must be a positive integer')
            ]
        };
    }
    // Utility methods for custom validation
    validateEmail(email) {
        return this.patterns.email.test(email);
    }
    validatePassword(password) {
        return this.patterns.password.test(password);
    }
    validatePrice(price) {
        return this.patterns.price.test(price);
    }
    validateDate(date) {
        return this.patterns.date.test(date);
    }
    // Model validation methods
    validateReceiptData(data) {
        const errors = [];
        // Required fields
        if (!data.merchant)
            errors.push('Merchant name is required');
        if (!data.date)
            errors.push('Date is required');
        if (!data.total)
            errors.push('Total amount is required');
        // Validate items if present
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach((item, index) => {
                if (!item.name)
                    errors.push(`Item ${index + 1}: Name is required`);
                if (!this.validatePrice(item.price.toString())) {
                    errors.push(`Item ${index + 1}: Invalid price format`);
                }
                if (!Number.isInteger(item.quantity) || item.quantity < 1) {
                    errors.push(`Item ${index + 1}: Invalid quantity`);
                }
            });
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateProductData(data) {
        const errors = [];
        // Required fields
        if (!data.name)
            errors.push('Product name is required');
        if (!data.category)
            errors.push('Category is required');
        if (!this.validatePrice(data.price.toString())) {
            errors.push('Invalid price format');
        }
        // Optional fields validation
        if (data.minStockLevel !== undefined && data.minStockLevel < 0) {
            errors.push('Minimum stock level must be non-negative');
        }
        if (data.reorderPoint !== undefined && data.reorderPoint < 0) {
            errors.push('Reorder point must be non-negative');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // Middleware to validate request data
    validate(schema) {
        return async (req, res, next) => {
            try {
                await Promise.all(schema.map(validation => validation.run(req)));
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    throw new AppError(errors.array()[0].msg, 400);
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
}
module.exports = new ValidationService();
