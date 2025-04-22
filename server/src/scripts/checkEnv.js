const logger = require('../utils/logger');

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'GOOGLE_APPLICATION_CREDENTIALS'
];

function checkEnv() {
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
  }

  logger.info('Environment variables validated successfully');
  return true;
}

module.exports = checkEnv;