"use strict";
const { AppError } = require('../../utils/error/AppError');
const logger = require('../../utils/logger');
const sharp = require('sharp');
// Constants for validation
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/heic',
    'image/heif',
    'application/pdf'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_IMAGE_DIMENSIONS = { width: 500, height: 500 };
const MAX_IMAGE_DIMENSIONS = { width: 5000, height: 5000 };
class DocumentValidation {
    static validateFileUpload(req, res, next) {
        try {
            if (!req.file && !req.files) {
                throw new AppError('No file uploaded', 400);
            }
            const files = req.files || [req.file];
            files.forEach(file => {
                // Check file presence
                if (!file.buffer || !file.originalname) {
                    throw new AppError('Invalid file upload', 400);
                }
                // Validate mime type
                if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    throw new AppError(`Invalid file type. Allowed types are: ${ALLOWED_MIME_TYPES.join(', ')}`, 400);
                }
                // Validate file size
                if (file.size > MAX_FILE_SIZE) {
                    throw new AppError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`, 400);
                }
                // Store validation result in request object
                file.validationResult = {
                    isValid: true,
                    timestamp: new Date().toISOString(),
                    validatedBy: 'DocumentValidation.validateFileUpload'
                };
            });
            logger.info('File validation completed successfully', {
                fileCount: files.length,
                filesInfo: files.map(f => ({
                    name: f.originalname,
                    size: f.size,
                    type: f.mimetype
                }))
            });
            next();
        }
        catch (error) {
            logger.error('File validation error:', {
                error: error.message,
                stack: error.stack,
                files: req.files ? req.files.map(f => f.originalname) : req.file?.originalname
            });
            next(error);
        }
    }
    static async validateImageDimensions(req, res, next) {
        try {
            const files = req.files || [req.file];
            await Promise.all(files.map(async (file) => {
                if (file.mimetype.startsWith('image/')) {
                    const metadata = await sharp(file.buffer).metadata();
                    // Enhanced dimension validation with detailed error messages
                    if (metadata.width < MIN_IMAGE_DIMENSIONS.width ||
                        metadata.height < MIN_IMAGE_DIMENSIONS.height) {
                        throw new AppError(`Image dimensions too small. Minimum dimensions are ${MIN_IMAGE_DIMENSIONS.width}x${MIN_IMAGE_DIMENSIONS.height}. ` +
                            `Provided dimensions: ${metadata.width}x${metadata.height}`, 400);
                    }
                    if (metadata.width > MAX_IMAGE_DIMENSIONS.width ||
                        metadata.height > MAX_IMAGE_DIMENSIONS.height) {
                        throw new AppError(`Image dimensions too large. Maximum dimensions are ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height}. ` +
                            `Provided dimensions: ${metadata.width}x${metadata.height}`, 400);
                    }
                    // Store enhanced metadata in request object
                    file.imageMetadata = {
                        ...metadata,
                        aspectRatio: metadata.width / metadata.height,
                        validationTimestamp: new Date().toISOString()
                    };
                    logger.info('Image dimensions validated successfully', {
                        filename: file.originalname,
                        dimensions: `${metadata.width}x${metadata.height}`,
                        format: metadata.format
                    });
                }
            }));
            next();
        }
        catch (error) {
            logger.error('Image dimension validation error:', {
                error: error.message,
                stack: error.stack,
                files: req.files ? req.files.map(f => f.originalname) : req.file?.originalname
            });
            next(error);
        }
    }
    static validateProcessingOptions(req, res, next) {
        try {
            const options = req.body.processingOptions || {};
            const validationErrors = [];
            // Enhanced validation for processing options
            if (options.enhance) {
                const { contrast, brightness, sharpness } = options.enhance;
                if (typeof contrast === 'number' && (contrast < 0 || contrast > 2)) {
                    validationErrors.push('Contrast value must be between 0 and 2');
                }
                if (typeof brightness === 'number' && (brightness < 0 || brightness > 2)) {
                    validationErrors.push('Brightness value must be between 0 and 2');
                }
                if (typeof sharpness === 'number' && (sharpness < 0 || sharpness > 2)) {
                    validationErrors.push('Sharpness value must be between 0 and 2');
                }
            }
            if (options.resize) {
                const { width, height } = options.resize;
                if (width && (width < MIN_IMAGE_DIMENSIONS.width || width > MAX_IMAGE_DIMENSIONS.width)) {
                    validationErrors.push(`Invalid resize width. Must be between ${MIN_IMAGE_DIMENSIONS.width} and ${MAX_IMAGE_DIMENSIONS.width}`);
                }
                if (height && (height < MIN_IMAGE_DIMENSIONS.height || height > MAX_IMAGE_DIMENSIONS.height)) {
                    validationErrors.push(`Invalid resize height. Must be between ${MIN_IMAGE_DIMENSIONS.height} and ${MAX_IMAGE_DIMENSIONS.height}`);
                }
            }
            if (validationErrors.length > 0) {
                throw new AppError(`Invalid processing options: ${validationErrors.join('; ')}`, 400);
            }
            // Store validated options with metadata
            req.validatedOptions = {
                ...options,
                timestamp: new Date().toISOString(),
                validationMetadata: {
                    validatedFields: Object.keys(options),
                    originalOptions: { ...options }
                }
            };
            logger.info('Processing options validated successfully', {
                options: req.validatedOptions
            });
            next();
        }
        catch (error) {
            logger.error('Processing options validation error:', {
                error: error.message,
                stack: error.stack,
                providedOptions: req.body.processingOptions
            });
            next(error);
        }
    }
    static validateBatchProcessing(req, res, next) {
        try {
            // Enhanced batch validation
            if (!req.files) {
                throw new AppError('No files provided for batch processing', 400);
            }
            if (req.files.length === 0) {
                throw new AppError('Empty batch: no files to process', 400);
            }
            if (req.files.length > 10) {
                throw new AppError(`Maximum batch size is 10 files. Received: ${req.files.length}`, 400);
            }
            const totalSize = req.files.reduce((sum, file) => sum + file.size, 0);
            const maxBatchSize = MAX_FILE_SIZE * 2;
            if (totalSize > maxBatchSize) {
                throw new AppError(`Total batch size too large. Maximum is ${maxBatchSize / 1024 / 1024}MB. ` +
                    `Current batch size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`, 400);
            }
            // Store batch validation metadata
            req.batchValidation = {
                timestamp: new Date().toISOString(),
                fileCount: req.files.length,
                totalSize: totalSize,
                files: req.files.map(file => ({
                    name: file.originalname,
                    size: file.size,
                    type: file.mimetype
                }))
            };
            logger.info('Batch validation completed successfully', req.batchValidation);
            next();
        }
        catch (error) {
            logger.error('Batch validation error:', {
                error: error.message,
                stack: error.stack,
                batchInfo: req.files ? {
                    fileCount: req.files.length,
                    totalSize: req.files.reduce((sum, file) => sum + file.size, 0)
                } : null
            });
            next(error);
        }
    }
    static getValidationMiddleware(options = {}) {
        const middleware = [this.validateFileUpload];
        if (options.validateDimensions) {
            middleware.push(this.validateImageDimensions);
        }
        if (options.validateOptions) {
            middleware.push(this.validateProcessingOptions);
        }
        if (options.validateBatch) {
            middleware.push(this.validateBatchProcessing);
        }
        // Add logging for middleware chain creation
        logger.info('Created validation middleware chain', {
            enabledValidations: Object.keys(options).filter(key => options[key]),
            middlewareCount: middleware.length
        });
        return middleware;
    }
}
module.exports = DocumentValidation;
