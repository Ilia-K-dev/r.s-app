export const formatCurrency = (amount, currency = 'USD') => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);

export const formatDate = (date, format = 'MM/DD/YYYY') => new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));

export const formatPercentage = (value, decimals = 2) => `${(value * 100).toFixed(decimals)}%`;
