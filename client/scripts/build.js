#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const clientDir = path.resolve(__dirname, '../');
const buildDir = path.resolve(clientDir, 'build');

// 1. Validate environment variables
console.log('✨ Validating client environment variables...');
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID',
  'REACT_APP_FRONTEND_URL',
];

const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please ensure your .env.production file is correctly configured.');
  process.exit(1);
}
console.log('✅ Environment variables validated.');

// 2. Clean previous builds
console.log('✨ Cleaning previous build directory...');
try {
  fs.emptyDirSync(buildDir);
  console.log('✅ Previous build directory cleaned.');
} catch (error) {
  console.error('❌ Failed to clean build directory:', error);
  process.exit(1);
}

// 3. Run the production build process
console.log('✨ Running production build...');
try {
  // Use the npm script defined in package.json
  execSync('npm run build:web', { cwd: clientDir, stdio: 'inherit' });
  console.log('✅ Production build completed.');
} catch (error) {
  console.error('❌ Production build failed:', error);
  process.exit(1);
}

// 4. Verify the build output (Placeholder)
console.log('✨ Verifying build output (Placeholder)...');
// Add checks here, e.g., check if index.html exists, check for expected asset files
if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
    console.error('❌ Build verification failed: index.html not found.');
    process.exit(1);
}
console.log('✅ Build output verified (Basic check).');


// 5. Prepare for deployment (Placeholder)
console.log('✨ Preparing for deployment (Placeholder)...');
// Add steps here, e.g., copying build files to a deployment directory, zipping
console.log('✅ Preparation for deployment completed (Placeholder).');

console.log('🚀 Client build process finished.');
