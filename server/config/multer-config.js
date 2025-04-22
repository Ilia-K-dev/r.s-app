require('dotenv').config();
require('/src/scripts/checkEnv');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const receiptRoutes = require('../src/routes/receiptRoutes'); //good
const reportRoutes = require('../src/routes/reportRoutes'); //good
const categoryRoutes = require('../src/routes/categoryRoutes'); //good

const { handleMulterError } = require('./multer-config'); //good

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route for basic API check
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);

// Error handling middleware
app.use(handleMulterError);
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

module.exports = app;
