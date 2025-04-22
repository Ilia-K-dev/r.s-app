"use strict";
const winston = require('winston');
const performanceMonitoring = (req, res, next) => {
    const start = Date.now();
    // Patch the res.end method to calculate response time
    const originalEnd = res.end;
    res.end = function (...args) {
        const duration = Date.now() - start;
        // Log performance metrics
        winston.info({
            message: 'API Request',
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            timestamp: new Date().toISOString(),
            requestBody: req.body,
            userAgent: req.get('User-Agent')
        });
        // Call the original end method
        originalEnd.apply(this, args);
    };
    next();
};
module.exports = performanceMonitoring;
