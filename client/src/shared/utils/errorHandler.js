import useToast from '../hooks/useToast'; // Assuming useToast hook exists

/**
 * @desc Centralized client-side error handler.
 * Logs the error, shows a toast notification, and returns a user-friendly message.
 * @param {Error} error - The error object caught in a hook or component.
 * @param {string} [defaultMessage='An unexpected error occurred.'] - A default message to display if the error object doesn't contain a user-friendly message.
 * @returns {string} - A user-friendly error message.
 */
const errorHandler = (error, defaultMessage = 'An unexpected error occurred.') => {
  const { showToast } = useToast();

  // Extract user-friendly message (assuming the error object from the API interceptor has a 'message' property)
  const userFriendlyMessage = error.message || defaultMessage;

  // Log the full error for debugging
  console.error('Client-side Error:', error);

  // Show a toast notification
  showToast(userFriendlyMessage, 'error');

  // Return the user-friendly message for displaying in the UI
  return userFriendlyMessage;
};

export default errorHandler;
