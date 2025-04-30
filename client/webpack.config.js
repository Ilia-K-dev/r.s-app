const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Ensure entry is a non-empty array
  if (!config.entry || (Array.isArray(config.entry) && config.entry.length === 0)) {
    config.entry = ['./src/index.js']; // Adjust path if your entry file is different
  }
  return config;
};
