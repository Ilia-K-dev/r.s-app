export const APP_CONFIG = {
  name: 'Receipt Scanner',
  version: '1.0.0'
};

export const AUTH_CONFIG = {
  minPasswordLength: 8,
  sessionTimeout: 3600000, // 1 hour
  maxLoginAttempts: 5
};

export const RECEIPT_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/heic'],
  maxItems: 50,
  itemsPerPage: 10
};

export const REPORT_CONFIG = {
  defaultDateRange: 30, // days
  maxDateRange: 365, // days
  chartColors: [
    '#0EA5E9', // primary
    '#22C55E', // success
    '#EAB308', // warning
    '#EC4899', // pink
    '#8B5CF6'  // purple
  ]
};

export const CATEGORIES = {
  GROCERIES: {
    id: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingCart',
    color: '#22C55E'
  },
  ELECTRONICS: {
    id: 'electronics',
    name: 'Electronics',
    icon: 'Laptop',
    color: '#3B82F6'
  },
  ENTERTAINMENT: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#EC4899'
  },
  TRANSPORTATION: {
    id: 'transportation',
    name: 'Transportation',
    icon: 'Car',
    color: '#F59E0B'
  },
  UTILITIES: {
    id: 'utilities',
    name: 'Utilities',
    icon: 'Lightbulb',
    color: '#8B5CF6'
  },
  OTHER: {
    id: 'other',
    name: 'Other',
    icon: 'MoreHorizontal',
    color: '#6B7280'
  }
};

export const DATE_RANGES = {
  LAST_7_DAYS: {
    id: '7d',
    label: 'Last 7 days',
    days: 7
  },
  LAST_30_DAYS: {
    id: '30d',
    label: 'Last 30 days',
    days: 30
  },
  THIS_MONTH: {
    id: 'this_month',
    label: 'This month'
  },
  LAST_MONTH: {
    id: 'last_month',
    label: 'Last month'
  },
  CUSTOM: {
    id: 'custom',
    label: 'Custom range'
  }
};

export const ERROR_MESSAGES = {
  // Auth errors
  AUTH_INVALID_EMAIL: 'Please enter a valid email address',
  AUTH_WEAK_PASSWORD: 'Password must be at least 8 characters long',
  AUTH_EMAIL_IN_USE: 'This email is already registered',
  AUTH_USER_NOT_FOUND: 'No account found with this email',
  AUTH_WRONG_PASSWORD: 'Invalid password',
  AUTH_TOO_MANY_REQUESTS: 'Too many attempts. Please try again later',
  
  // Receipt errors
  RECEIPT_UPLOAD_FAILED: 'Failed to upload receipt',
  RECEIPT_FILE_TOO_LARGE: 'File size exceeds 5MB limit',
  RECEIPT_INVALID_TYPE: 'Invalid file type. Please upload a JPEG or PNG image',
  RECEIPT_NOT_FOUND: 'Receipt not found',
  
  // Report errors
  REPORT_GENERATION_FAILED: 'Failed to generate report',
  REPORT_INVALID_DATE_RANGE: 'Invalid date range',
  
  // API errors
  API_NETWORK_ERROR: 'Network error. Please check your connection',
  API_SERVER_ERROR: 'Server error. Please try again later',
  API_TIMEOUT: 'Request timed out. Please try again'
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  RECEIPTS: '/receipts',
  RECEIPT_DETAIL: (id) => `/receipts/${id}`,
  REPORTS: '/reports',
  SETTINGS: '/settings'
};

export const UI_CONFIG = {
  animation: {
    duration: 200,
    easing: 'ease-in-out'
  },
  toast: {
    duration: 5000,
    position: 'bottom-right'
  },
  modal: {
    sizes: {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    }
  }
};