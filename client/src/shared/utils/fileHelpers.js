// src/shared/utils/fileHelpers.js

import { logger } from './logger';

/**
 * Formats file size into human-readable format
 */
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Validates file type against allowed types
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file || !allowedTypes) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Gets file extension from filename
 */
export const getFileExtension = filename => filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);

/**
 * Creates an object URL for file preview
 */
export const createFilePreview = file => {
  try {
    return URL.createObjectURL(file);
  } catch (error) {
    logger.error('Error creating file preview:', error);
    return null;
  }
};

/**
 * Revokes an object URL to prevent memory leaks
 */
export const revokeFilePreview = previewUrl => {
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
};

/**
 * Validates file size against maximum allowed size
 */
export const validateFileSize = (file, maxSize) => file.size <= maxSize;

/**
 * Comprehensive file validation
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // Default 5MB
    acceptedTypes = ['image/jpeg', 'image/png', 'image/heic'],
    minDimensions = { width: 500, height: 500 },
    maxDimensions = { width: 5000, height: 5000 },
  } = options;

  const errors = [];

  // Check file presence
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }

  // Check file size
  if (!validateFileSize(file, maxSize)) {
    errors.push(`File size must not exceed ${formatFileSize(maxSize)}`);
  }

  // Check file type
  if (!validateFileType(file, acceptedTypes)) {
    errors.push(`File type must be one of: ${acceptedTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Reads file as Data URL
 */
export const readFileAsDataUrl = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
