import clsx from 'clsx';

/**
 * @desc Joins class names together.
 * @param {...(string|string[]|object)} inputs - Class names to join.
 * @returns {string} - Joined class names string.
 */
export const cn = (...inputs) => clsx(...inputs);

/**
 * @desc Groups an array of objects by a specified key.
 * @param {Array<object>} array - The array of objects to group.
 * @param {string} key - The key to group by.
 * @returns {object} - An object where keys are the unique values of the specified key and values are arrays of objects.
 */
export const groupByKey = (array, key) => array.reduce((result, item) => {
    const keyValue = item[key];
    if (!result[keyValue]) {
      result[keyValue] = [];
    }
    result[keyValue].push(item);
    return result;
  }, {});

/**
 * @desc Calculates the sum of values for a specified key in an array of objects.
 * @param {Array<object>} items - The array of objects.
 * @param {string} [key='total'] - The key whose values should be summed.
 * @returns {number} - The calculated total.
 */
export const calculateTotal = (items, key = 'total') => items.reduce((sum, item) => sum + (parseFloat(item[key]) || 0), 0);

/**
 * @desc Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed since the last time the debounced function was invoked.
 * @param {function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {function} - Returns the new debounced function.
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * @desc Sorts an array of objects by a specified key and order.
 * @param {Array<object>} array - The array of objects to sort.
 * @param {string} key - The key to sort by.
 * @param {'asc'|'desc'} [order='asc'] - The sort order ('asc' or 'desc').
 * @returns {Array<object>} - A new array containing the sorted objects.
 */
export const sortByKey = (array, key, order = 'asc') => [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    }
    return a[key] < b[key] ? 1 : -1;
  });

/**
 * @desc Filters an array of objects by a date range for a specified date key.
 * @param {Array<object>} items - The array of objects to filter.
 * @param {Date|string} startDate - The start date of the range.
 * @param {Date|string} endDate - The end date of the range.
 * @param {string} [dateKey='date'] - The key containing the date value in the objects.
 * @returns {Array<object>} - A new array containing objects within the date range.
 */
export const filterByDateRange = (items, startDate, endDate, dateKey = 'date') => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return items.filter(item => {
    const itemDate = new Date(item[dateKey]);
    return itemDate >= start && itemDate <= end;
  });
};

/**
 * @desc Generates monthly aggregated data from an array of items with date and value keys.
 * @param {Array<object>} data - The array of objects.
 * @param {string} [dateKey='date'] - The key containing the date value.
 * @param {string} [valueKey='total'] - The key containing the value to aggregate.
 * @returns {Array<object>} - An array of objects with 'month' (YYYY-MM) and 'value'.
 */
export const generateMonthlyData = (data, dateKey = 'date', valueKey = 'total') => {
  const months = {};

  data.forEach(item => {
    const date = new Date(item[dateKey]);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!months[monthKey]) {
      months[monthKey] = 0;
    }
    months[monthKey] += parseFloat(item[valueKey]) || 0;
  });

  return Object.entries(months).map(([month, value]) => ({
    month,
    value,
  }));
};

/**
 * @desc Formats a file size in bytes into a human-readable string (e.g., "10.5 KB", "2.3 MB").
 * @param {number} bytes - The file size in bytes.
 * @returns {string} - The formatted file size string.
 */
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
