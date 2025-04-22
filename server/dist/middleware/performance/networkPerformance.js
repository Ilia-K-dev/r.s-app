"use strict";
const os = require('os');
const networkPerformanceMiddleware = (req, res, next) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    // Track network interfaces
    const networkInterfaces = os.networkInterfaces();
    // Attach performance tracking to response
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const memoryUsed = (process.memoryUsage().heapUsed - startMemory) / 1024 / 1024;
        console.log('Network Performance Metrics:', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            memoryUsed: `${memoryUsed.toFixed(2)}MB`,
            requestSize: req.socket.bytesRead,
            responseSize: req.socket.bytesWritten,
            network: Object.keys(networkInterfaces).reduce((acc, interfaceName) => {
                const iface = networkInterfaces[interfaceName];
                acc[interfaceName] = iface.find(details => details.family === 'IPv4')?.address;
                return acc;
            }, {})
        });
    });
    next();
};
module.exports = networkPerformanceMiddleware;
