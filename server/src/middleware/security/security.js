const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT || 100,
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  },
});

// Security middleware
const securityMiddleware = [
  helmet(),
  mongoSanitize(),
  xss(),
];

module.exports = {
  limiter,
  securityMiddleware,
};
