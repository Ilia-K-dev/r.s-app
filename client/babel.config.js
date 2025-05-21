// Created as part of build error fix task on 2025-05-08, 4:11:05 AM
// Babel configuration for the client application.

module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-reanimated/plugin'
    ]
  };
};
