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
 * @desc Formats a date object or string into a specified format string using date-fns.
 * @param {Date|string} date - The date to format. Can be a Date object or an ISO 8601 string.
 * @param {string} [formatStr='MMM dd, yyyy'] - The format string (e.g., 'yyyy-MM-dd', 'HH:mm').
 * @returns {string} - The formatted date string. Returns empty string if the input is invalid.
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';

  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';

  return format(parsedDate, formatStr);
};

/**
 * @desc Checks if a given value is a valid Date object.
 * @param {*} date - The value to check.
 * @returns {boolean} - True if the value is a valid Date object, false otherwise.
 */
export const isValidDate = date => {
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
};

/**
 * @desc Gets predefined date range options relative to today.
 * @returns {object} - An object containing various date range options (today, yesterday, last 7 days, etc.) with start and end Date objects.
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
 * @desc Checks if a given date falls within a specified date range (inclusive).
 * @param {Date|string} date - The date to check.
 * @param {Date|string} startDate - The start date of the range.
 * @param {Date|string} endDate - The end date of the range.
 * @returns {boolean} - True if the date is within the range, false otherwise.
 */
export const isWithinDateRange = (date, startDate, endDate) => {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(checkDate) || !isValid(start) || !isValid(end)) return false;

  return (
    (isEqual(checkDate, start) || isAfter(checkDate, start)) &&
    (isEqual(checkDate, end) || isBefore(checkDate, end))
  );
};

/**
 * @desc Gets a relative time string for a given date compared to the current date.
 * (e.g., "Today", "Yesterday", "3 days ago", "in 2 months").
 * @param {Date|string} date - The date to get the relative time for.
 * @returns {string} - The relative time string.
 */
export const getRelativeTimeString = date => {
  const now = new Date();
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(parsedDate)) return '';

  const daysDiff = differenceInDays(now, parsedDate);
  const monthsDiff = differenceInMonths(now, parsedDate);
  const yearsDiff = differenceInYears(now, parsedDate); // Corrected variable name

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

  // Fallback for dates far in the past or future
  return format(parsedDate, 'MMM dd, yyyy');
};

/**
 * @desc Formats a date range into a concise string.
 * @param {Date|string} startDate - The start date of the range.
 * @param {Date|string} endDate - The end date of the range.
 * @param {string} [formatStr='MMM dd, yyyy'] - The format string for individual dates if the range spans across months/years.
 * @returns {string} - The formatted date range string.
 */
export const formatDateRange = (startDate, endDate, formatStr = 'MMM dd, yyyy') => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return '';

  if (isSameDay(start, end)) {
    return formatDate(start, formatStr);
  }

  if (isSameMonth(start, end) && isSameYear(start, end)) {
    return `${format(start, 'MMM dd')} - ${format(end, 'dd, yyyy')}`;
  }

  if (isSameYear(start, end)) {
    return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
  }

  return `${formatDate(start, formatStr)} - ${formatDate(end, formatStr)}`;
};

/**
 * @desc Parses a date string into a Date object with a fallback value.
 * @param {string} dateString - The date string to parse.
 * @param {Date|null} [fallback=null] - The value to return if parsing fails.
 * @returns {Date|null} - The parsed Date object or the fallback value.
 */
export const parseDate = (dateString, fallback = null) => {
  if (!dateString) return fallback;

  const parsedDate = new Date(dateString);
  return isValid(parsedDate) ? parsedDate : fallback;
};

/**
 * @desc Gets the start and end Date objects for the month of a given date.
 * @param {Date|string} [date=new Date()] - The date within the desired month.
 * @returns {{start: Date, end: Date}} - An object containing the start and end dates of the month.
 */
export const getMonthRange = (date = new Date()) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return { start: null, end: null };
  return {
    start: startOfMonth(parsedDate),
    end: endOfMonth(parsedDate),
  };
};

/**
 * @desc Formats the time part of a date object or string into a specified format string.
 * @param {Date|string} date - The date to format the time from.
 * @param {string} [formatStr='HH:mm'] - The format string for the time.
 * @returns {string} - The formatted time string. Returns empty string if the input is invalid.
 */
export const formatTime = (date, formatStr = 'HH:mm') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return '';
  return format(parsedDate, formatStr);
};

