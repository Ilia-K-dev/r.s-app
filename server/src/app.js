require('dotenv').config(); 
require('./scripts/checkEnv');
require('module-alias/register');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const multer = require('multer');
const { admin, db } = require('../config/firebase');

// Import routes
const authRoutes = require('./routes/authRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const diagnosticRoutes = require('./routes/diagnosticRoutes');

// Import middleware
const { handleMulterError, upload } = require('./middleware/upload');
const { errorHandler } = require('./utils/error/errorHandler');
const { authenticateUser } = require('./middleware/auth/auth');

// Create Express app
const app = express();

// Configure rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

// Configure logger with enhanced formatting
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
}));

// CORS configuration with enhanced security
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(limiter);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Enhanced health check route
app.get('/health', async (req, res) => {
  try {
    // Test Firebase connection
    await db.collection('_test').doc('health_check').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    await db.collection('_test').doc('health_check').delete();

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      firebase: {
        initialized: admin.apps.length > 0,
        project: process.env.FIREBASE_PROJECT_ID,
        auth: !!admin.auth(),
        firestore: true
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Firebase diagnostic routes
app.get('/api/check-firebase', async (req, res) => {
  try {
    const testDoc = await db.collection('_test').doc('test').set({
      test: true,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection('_test').doc('test').delete();
    
    res.json({
      status: 'success',
      message: 'Firebase connection successful',
      firestore: true,
      auth: !!admin.auth(),
      apps: admin.apps.length
    });
  } catch (error) {
    logger.error('Firebase check error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Validate route modules before using them
function validateRouteModule(route, name) {
  if (!route) {
    logger.error(`Route module ${name} is undefined`);
    return false;
  }
  
  if (!route.stack) {
    logger.error(`Route module ${name} is not a valid Express Router`);
    return false;
  }

  // Validate route handlers
  const hasValidHandlers = route.stack.every(layer => {
    return layer.handle && typeof layer.handle === 'function';
  });

  if (!hasValidHandlers) {
    logger.error(`Route module ${name} contains invalid handlers`);
    return false;
  }

  return true;
}

// API Routes setup with validation
try {
  // Create main router
  const mainRouter = express.Router();
  
  // Define route configurations with validation
  const routeConfigs = [
    { 
      path: '/api/diagnostic', 
      router: diagnosticRoutes,
      name: 'diagnosticRoutes',
      protected: false
    },
    { 
      path: '/api/auth', 
      router: authRoutes,
      name: 'authRoutes',
      protected: false
    },
    { 
      path: '/api/receipts', 
      router: receiptRoutes,
      name: 'receiptRoutes',
      protected: process.env.NODE_ENV !== 'test' // Skip authentication in 'test' environment
    },
    { 
      path: '/api/reports', 
      router: reportRoutes,
      name: 'reportRoutes',
      protected: process.env.NODE_ENV !== 'test' // Skip authentication in 'test' environment
    },
    { 
      path: '/api/categories', 
      router: categoryRoutes,
      name: 'categoryRoutes',
      protected: process.env.NODE_ENV !== 'test' // Skip authentication in 'test' environment
    }
  ];

  // Mount each route with validation
  for (const config of routeConfigs) {
    if (validateRouteModule(config.router, config.name)) {
      if (config.protected) {
        mainRouter.use(config.path, authenticateUser, config.router);
      } else {
        mainRouter.use(config.path, config.router);
      }
      logger.info(`Route mounted successfully: ${config.name}`);
    } else {
      logger.error(`Failed to mount route: ${config.name}`);
    }
  }

  // Mount the main router to the app
  app.use('/', mainRouter);

  logger.info('All routes initialized successfully');
} catch (error) {
  logger.error('Error setting up routes:', {
    error: error.message,
    stack: error.stack
  });
  throw new Error('Failed to initialize routes: ' + error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Application error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: err.message || 'File upload error'
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  next(err);
});

// Final error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server with enhanced error handling
const PORT = process.env.PORT || 5000;
let server;

try {
  server = app.listen(PORT, () => {
    logger.info(`✅ Server is running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', {
      error: err.message,
      stack: err.stack
    });
    
    if (server) {
      server.close(() => {
        logger.info('Server closed due to unhandled promise rejection');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', {
      error: err.message,
      stack: err.stack
    });
    
    if (server) {
      server.close(() => {
        logger.info('Server closed due to uncaught exception');
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });

} catch (error) {
  logger.error('Failed to start server:', error);
  process.exit(1);
}

module.exports = app;