import { format, parseISO, isValid } from 'date-fns'; //correct

// ===============================
// Currency Formatting Functions
// ===============================

/**
 * Formats a number as currency with proper symbol and decimal places
 * @param {number|string} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Cleans and validates currency input, ensuring proper decimal format
 * @param {string} value - The input value to parse
 * @returns {string} Cleaned currency string
 */
export const parseCurrencyInput = value => {
  // Remove all non-digit characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts[1];
  }

  // Limit to 2 decimal places
  if (parts.length === 2) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }

  return cleanValue;
};

/**
 * Calculates total from an array of items with amount properties
 * @param {Array} items - Array of items with amount property
 * @returns {number} Total sum
 */
export const calculateTotal = (items = []) => items.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    return sum + amount;
  }, 0);

/**
 * Calculates tax amount based on amount and tax rate
 * @param {number} amount - Base amount
 * @param {number} taxRate - Tax rate percentage
 * @returns {number} Tax amount
 */
export const calculateTax = (amount, taxRate = 0) => amount * (taxRate / 100);

/**
 * Rounds a number to two decimal places
 * @param {number} number - Number to round
 * @returns {number} Rounded number
 */
export const roundToTwoDecimals = number => Math.round((number + Number.EPSILON) * 100) / 100;

// ===============================
// Date Formatting Functions
// ===============================

/**
 * Formats a date into a readable string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';

  return format(parsedDate, formatStr);
};

/**
 * Formats a date range into a readable string
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date range
 */
export const formatDateRange = (startDate, endDate, formatStr = 'MMM dd, yyyy') => `${formatDate(startDate, formatStr)} - ${formatDate(endDate, formatStr)}`;

// ===============================
// Number Formatting Functions
// ===============================

/**
 * Formats a percentage value
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') {
    value = parseFloat(value) || 0;
  }
  return `${value.toFixed(decimals)}%`;
};

/**
 * General number formatter with locale support
 * @param {number} number - Number to format
 * @param {string} locale - Locale for formatting
 * @param {Object} options - Intl.NumberFormat options
 * @returns {string} Formatted number
 */
export const formatNumber = (number, locale = 'en-US', options = {}) => new Intl.NumberFormat(locale, options).format(number);

// ===============================
// File Size Formatting
// ===============================

/**
 * Formats file size in bytes to human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ===============================
// Time and Duration Formatting
// ===============================

/**
 * Formats time in 24-hour format
 * @param {Date} date - Date object
 * @returns {string} Formatted time
 */
export const formatTime = date => format(new Date(date), 'HH:mm');

/**
 * Formats duration from minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = minutes => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

// ===============================
// Contact Information Formatting
// ===============================

/**
 * Formats a phone number into standard format
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = phoneNumber => {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumber;
};

/**
 * Formats a credit card number with spaces
 * @param {string} cardNumber - Raw card number
 * @returns {string} Formatted card number
 */
export const formatCreditCard = cardNumber => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/(\d{1,4})/g);
  return groups ? groups.join(' ') : cardNumber;
};

// ===============================
// Product and Price Formatting
// ===============================

/**
 * Formats unit price with currency and unit
 * @param {number} price - Price value
 * @param {string} unit - Unit of measurement
 * @returns {string} Formatted unit price
 */
export const formatUnitPrice = (price, unit) => `${formatCurrency(price)}/${unit}`;

/**
 * Formats quantity with optional unit
 * @param {number} quantity - Quantity value
 * @param {string} unit - Unit of measurement
 * @returns {string} Formatted quantity
 */
export const formatQuantity = (quantity, unit = '') => `${formatNumber(quantity)}${unit ? ` ${unit}` : ''}`;
