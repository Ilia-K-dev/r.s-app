const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.enabled = isDevelopment || localStorage.getItem('debug') === 'true';
  }

  _formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      data,
      app: 'Receipt Scanner',
    };
  }

  _log(level, message, data = null) {
    if (!this.enabled) return;

    const formattedMessage = this._formatMessage(level, message, data);

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.log(formattedMessage);
        break;
      case LOG_LEVELS.INFO:
        console.info(formattedMessage);
        break;
      case LOG_LEVELS.WARN:
        console.warn(formattedMessage);
        break;
      case LOG_LEVELS.ERROR:
        console.error(formattedMessage);
        // Could add error reporting service integration here
        break;
      default:
        console.log(formattedMessage);
    }

    // Store logs in memory for debugging
    if (!this._logs) this._logs = [];
    this._logs.push(formattedMessage);
    if (this._logs.length > 1000) this._logs.shift();
  }

  debug(message, data) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  error(message, error) {
    const errorData = error
      ? {
          message: error.message,
          stack: error.stack,
          code: error.code,
        }
      : null;

    this._log(LOG_LEVELS.ERROR, message, errorData);
  }

  // Get recent logs for debugging
  getLogs() {
    return this._logs || [];
  }

  // Clear logs
  clearLogs() {
    this._logs = [];
  }

  // Enable/disable logging
  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('debug', enabled.toString());
  }

  // Add custom log level
  addCustomLevel(level, handler) {
    if (LOG_LEVELS[level]) {
      throw new Error(`Log level ${level} already exists`);
    }

    LOG_LEVELS[level] = level.toLowerCase();
    this[level.toLowerCase()] = (message, data) => {
      const formattedMessage = this._formatMessage(LOG_LEVELS[level], message, data);
      handler(formattedMessage);
      this._logs.push(formattedMessage);
    };
  }
}

export const logger = new Logger();
export default logger;
