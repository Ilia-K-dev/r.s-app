const handleError = jest.fn(error => {
  console.error('Mocked error handler:', error);
  return error;
});

const handleFirebaseError = jest.fn((error, context) => {
  console.error(`Mocked Firebase error handler (${context}):`, error);
  return error;
});

const trackConsecutiveErrors = jest.fn((context) => {
  // Mock implementation that doesn't disable any features
  return { count: 1, threshold: 5, isThresholdReached: false };
});

module.exports = {
  handleError,
  handleFirebaseError,
  trackConsecutiveErrors
};
