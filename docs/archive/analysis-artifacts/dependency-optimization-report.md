## Dependencies to Remove/Replace
const dependencyChanges = {
  client: {
    remove: [
      '@heroicons/react',
      'react-chartjs-2',
      'chart.js',
      'react-native-chart-kit'
    ],
    add: [
      'recharts',  // Single charting library
      'framer-motion' // For modern animations
    ],
    keep: [
      'lucide-react' // Only icon library
    ]
  },
  server: {
    remove: [],
    add: [
      'tesseract.js',
      'node-cache'  // For response caching
    ]
  }
};

// Step 1: Update package.json files
// Remove unused dependencies
updatePackageJson('client', {
  remove: [
    '@heroicons/react',
    'react-chartjs-2',
    'chart.js',
    'react-native-chart-kit'
  ],
  add: [
    'recharts',
    'framer-motion'
  ]
});

// **PAUSE**: Ask human to run npm uninstall and npm install commands

## Completed Steps
- Updated `client/package.json` to remove unused dependencies and add `recharts` and `framer-motion`.
