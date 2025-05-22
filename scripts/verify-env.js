// Created as part of build error fix task on 2025-05-08, 3:26:27 AM
// Pre-build script to verify the presence of required environment variables.

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.development
const envPath = path.resolve(__dirname, '../client/.env.development'); // Corrected path to client/.env.development
let envFileExists = false;

try {
  fs.accessSync(envPath, fs.constants.R_OK);
  envFileExists = true;
  console.log('✅ .env.development file found');
} catch (err) {
  console.error('❌ Error: .env.development file not found or not readable');
  console.error('Please create a .env.development file with the required environment variables in the client directory.'); // Updated message
  process.exit(1);
}

// Try to parse .env file
if (envFileExists) {
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.error('❌ Error parsing .env.development file:', result.error.message);
    process.exit(1);
  }
  
  console.log('✅ .env.development file parsed successfully');
  
  // Check for required Firebase environment variables
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(key => !process.env[key]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are present');
  
  // Mask sensitive values for logging
  const envVars = Object.keys(process.env)
    .filter(key => key.startsWith('REACT_APP_'))
    .map(key => {
      const value = process.env[key];
      const masked = key.includes('API_KEY') || key.includes('APP_ID') 
        ? `${value.substring(0, 3)}...${value.substring(value.length - 3)}`
        : value;
      return `${key}: ${masked}`;
    });
  
  console.log('Environment variables found:', envVars.join(', '));
}

console.log('Environment verification completed');