/**
 * @desc Extracts various date parts from a date object.
 * @param {Date|string} date - The date to extract parts from.
 * @returns {object|null} - An object containing various date parts (year, month, day, etc.), or null if the input is invalid.
 */
export const getDateParts = date => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return null;

  return {
    year: parsedDate.getFullYear(),
    month: parsedDate.getMonth() + 1,
    day: parsedDate.getDate(),
    hours: parsedDate.getHours(),
    minutes: parsedDate.getMinutes(),
    seconds: parsedDate.getSeconds(),
    weekday: format(parsedDate, 'EEEE'),
    weekNumber: format(parsedDate, 'w'),
    quarter: Math.floor(parsedDate.getMonth() / 3) + 1,
    dayOfYear: format(parsedDate, 'D'),
    isWeekend: [0, 6].includes(parsedDate.getDay()),
  };
};

/**
 * @desc Compares two dates for sorting purposes.
 * @param {Date|string} dateA - The first date.
 * @param {Date|string} dateB - The second date.
 * @returns {number} - A negative value if dateA is before dateB, a positive value if dateA is after dateB, and 0 if they are equal.
 */
export const compareDates = (dateA, dateB) => {
  const parsedA = typeof dateA === 'string' ? parseISO(dateA) : dateA;
  const parsedB = typeof dateB === 'string' ? parseISO(dateB) : dateB;

  if (!isValid(parsedA) || !isValid(parsedB)) {
      // Handle invalid dates, perhaps by placing them at the end or beginning
      if (!isValid(parsedA) && !isValid(parsedB)) return 0;
      if (!isValid(parsedA)) return 1; // Invalid A comes after valid B
      return -1; // Valid A comes before invalid B
  }

  return parsedA.getTime() - parsedB.getTime();
};

/**
 * @desc Groups an array of dates by a specified period (day, week, month, quarter, year).
 * @param {Array<Date|string>} dates - The array of dates to group.
 * @param {'day'|'week'|'month'|'quarter'|'year'} [period='month'] - The period to group by.
 * @returns {object} - An object where keys are the period identifiers (e.g., 'YYYY-MM', 'YYYY-ww') and values are arrays of dates within that period.
 */
export const groupDatesByPeriod = (dates, period = 'month') => {
  const groups = {};

  dates.forEach(date => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsedDate)) return; // Skip invalid dates

    let key;

    switch (period) {
      case 'day': {
        key = format(parsedDate, 'yyyy-MM-dd');
        break;
      }
      case 'week': {
        key = format(parsedDate, 'yyyy-ww'); // ISO week of year
        break;
      }
      case 'month': {
        key = format(parsedDate, 'yyyy-MM');
        break;
      }
      case 'quarter': {
        const quarter = Math.floor(parsedDate.getMonth() / 3) + 1;
        key = `${parsedDate.getFullYear()}-Q${quarter}`;
        break;
      }
      case 'year': {
        key = format(parsedDate, 'yyyy');
        break;
      }
      default: {
        key = format(parsedDate, 'yyyy-MM-dd');
      }
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(date);
  });

  return groups;
};

/**
 * @desc Generates an array of dates within a specified date range (inclusive).
 * @param {Date|string} startDate - The start date of the range.
 * @param {Date|string} endDate - The end date of the range.
 * @returns {Array<Date>} - An array of Date objects within the range.
 */
export const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = startOfDay(typeof startDate === 'string' ? parseISO(startDate) : startDate);
  const end = endOfDay(typeof endDate === 'string' ? parseISO(endDate) : endDate);

  if (!isValid(currentDate) || !isValid(end)) return [];

  while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
};

/**
 * @desc Calculates the difference between two dates in days, months, and years.
 * @param {Date|string} startDate - The start date.
 * @param {Date|string} endDate - The end date.
 * @returns {{days: number, months: number, years: number}} - An object containing the difference in days, months, and years.
 */
export const getDateDifference = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return { days: NaN, months: NaN, years: NaN };

  return {
    days: differenceInDays(end, start),
    months: differenceInMonths(end, start),
    years: differenceInYears(end, start),
  };
};

/**
 * @desc Gets fiscal period information for a given date.
 * @param {Date|string} [date=new Date()] - The date to get fiscal period information for.
 * @param {number} [fiscalYearStart=0] - The month (0-11) that the fiscal year starts in.
 * @returns {object} - An object containing fiscal year, start/end dates, and current quarter.
 */
