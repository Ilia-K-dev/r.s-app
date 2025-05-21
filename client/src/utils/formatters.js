import { useTranslation } from 'react-i18next';

// Assuming English formatters exist or will be created
const formatEnglishCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Or your default currency
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatEnglishDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

import { formatHebrewCurrency, formatHebrewDate } from './hebrew';

export const useFormatters = () => {
  const { i18n } = useTranslation();
  
  return {
    formatCurrency: (amount) => {
      if (i18n.language === 'he') {
        return formatHebrewCurrency(amount);
      }
      return formatEnglishCurrency(amount);
    },
    formatDate: (date) => {
      if (i18n.language === 'he') {
        return formatHebrewDate(date);
      }
      return formatEnglishDate(date);
    }
  };
};
