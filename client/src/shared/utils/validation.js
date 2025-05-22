/**
 * @desc Validates an email address format.
 * @param {string} email - The email address to validate.
 * @returns {{isValid: boolean, error: string|null}} - Validation result.
 */
export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    error: emailRegex.test(email) ? null : 'Please enter a valid email address',
  };
};

/**
 * @desc Validates a password based on complexity requirements.
 * Requires at least 8 characters, one uppercase, one lowercase, one number, and one special character.
 * @param {string} password - The password to validate.
 * @returns {{isValid: boolean, error: string|null}} - Validation result.
 */
export const validatePassword = password => {
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
    error: errors.length > 0 ? errors.join(', ') : null,
  };
};

/**
 * @desc Validates a phone number format (basic check).
 * @param {string} phoneNumber - The phone number to validate.
 * @returns {boolean} - True if the phone number is valid, false otherwise.
 */
export const validatePhoneNumber = phoneNumber => {
  const re = /^\+?[1-9]\d{1,14}$/; // Basic E.164 format check
  return re.test(phoneNumber);
};

/**
 * @desc Validates a name format (basic check).
 * @param {string} name - The name to validate.
 * @returns {boolean} - True if the name is valid, false otherwise.
 */
export const validateName = name => {
  const re = /^[a-zA-Z ]{2,30}$/; // Allows letters and spaces, 2-30 characters
  return re.test(name);
};

/**
 * @desc Validates an amount field.
 * Checks if the amount is a valid positive number.
 * @param {string|number} amount - The amount to validate.
 * @returns {{isValid: boolean, error: string|null}} - Validation result.
 */
export const validateAmount = amount => {
  if (amount === null || amount === undefined || amount === '') return { isValid: false, error: 'Amount is required' };
  const value = parseFloat(amount);
  if (isNaN(value)) return { isValid: false, error: 'Invalid amount' };
  if (value <= 0) return { isValid: false, error: 'Amount must be greater than 0' };
  return { isValid: true, error: null };
};

/**
 * @desc Validates if a value is present (not null, undefined, or empty string).
 * @param {*} value - The value to validate.
 * @returns {{isValid: boolean, error: string|null}} - Validation result.
 */
export const validateRequired = value => {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return { isValid: false, error: 'This field is required' };
  return { isValid: true, error: null };
};
