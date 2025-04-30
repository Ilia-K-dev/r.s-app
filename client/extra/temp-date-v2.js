import {
  format,
  parseISO,
  isValid,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  subDays,
  subMonths,
  isBefore,
  isAfter,
  isEqual,
  isSameDay,
  isSameMonth,
  isSameYear,
} from 'date-fns';

/**
 * Format date with specified format string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';

  return format(parsedDate, formatStr);
};

/**
 * Get month range
 */
export const getMonthRange = (date = new Date()) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfMonth(parsedDate),
    end: endOfMonth(parsedDate),
  };
};

/**
 * Validate date
 */
export const isValidDate = date => {
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};

/**
 * Get predefined date range options
 */
export const getDateRangeOptions = () => {
  const today = new Date();

  const thisMonth = {
    start: startOfMonth(today),
    end: endOfMonth(today),
  };

  const lastMonth = {
    start: startOfMonth(subMonths(today, 1)),
    end: endOfMonth(subMonths(today, 1)),
  };

  const thisYear = {
    start: startOfYear(today),
    end: endOfYear(today),
  };

  return {
    today: {
      label: 'Today',
      start: startOfDay(today),
      end: endOfDay(today),
    },
    yesterday: {
      label: 'Yesterday',
      start: startOfDay(subDays(today, 1)),
      end: endOfDay(subDays(today, 1)),
    },
    last7Days: {
      label: 'Last 7 days',
      start: startOfDay(subDays(today, 6)),
      end: endOfDay(today),
    },
    last30Days: {
      label: 'Last 30 days',
      start: startOfDay(subDays(today, 29)),
      end: endOfDay(today),
    },
    thisWeek: {
      label: 'This week',
      start: startOfWeek(today),
      end: endOfWeek(today),
    },
    thisMonth: {
      label: 'This month',
      ...thisMonth,
    },
    lastMonth: {
      label: 'Last month',
      ...lastMonth,
    },
    thisYear: {
      label: 'This year',
      ...thisYear,
    },
  };
};

/**
 * Check if date is within range
 */
export const isWithinDateRange = (date, startDate, endDate) => {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  return (
    (isEqual(checkDate, startDate) || isAfter(checkDate, startDate)) &&
    (isEqual(checkDate, endDate) || isBefore(checkDate, endDate))
  );
};

/**
 * Get relative time string
 */
export const getRelativeTimeString = date => {
  const now = new Date();
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;

  const daysDiff = differenceInDays(now, parsedDate);
  const monthsDiff = differenceInMonths(now, parsedDate);
  const yearsDiff = differenceInYears(now, parsedDate);

  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff === -1) return 'Tomorrow';
  if (daysDiff > 0 && daysDiff <= 7) return `${daysDiff} days ago`;
  if (daysDiff < 0 && daysDiff >= -7) return `in ${Math.abs(daysDiff)} days`;

  if (monthsDiff === 1) return 'Last month';
  if (monthsDiff === -1) return 'Next month';
  if (monthsDiff > 0 && monthsDiff < 12) return `${monthsDiff} months ago`;
  if (monthsDiff < 0 && monthsDiff > -12) return `in ${Math.abs(monthsDiff)} months`;

  if (yearsDiff === 1) return 'Last year';
  if (yearsDiff === -1) return 'Next year';
  if (yearsDiff > 1) return `${yearsDiff} years ago`;
  if (yearsDiff < -1) return `in ${Math.abs(yearsDiff)} years`;

  return format(parsedDate, 'MMM dd, yyyy');
};

/**
 * Format date range
 */
export const formatDateRange = (startDate, endDate, formatStr = 'MMM dd, yyyy') => {
  if (isSameDay(startDate, endDate)) {
    return formatDate(startDate, formatStr);
  }

  if (isSameMonth(startDate, endDate)) {
    return `${format(startDate, 'MMM dd')} - ${format(endDate, 'dd, yyyy')}`;
  }

  if (isSameYear(startDate, endDate)) {
    return `${format(startDate, 'MMM dd')} - ${format(endDate, 'MMM dd, yyyy')}`;
  }

  return `${formatDate(startDate, formatStr)} - ${formatDate(endDate, formatStr)}`;
};

/**
 * Parse date string with fallback
 */
export const parseDate = (dateString, fallback = null) => {
  if (!dateString) return fallback;

  const parsedDate = new Date(dateString);
  return isValid(parsedDate) ? parsedDate : fallback;
};

/**
 * Get month range
 */
export const getMonthRange = (date = new Date()) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return {
    start: startOfMonth(parsedDate),
    end: endOfMonth(parsedDate),
  };
};

/**
 * Format time
 */
export const formatTime = (date, formatStr = 'HH:mm') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr);
};
