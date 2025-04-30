const logger = require('../utils/logger');

// List of essential environment variables for server operation
const requiredEnvVars = [
  // Firebase Admin SDK Credentials (using Service Account Key is recommended)
  'GOOGLE_APPLICATION_CREDENTIALS', // Path to service account key file (used by Vision API client too)
  'FIREBASE_PROJECT_ID',          // Project ID (needed for Admin SDK init if not using GOOGLE_APPLICATION_CREDENTIALS fully, good practice anyway)
  // 'FIREBASE_CLIENT_EMAIL',     // Needed only if using individual key parts instead of file
  // 'FIREBASE_PRIVATE_KEY',      // Needed only if using individual key parts instead of file

  // Server Configuration
  'PORT',                         // Port the server will listen on
  'FRONTEND_URL',                 // Allowed origin for CORS
  
  // Add other critical variables like JWT_SECRET if used
  // 'JWT_SECRET', 
];

/**
 * Validates that all required environment variables are set.
 * Exits the process if any required variable is missing.
 */
function checkEnv() {
  logger.info('Validating required environment variables...');
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    logger.error('FATAL ERROR: Missing required environment variables:', missingVars.join(', '));
    logger.error('Please ensure all required variables are set in your .env file or system environment.');
    process.exit(1); // Exit if critical configuration is missing
  }

  // Optionally log the path being used for credentials for easier debugging
  if(process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    logger.info(`Using Google Application Credentials file: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
  }
  
  logger.info('Environment variables validated successfully.');
  return true;
}

// Execute the check immediately when the script is required
checkEnv();

module.exports = checkEnv; // Export if needed elsewhere, though immediate execution is common
