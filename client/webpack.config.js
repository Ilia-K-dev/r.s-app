// Modified as part of build error fix task on 2025-05-08, 4:17:39 AM
// Replaced webpack configuration with a simplified version to fix the entry point validation error and stream module resolution issues.
// Added console logs for debugging.
const path = require('path');
const webpack = require('webpack');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

// Used for debugging - helpful to see what's happening
console.log('Loading custom webpack configuration...');

module.exports = async function(env, argv) {
  console.log('Creating Expo webpack config...');
  // Get base Expo configuration
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  console.log('Customizing webpack config...');
  // Add plugins for process and Buffer
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  );
  
  // Configure fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    process: require.resolve('process/browser'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    util: require.resolve('util/'),
  };
  
  // Configure aliases
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
    'process': require.resolve('process/browser'),
    'readable-stream': path.resolve(__dirname, 'node_modules/readable-stream'),
  };
  
  // THIS IS THE CRITICAL CHANGE - explicitly set entry as an array
  console.log('Setting entry configuration to array format...');
  config.entry = [
    path.resolve(__dirname, 'src/index.js')
  ];
  
  console.log('Webpack configuration customization complete!');
  return config;
};
