/**
 * @desc Formats a numeric value as a currency string.
 * @param {number} value - The numeric value to format.
 * @param {string} [currency='USD'] - The currency code (e.g., 'USD', 'EUR').
 * @param {string} [locale='en-US'] - The locale to use for formatting.
 * @returns {string} - The formatted currency string. Returns empty string for null/undefined input.
 */
export const formatCurrency = (value, currency = 'USD', locale = 'en-US') => {
  if (value === null || value === undefined) {
    return '';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    // Fallback to fixed 2 decimal places if Intl.NumberFormat fails
    return typeof value === 'number' ? value.toFixed(2) : String(value);
  }
};

/**
 * @desc Parses a currency input string into a floating-point number.
 * Attempts to remove currency symbols, commas, and other non-numeric characters except decimal point.
 * @param {string} input - The currency input string.
 * @param {string} [locale='en-US'] - The locale to use for parsing (currently not used in parsing logic, but kept for consistency).
 * @returns {number|null} - The parsed numeric value, or null if parsing fails.
 */
export const parseCurrencyInput = (input, locale = 'en-US') => {
  if (!input) return null;

  try {
    // Remove currency symbols, commas, and other non-numeric characters except decimal point and sign
    // This regex is a basic attempt and might need refinement based on specific currency formats
    const cleanedInput = input.replace(/[^0-9.-]/g, '');

    // Handle multiple decimal points (keep only the first one)
    const parts = cleanedInput.split('.');
    let finalInput = parts[0];
    if (parts.length > 1) {
        finalInput += '.' + parts.slice(1).join('');
    }

    const parsedValue = parseFloat(finalInput);

    return isNaN(parsedValue) ? null : parsedValue;
  } catch (error) {
    console.error('Error parsing currency input:', error);
    return null;
  }
};

/**
 * @desc Converts an amount from one currency to another using provided exchange rates.
 * @param {number} amount - The amount to convert.
 * @param {string} fromCurrency - The currency code to convert from.
 * @param {string} toCurrency - The currency code to convert to.
 * @param {object} exchangeRates - An object containing exchange rates relative to a base currency (e.g., { USD: 1, EUR: 0.9, GBP: 0.8 }).
 * @returns {number|null} - The converted amount, or null if conversion is not possible (missing rates).
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, exchangeRates) => {
  if (!exchangeRates || !exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
    console.error(`Exchange rates not available for conversion from ${fromCurrency} to ${toCurrency}`);
    return null; // Or throw an error
  }

  // Assuming exchangeRates are relative to a base currency (e.g., USD)
  // amount_in_base = amount / rate_of_fromCurrency
  // converted_amount = amount_in_base * rate_of_toCurrency
  const amountInBaseCurrency = amount / exchangeRates[fromCurrency];
  const convertedAmount = amountInBaseCurrency * exchangeRates[toCurrency];

  return convertedAmount;
};

/**
 * @desc Gets the currency symbol for a given currency code and locale.
 * @param {string} [currency='USD'] - The currency code (e.g., 'USD', 'EUR').
 * @param {string} [locale='en-US'] - The locale to use.
 * @returns {string} - The currency symbol. Returns '$' as a fallback.
 */
export const getCurrencySymbol = (currency = 'USD', locale = 'en-US') => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0, // Avoid fractional digits for symbol only
      maximumFractionDigits: 0,
    });
    // Format a zero value and extract the symbol by removing digits and whitespace
    return formatter.format(0).replace(/\d/g, '').trim();
  } catch (error) {
    console.error('Error getting currency symbol:', error);
    return '$'; // Fallback
  }
};

export default {
  formatCurrency,
  parseCurrencyInput,
  convertCurrency,
  getCurrencySymbol,
};
