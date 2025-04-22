export const validateFile = (file, options = {}) => {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      acceptedTypes = ['image/jpeg', 'image/png', 'image/heic'],
      minDimensions = { width: 500, height: 500 },
      maxDimensions = { width: 5000, height: 5000 }
    } = options;
  
    const errors = [];
  
    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must not exceed ${maxSize / (1024 * 1024)}MB`);
    }
  
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      errors.push(`File type must be one of: ${acceptedTypes.join(', ')}`);
    }
  
    // Return validation result
    return {
      isValid: errors.length === 0,
      errors
    };
  };