import { RECEIPT_CONFIG } from '../../../core/config/constants';//correct

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    error: emailRegex.test(email) ? null : 'Please enter a valid email address'
  };
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateReceipt = (receipt) => {
  const errors = {};

  // Required fields
  if (!receipt.merchant?.trim()) {
    errors.merchant = 'Merchant name is required';
  }

  if (!receipt.date) {
    errors.date = 'Date is required';
  } else if (isNaN(new Date(receipt.date).getTime())) {
    errors.date = 'Invalid date format';
  }

  if (!receipt.total) {
    errors.total = 'Total amount is required';
  } else if (isNaN(parseFloat(receipt.total))) {
    errors.total = 'Total must be a valid number';
  } else if (parseFloat(receipt.total) <= 0) {
    errors.total = 'Total must be greater than 0';
  }

  // Validate items if present
  if (receipt.items && Array.isArray(receipt.items)) {
    const itemErrors = receipt.items.map(item => {
      const itemError = {};
      
      if (!item.name?.trim()) {
        itemError.name = 'Item name is required';
      }
      
      if (!item.price) {
        itemError.price = 'Price is required';
      } else if (isNaN(parseFloat(item.price))) {
        itemError.price = 'Price must be a valid number';
      } else if (parseFloat(item.price) <= 0) {
        itemError.price = 'Price must be greater than 0';
      }

      if (!item.quantity) {
        itemError.quantity = 'Quantity is required';
      } else if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
        itemError.quantity = 'Quantity must be a positive whole number';
      }

      return Object.keys(itemError).length > 0 ? itemError : null;
    });

    if (itemErrors.some(error => error !== null)) {
      errors.items = itemErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateFile = (file) => {
  const errors = [];

  if (!file) {
    errors.push('Please select a file');
    return {
      isValid: false,
      errors
    };
  }

  // Check file size
  if (file.size > RECEIPT_CONFIG.maxFileSize) {
    errors.push(`File size must not exceed ${RECEIPT_CONFIG.maxFileSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!RECEIPT_CONFIG.allowedFileTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${RECEIPT_CONFIG.allowedFileTypes.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDateRange = (startDate, endDate) => {
  const errors = {};

  if (!startDate) {
    errors.startDate = 'Start date is required';
  }

  if (!endDate) {
    errors.endDate = 'End date is required';
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.endDate = 'End date must be after start date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateCategory = (category) => {
  const errors = {};

  if (!category.name?.trim()) {
    errors.name = 'Category name is required';
  }

  if (category.budget && (isNaN(parseFloat(category.budget)) || parseFloat(category.budget) < 0)) {
    errors.budget = 'Budget must be a positive number';
  }

  if (category.color && !/^#[0-9A-Fa-f]{6}$/.test(category.color)) {
    errors.color = 'Invalid color format (must be hex color)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateForm = (values, schema) => {
  const errors = {};

  Object.keys(schema).forEach(key => {
    const rules = schema[key];
    const value = values[key];

    // Required check
    if (rules.required && !value) {
      errors[key] = rules.required === true ? 'This field is required' : rules.required;
      return;
    }

    // Type checks
    if (value) {
      if (rules.type === 'email' && !validateEmail(value).isValid) {
        errors[key] = 'Invalid email address';
      } else if (rules.type === 'number' && isNaN(Number(value))) {
        errors[key] = 'Must be a number';
      }
    }

    // Custom validation
    if (rules.validate) {
      const error = rules.validate(value, values);
      if (error) {
        errors[key] = error;
      }
    }

    // Min/Max length
    if (rules.minLength && value.length < rules.minLength) {
      errors[key] = `Must be at least ${rules.minLength} characters`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[key] = `Must be no more than ${rules.maxLength} characters`;
    }

    // Pattern match
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[key] = rules.patternError || 'Invalid format';
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
