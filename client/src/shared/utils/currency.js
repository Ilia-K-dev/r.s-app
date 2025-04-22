/**
 * Comprehensive currency utilities for receipt scanning and inventory management
 */

/**
 * Basic currency formatting with locale support
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Parse currency input, cleaning and validating the value
 */
export const parseCurrencyInput = (value) => {
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
 * Calculate total from array of items
 */
export const calculateTotal = (items = []) => {
  return items.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    const quantity = parseFloat(item.quantity) || 1;
    return sum + (amount * quantity);
  }, 0);
};

/**
 * Calculate tax amount based on base amount and tax rate
 */
export const calculateTax = (amount, taxRate = 0) => {
  return amount * (taxRate / 100);
};

/**
 * Round number to specified decimal places
 */
export const roundToDecimals = (number, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round((number + Number.EPSILON) * factor) / factor;
};

/**
 * Format unit price with proper currency and unit
 */
export const formatUnitPrice = (price, unit, currency = 'USD') => {
  return `${formatCurrency(price, currency)}/${unit}`;
};

/**
 * Calculate total price with quantity
 */
export const calculateItemTotal = (price, quantity = 1, discountPercent = 0) => {
  const baseTotal = price * quantity;
  const discount = baseTotal * (discountPercent / 100);
  return roundToDecimals(baseTotal - discount);
};

/**
 * Parse price string to number
 */
export const parsePrice = (priceString) => {
  const cleaned = priceString.replace(/[^\d.,]/g, '');
  return parseFloat(cleaned.replace(',', '.')) || 0;
};

/**
 * Calculate discount amount
 */
export const calculateDiscount = (amount, discountPercent) => {
  return roundToDecimals(amount * (discountPercent / 100));
};

/**
 * Format currency for display in grid/table
 */
export const formatGridCurrency = (amount, currency = 'USD') => {
  return {
    raw: amount,
    formatted: formatCurrency(amount, currency),
    currency
  };
};

/**
 * Calculate subtotal before tax
 */
export const calculateSubtotal = (items = []) => {
  return items.reduce((sum, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseFloat(item.quantity) || 1;
    const discount = parseFloat(item.discountPercent) || 0;
    return sum + calculateItemTotal(price, quantity, discount);
  }, 0);
};

/**
 * Calculate total with tax
 */
export const calculateTotalWithTax = (subtotal, taxRate = 0) => {
  const tax = calculateTax(subtotal, taxRate);
  return roundToDecimals(subtotal + tax);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${roundToDecimals(value, decimals)}%`;
};

/**
 * Calculate price per unit
 */
export const calculatePricePerUnit = (price, quantity, unit = '') => {
  if (quantity <= 0) return null;
  const unitPrice = roundToDecimals(price / quantity);
  return {
    amount: unitPrice,
    formatted: formatUnitPrice(unitPrice, unit)
  };
};

/**
 * Format large currency amounts with K/M/B
 */
export const formatLargeCurrency = (amount, currency = 'USD') => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1e9) {
    return `${formatCurrency(amount / 1e9, currency)}B`;
  }
  if (absAmount >= 1e6) {
    return `${formatCurrency(amount / 1e6, currency)}M`;
  }
  if (absAmount >= 1e3) {
    return `${formatCurrency(amount / 1e3, currency)}K`;
  }
  return formatCurrency(amount, currency);
};

/**
 * Calculate running total
 */
export const calculateRunningTotal = (transactions = []) => {
  let total = 0;
  return transactions.map(transaction => {
    total += parseFloat(transaction.amount) || 0;
    return {
      ...transaction,
      runningTotal: roundToDecimals(total)
    };
  });
};

/**
 * Format currency difference (for profit/loss)
 */
export const formatCurrencyDifference = (amount, currency = 'USD') => {
  const prefix = amount >= 0 ? '+' : '';
  return `${prefix}${formatCurrency(amount, currency)}`;
};

/**
 * Calculate weighted average price
 */
export const calculateWeightedAverage = (items = []) => {
  const totalValue = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  const totalQuantity = items.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  if (totalQuantity === 0) return 0;
  return roundToDecimals(totalValue / totalQuantity);
};

/**
 * Format money range
 */
export const formatMoneyRange = (min, max, currency = 'USD') => {
  if (min === max) {
    return formatCurrency(min, currency);
  }
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
};

/**
 * Calculate cost basis
 */
export const calculateCostBasis = (purchases = []) => {
  return purchases.reduce((total, purchase) => {
    const cost = parseFloat(purchase.price) || 0;
    const quantity = parseFloat(purchase.quantity) || 0;
    return total + (cost * quantity);
  }, 0);
};

/**
 * Format currency for CSV export
 */
export const formatCurrencyForExport = (amount, currency = 'USD') => {
  return {
    amount: roundToDecimals(amount),
    formatted: formatCurrency(amount, currency),
    currency,
    raw: amount
  };
};

/**
 * Calculate profit margin
 */
export const calculateProfitMargin = (revenue, cost) => {
  if (revenue === 0) return 0;
  return roundToDecimals((revenue - cost) / revenue * 100);
};

/**
 * Calculate markup percentage
 */
export const calculateMarkup = (sellingPrice, cost) => {
  if (cost === 0) return 0;
  return roundToDecimals((sellingPrice - cost) / cost * 100);
};