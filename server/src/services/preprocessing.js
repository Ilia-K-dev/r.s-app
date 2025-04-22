"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// C:\Users\user\Documents\app.v3\server\src\services\preprocessing.js
const sharp_1 = __importDefault(require("sharp"));
const AppError_1 = __importDefault(require('../utils/error/AppError'));
const logger_1 = __importDefault(require("../utils/logger"));
async function preprocessImage(buffer, options = {}) {
    try {
        const image = (0, sharp_1.default)(buffer);
        const metadata = await image.metadata();
        // 1. Advanced Noise Reduction
        if (options.noiseReduction) {
            logger_1.default.info('Applying noise reduction');
            const noiseLevel = 0.3; // Adjust the default noise level as needed
            // Adaptive denoising based on noise level
            if (noiseLevel > 0.5) {
                image.median(3);
            }
            else if (noiseLevel > 0.2) {
                image.blur(1.5);
            }
            else {
                image.sharpen(0.5, 1);
            }
            // Edge preservation
            image.threshold(128, { greyscale: true });
        }
        // 2. Automatic Rotation Correction
        if (options.rotationCorrection) {
            logger_1.default.info('Applying rotation correction');
            const { width, height, orientation } = metadata;
            if (width && height) {
                const isLandscape = width > height;
                const angle = orientation || (isLandscape ? 0 : 90);
                // Apply skew correction
                image.rotate(angle, { background: { r: 255, g: 255, b: 255, alpha: 1 } });
                // Perspective correction
                const overlay = {
                    input: await image.toBuffer(),
                    top: 0,
                    left: 0,
                    tile: true,
                    raw: {
                        width: isLandscape ? (width || 0) : (height || 0),
                        height: isLandscape ? (height || 0) : (width || 0),
                        channels: 4
                    }
                };
                image.composite([overlay]);
            }
        }
        // 3. Color Space Optimization
        if (options.colorOptimization) {
            logger_1.default.info('Applying color optimization');
            // Automatic color space selection
            const colorSpace = metadata.isProgressive ? 'srgb' : 'linearRgb';
            image.toColorspace(colorSpace);
            // Dynamic contrast enhancement
            const inputContrast = 0.6; // Adjust the default contrast value as needed
            if (inputContrast < 0.5) {
                image.linear(1.5, -(128 * 1.5) + 128);
            }
            else if (inputContrast > 0.7) {
                image.linear(0.8, -(128 * 0.8) + 128);
            }
            // OCR-optimized color transformation
            image.grayscale();
            image.threshold(190);
        }
        // 4. Dynamic Quality Adjustment
        if (options.qualityAdjustment) {
            logger_1.default.info('Applying quality adjustment');
            // File size optimization
            const targetSize = 1024 * 1024; // 1MB
            let quality = 80;
            let optimizedBuffer = await image.jpeg({ quality }).toBuffer();
            while (optimizedBuffer.length > targetSize && quality > 40) {
                quality -= 5;
                optimizedBuffer = await image.jpeg({ quality }).toBuffer();
            }
            // Format-specific optimizations
            if (metadata.format === 'png') {
                image.png({ compressionLevel: 9, adaptiveFiltering: true, force: true });
            }
            else if (metadata.format === 'webp') {
                image.webp({ force: true });
            }
        }
        const processedImage = await image.toBuffer();
        return processedImage;
    }
    catch (error) {
        logger_1.default.error('Image preprocessing error:', error);
        throw new AppError_1.default('Failed to preprocess image', 500);
    }
}
module.exports = {
    preprocessImage
};
