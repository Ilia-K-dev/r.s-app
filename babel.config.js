// File: babel.config.js
// Date: 2025-05-12 11:11:43
// Description: Babel configuration for the project.
// Reasoning: Configures Babel presets and plugins for compiling JavaScript/TypeScript code, including module resolution for the client. Updated to potentially fix module resolution for server tests.
// Potential Optimizations: Investigate a more robust solution for module resolution in server tests if the current fix is insufficient.

module.exports = function(api) {
  if (api) { // Check if api is defined
    api.cache(true);
  }
  return {
    presets: [
      '@babel/preset-react',
      'babel-preset-expo',
      ['@babel/preset-env', { targets: { node: 'current' } }]
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './client/src',
          },
          // Explicitly set the current working directory to the project root
          // This helps resolve the plugin correctly when running tests in subdirectories
          cwd: 'babelrc', // 'babelrc' means the directory containing the config file
        },
      ],
    ],
  };
};
