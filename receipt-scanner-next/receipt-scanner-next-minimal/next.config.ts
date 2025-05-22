import type { NextConfig } from "next";
import path from 'path';

// Last Modified: 5/10/2025, 12:42:59 AM
// Note: Fixed ESLint error by removing unused 'isServer' parameter from webpack config.
// Last Modified: 5/10/2025, 12:42:27 AM
// Note: Configured webpack for React Native Web transpilation and added path aliases.

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Transpile React Native Web and other React Native libraries
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: [
        path.resolve(__dirname, 'node_modules/react-native-web'),
        // Add other React Native libraries here if needed
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-react', '@babel/preset-typescript'],
        },
      },
    });

    // Resolve React Native to React Native Web
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    };

    // Add .web extensions
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];

    return config;
  },
};

export default nextConfig;
