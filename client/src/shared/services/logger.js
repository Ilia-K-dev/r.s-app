/**
 * @desc A simple client-side logger utility.
 * Logs messages to the browser console.
 */
const logger = {
  /**
   * @desc Logs an informational message.
   * @param {string} message - The message to log.
   * @param {*} [data] - Optional additional data to log.
   */
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data !== undefined ? data : '');
  },

  /**
   * @desc Logs an error message.
   * @param {string} message - The message to log.
   * @param {*} [data] - Optional additional data to log.
   */
  error: (message, data) => {
    console.error(`[ERROR] ${message}`, data !== undefined ? data : '');
  },

  /**
   * @desc Logs a debug message (only in development).
   * @param {string} message - The message to log.
   * @param {*} [data] - Optional additional data to log.
   */
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data !== undefined ? data : '');
    }
  },

  /**
   * @desc Logs a warning message.
   * @param {string} message - The message to log.
   * @param {*} [data] - Optional additional data to log.
   */
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data !== undefined ? data : '');
  },
};

export default logger;
