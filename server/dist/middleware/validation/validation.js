"use strict";
// middleware/validation/validation.js
const { validationResult } = require('express-validator');
const { AppError } = require('../../utils/error/errorHandler');
const logger = require('../../utils/logger');
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            if (typeof schema === 'function') {
                await schema(req, res, next);
                return;
            }
            if (Array.isArray(schema)) {
                await Promise.all(schema.map(validation => validation.run(req)));
            }
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map(error => error.msg);
                throw new AppError(errorMessages[0], 400);
            }
            next();
        }
        catch (error) {
            logger.error('Validation error:', error);
            next(new AppError(error.message, 400));
        }
    };
};
module.exports = {
    validate
};
