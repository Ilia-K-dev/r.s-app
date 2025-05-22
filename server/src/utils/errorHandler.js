const { logError } = require('./logger'); // Assuming logger utility exists

/**
 * @desc Handles errors by logging them and sending a standardized error response.
 * @param {object} res - Express response object.
 * @param {Error} error - The error object.
 * @param {string} [defaultMessage='An unexpected error occurred.'] - Default message if error message is not available.
 */
const handleError = (res, error, defaultMessage = 'An unexpected error occurred.') => {
  logError('API Error:', {
    message: error.message,
    stack: error.stack,
    status: error.statusCode || 500,
  });

  const statusCode = error.statusCode || 500;
  const message = error.message || defaultMessage;

  res.status(statusCode).json({
    status: 'error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = {
  handleError,
};