export const getFiscalPeriods = (date = new Date(), fiscalYearStart = 0) => {
  const currentDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(currentDate)) return { fiscalYear: NaN, fiscalYearStart: null, fiscalYearEnd: null, currentQuarter: NaN };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  let fiscalYear = currentYear;
  if (currentMonth < fiscalYearStart) {
    fiscalYear -= 1;
  }

  const fiscalYearStartDate = new Date(fiscalYear, fiscalYearStart, 1);
  const fiscalYearEndDate = endOfMonth(addMonths(fiscalYearStartDate, 11));

  const monthDiffFromFiscalStart = (12 + currentMonth - fiscalYearStart) % 12;
  const currentQuarter = Math.floor(monthDiffFromFiscalStart / 3) + 1;


  return {
    fiscalYear,
    fiscalYearStart: fiscalYearStartDate,
    fiscalYearEnd: fiscalYearEndDate,
    currentQuarter,
  };
};

/**
 * @desc Parses and normalizes a date input (string, number, or Date object) into a valid Date object.
 * Tries multiple formats for strings.
 * @param {*} input - The date input.
 * @returns {Date|null} - The normalized Date object, or null if parsing fails.
 */
export const normalizeDate = input => {
  if (!input) return null;

  if (input instanceof Date) {
    return isValid(input) ? input : null;
  }

  if (typeof input === 'string') {
    // Try ISO format first
    let date = parseISO(input);
    if (isValid(date)) return date;

    // Try other common formats (add more as needed)
    const formats = [
      'MM/dd/yyyy',
      'dd/MM/yyyy',
      'yyyy/MM/dd',
      'MM-dd-yyyy',
      'dd-MM-yyyy',
      'yyyy-MM-dd',
      'MMM dd, yyyy', // e.g., Jan 01, 2023
      'MMMM dd, yyyy', // e.g., January 01, 2023
    ];

    for (const formatString of formats) {
        date = parse(input, formatString, new Date());
        if (isValid(date)) return date;
    }

    // Fallback to new Date() constructor for other formats
    date = new Date(input);
    if (isValid(date)) return date;
  }

if (typeof input === 'number') {
    // Assume timestamp in milliseconds
    const date = new Date(input);
    return isValid(date) ? date : null;
  }

  return null;
};

/**
 * @desc Formats the duration between two dates into a human-readable string (e.g., "1y 3m", "6m 15d", "10d").
 * @param {Date|string} startDate - The start date.
 * @param {Date|string} endDate - The end date.
 * @returns {string} - The formatted duration string.
 */
export const formatDateDuration = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  if (!isValid(start) || !isValid(end)) return '';

  const diff = getDateDifference(start, end);

  if (diff.years > 0) {
    const remainingMonths = Math.abs(differenceInMonths(end, start) % 12);
    return `${diff.years}y ${remainingMonths}m`;
  }
  if (diff.months > 0) {
     const remainingDays = Math.abs(differenceInDays(end, start) % 30); // Approximate days in a month
    return `${diff.months}m ${remainingDays}d`;
  }
  return `${diff.days}d`;
};

/**
 * @desc Check if a date falls on a weekend (Saturday or Sunday).
 * @param {Date|string} date - The date to check.
 * @returns {boolean} - True if the date is on a weekend, false otherwise.
 */
export const isWeekend = date => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) return false;
  const day = parsedDate.getDay();
  return day === 0 || day === 6;
};

/**
 * @desc Get the count of business days (excluding weekends) between two dates.
 * @param {Date|string} startDate - The start date.
 * @param {Date|string} endDate - The end date.
 * @returns {number} - The number of business days.
 */
export const getBusinessDayCount = (startDate, endDate) => {
  let count = 0;
  const dates = generateDateRange(startDate, endDate);

  dates.forEach(date => {
    if (!isWeekend(date)) {
      count++;
    }
  });

  return count;
};

export default {
  formatDate,
  isValidDate,
  getDateRangeOptions,
  isWithinDateRange,
  getRelativeTimeString,
  formatDateRange,
  parseDate,
  getMonthRange,
  formatTime,
  getDateParts,
  compareDates,
  groupDatesByPeriod,
  generateDateRange,
  getDateDifference,
  getFiscalPeriods,
  normalizeDate,
  formatDateDuration,
  isWeekend,
  getBusinessDayCount,
};
