const featureFlags = {
  firebaseDirectIntegration: true,
  documentsDirectIntegration: true,
  analyticsDirectIntegration: true
};

const isFeatureEnabled = jest.fn(flagName => {
  if (flagName in featureFlags) {
    return featureFlags[flagName];
  }
  return false;
});

const enableFeature = jest.fn(flagName => {
  featureFlags[flagName] = true;
});

const disableFeature = jest.fn(flagName => {
  featureFlags[flagName] = false;
});

const getAllFeatureFlags = jest.fn(() => ({ ...featureFlags }));

const startPerformanceTimer = jest.fn(context => {
  return 'mock-timer-id';
});

const endPerformanceTimer = jest.fn((timerId, success = true) => {
  return {
    duration: 100,
    success
  };
});

const loadFeatureFlags = jest.fn(() => Promise.resolve(featureFlags));
const saveFeatureFlags = jest.fn(() => Promise.resolve());

// Added mock for stopPerformanceTimer
const stopPerformanceTimer = jest.fn(() => {});


module.exports = {
  isFeatureEnabled,
  enableFeature,
  disableFeature,
  getAllFeatureFlags,
  startPerformanceTimer,
  endPerformanceTimer,
  loadFeatureFlags,
  saveFeatureFlags,
  stopPerformanceTimer, // Added to exports
  __featureFlags: featureFlags // For test manipulation
};
