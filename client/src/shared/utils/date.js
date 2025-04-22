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
  isSameYear
} from 'date-fns';//correct

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
 * Validate date
 */
export const isValidDate = (date) => {
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
    end: endOfMonth(today)
  };

  const lastMonth = {
    start: startOfMonth(subMonths(today, 1)),
    end: endOfMonth(subMonths(today, 1))
  };

  const thisYear = {
    start: startOfYear(today),
    end: endOfYear(today)
  };

  return {
    today: {
      label: 'Today',
      start: startOfDay(today),
      end: endOfDay(today)
    },
    yesterday: {
      label: 'Yesterday',
      start: startOfDay(subDays(today, 1)),
      end: endOfDay(subDays(today, 1))
    },
    last7Days: {
      label: 'Last 7 days',
      start: startOfDay(subDays(today, 6)),
      end: endOfDay(today)
    },
    last30Days: {
      label: 'Last 30 days',
      start: startOfDay(subDays(today, 29)),
      end: endOfDay(today)
    },
    thisWeek: {
      label: 'This week',
      start: startOfWeek(today),
      end: endOfWeek(today)
    },
    thisMonth: {
      label: 'This month',
      ...thisMonth
    },
    lastMonth: {
      label: 'Last month',
      ...lastMonth
    },
    thisYear: {
      label: 'This year',
      ...thisYear
    }
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
export const getRelativeTimeString = (date) => {
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
    end: endOfMonth(parsedDate)
  };
};

/**
 * Format time
 */
export const formatTime = (date, formatStr = 'HH:mm') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatStr);
};

/**
 * Get date parts with extensive parsing
 */
export const getDateParts = (date) => {
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
    isWeekend: [0, 6].includes(parsedDate.getDay())
  };
};

/**
 * Compare dates for sorting
 */
export const compareDates = (dateA, dateB) => {
  const parsedA = typeof dateA === 'string' ? parseISO(dateA) : dateA;
  const parsedB = typeof dateB === 'string' ? parseISO(dateB) : dateB;
  return parsedA.getTime() - parsedB.getTime();
};

/**
 * Group dates by period
 */
export const groupDatesByPeriod = (dates, period = 'month') => {
  const groups = {};
  
  dates.forEach(date => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    let key;

    switch (period) {
      case 'day':
        key = format(parsedDate, 'yyyy-MM-dd');
        break;
      case 'week':
        key = format(parsedDate, 'yyyy-ww');
        break;
      case 'month':
        key = format(parsedDate, 'yyyy-MM');
        break;
      case 'quarter':
        const quarter = Math.floor(parsedDate.getMonth() / 3) + 1;
        key = `${parsedDate.getFullYear()}-Q${quarter}`;
        break;
      case 'year':
        key = format(parsedDate, 'yyyy');
        break;
      default:
        key = format(parsedDate, 'yyyy-MM-dd');
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(date);
  });

  return groups;
};

/**
 * Generate date range array
 */
export const generateDateRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = startOfDay(typeof startDate === 'string' ? parseISO(startDate) : startDate);
  const end = endOfDay(typeof endDate === 'string' ? parseISO(endDate) : endDate);

  while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
};

/**
 * Calculate date difference in various units
 */
export const getDateDifference = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

  return {
    days: differenceInDays(end, start),
    months: differenceInMonths(end, start),
    years: differenceInYears(end, start)
  };
};

/**
 * Get fiscal periods
 */
export const getFiscalPeriods = (date = new Date(), fiscalYearStart = 0) => {
  const currentDate = typeof date === 'string' ? parseISO(date) : date;
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  let fiscalYear = currentYear;
  if (currentMonth < fiscalYearStart) {
    fiscalYear -= 1;
  }

  const fiscalYearStartDate = new Date(fiscalYear, fiscalYearStart, 1);
  const fiscalYearEndDate = endOfMonth(addMonths(fiscalYearStartDate, 11));

  return {
    fiscalYear,
    fiscalYearStart: fiscalYearStartDate,
    fiscalYearEnd: fiscalYearEndDate,
    currentQuarter: Math.floor(((12 + currentMonth - fiscalYearStart) % 12) / 3) + 1
  };
};

/**
 * Parse and normalize date input
 */
export const normalizeDate = (input) => {
  if (!input) return null;
  
  if (input instanceof Date) {
    return isValid(input) ? input : null;
  }
  
  if (typeof input === 'string') {
    // Try ISO format first
    let date = parseISO(input);
    if (isValid(date)) return date;

    // Try other common formats
    const formats = [
      /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/,  // DD-MM-YYYY or MM-DD-YYYY
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/,    // YYYY-MM-DD
      /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{2,4})$/i // DD MMM YYYY
    ];

    for (const format of formats) {
      const match = input.match(format);
      if (match) {
        date = new Date(input);
        if (isValid(date)) return date;
      }
    }
  }
  
  if (typeof input === 'number') {
    const date = new Date(input);
    return isValid(date) ? date : null;
  }
  
  return null;
};

/**
 * Format duration between two dates
 */
export const formatDateDuration = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const diff = getDateDifference(start, end);
  
  if (diff.years > 0) {
    return `${diff.years}y ${Math.abs(diff.months % 12)}m`;
  }
  if (diff.months > 0) {
    return `${diff.months}m ${Math.abs(diff.days % 30)}d`;
  }
  return `${diff.days}d`;
};

/**
 * Check if date falls on a weekend
 */
export const isWeekend = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  const day = parsedDate.getDay();
  return day === 0 || day === 6;
};

/**
 * Get business days between two dates (excluding weekends)
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
  getBusinessDayCount
};