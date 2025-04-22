const dotenv = require('dotenv');
const path = require('path');
const logger = require('../src/utils/logger'); //good

class ConfigurationService {
  constructor() {
    this.loadEnvironmentVariables();
    this.validateRequiredVariables();
    this.config = this.buildConfig();
  }

  loadEnvironmentVariables() {
    // Load environment variables from different files based on NODE_ENV
    const envFile = process.env.NODE_ENV === 'production' 
      ? '.env.production'
      : process.env.NODE_ENV === 'staging'
        ? '.env.staging'
        : '.env';

    dotenv.config({ path: path.resolve(process.cwd(), envFile) });
    
    // Also load common variables if they exist
    dotenv.config({ path: path.resolve(process.cwd(), '.env.common') });
  }

  validateRequiredVariables() {
    const requiredVariables = [
      'NODE_ENV',
      'PORT',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'GOOGLE_APPLICATION_CREDENTIALS'
    ];

    const missingVariables = requiredVariables.filter(
      variable => !process.env[variable]
    );

    if (missingVariables.length > 0) {
      const error = new Error(
        `Missing required environment variables: ${missingVariables.join(', ')}`
      );
      logger.error('Configuration Error:', error);
      throw error;
    }
  }

  buildConfig() {
    return {
      app: {
        env: process.env.NODE_ENV || 'development',
        port: parseInt(process.env.PORT, 10) || 5000,
        apiVersion: process.env.API_VERSION || 'v1',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
      },

      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: this._formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        databaseURL: process.env.FIREBASE_DATABASE_URL
      },

      vision: {
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
      },

      security: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
        bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 900000,
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100
      },

      uploads: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/heic'],
        storageDirectory: process.env.UPLOAD_DIR || 'uploads'
      },

      logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'app.log',
        maxSize: process.env.LOG_MAX_SIZE || '10m',
        maxFiles: process.env.LOG_MAX_FILES || '7d'
      }
    };
  }

  _formatPrivateKey(privateKey) {
    if (!privateKey) return null;
    return privateKey.replace(/\\n/g, '\n');
  }

  get(path) {
    return path.split('.').reduce((config, key) => {
      if (config && typeof config === 'object') {
        return config[key];
      }
      return undefined;
    }, this.config);
  }

  getAll() {
    return this.config;
  }

  validateConfig() {
    // Validate Firebase configuration
    if (!this.config.firebase.projectId || 
        !this.config.firebase.privateKey || 
        !this.config.firebase.clientEmail) {
      throw new Error('Invalid Firebase configuration');
    }

    // Validate security configuration
    if (!this.config.security.jwtSecret || 
        this.config.security.jwtSecret === 'your-secret-key') {
      logger.warn('Using default JWT secret. This is not secure for production.');
    }

    // Validate rate limiting
    if (this.config.security.rateLimitMax < 1) {
      throw new Error('Rate limit maximum must be greater than 0');
    }

    // Validate upload configuration
    if (this.config.uploads.maxFileSize < 1) {
      throw new Error('Maximum file size must be greater than 0');
    }

    // Validate logging configuration
    if (!['error', 'warn', 'info', 'debug'].includes(this.config.logging.level)) {
      throw new Error('Invalid logging level');
    }

    return true;
  }

  // Environment checks
  isDevelopment() {
    return this.config.app.env === 'development';
  }

  isProduction() {
    return this.config.app.env === 'production';
  }

  isTest() {
    return this.config.app.env === 'test';
  }

  // Helper methods for common configuration needs
  getFirebaseConfig() {
    return {
      type: 'service_account',
      project_id: this.config.firebase.projectId,
      private_key: this.config.firebase.privateKey,
      client_email: this.config.firebase.clientEmail
    };
  }

  getCorsConfig() {
    return {
      origin: this.config.app.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };
  }

  getRateLimitConfig() {
    return {
      windowMs: this.config.security.rateLimitWindow,
      max: this.config.security.rateLimitMax
    };
  }

  // Method to update configuration at runtime (if needed)
  updateConfig(path, value) {
    if (this.isDevelopment()) {
      const keys = path.split('.');
      let current = this.config;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      logger.info(`Configuration updated: ${path}`);
    } else {
      logger.warn('Configuration updates are only allowed in development mode');
    }
  }
}

module.exports = new ConfigurationService();