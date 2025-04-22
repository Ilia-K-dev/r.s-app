"use strict";
const logger = require('../logger'); //good
class PerformanceOptimizer {
    static measureExecutionTime(fn) {
        return async (...args) => {
            const start = Date.now();
            try {
                const result = await fn(...args);
                const executionTime = Date.now() - start;
                if (executionTime > 1000) {
                    logger.warn(`Slow function execution: ${fn.name} took ${executionTime}ms`);
                }
                return result;
            }
            catch (error) {
                logger.error(`Error in ${fn.name}:`, error);
                throw error;
            }
        };
    }
    static cacheMethod(ttl = 300000) {
        return (target, key, descriptor) => {
            const originalMethod = descriptor.value;
            const cacheKey = `__cache_${key}`;
            descriptor.value = async function (...args) {
                const now = Date.now();
                if (this[cacheKey] &&
                    (now - this[cacheKey].timestamp) < ttl) {
                    return this[cacheKey].value;
                }
                const result = await originalMethod.apply(this, args);
                this[cacheKey] = {
                    value: result,
                    timestamp: now
                };
                return result;
            };
            return descriptor;
        };
    }
    static async batchOperations(operations, concurrencyLimit = 5) {
        const results = [];
        const queue = [...operations];
        const inProgress = new Set();
        while (queue.length > 0 || inProgress.size > 0) {
            while (inProgress.size < concurrencyLimit && queue.length > 0) {
                const operation = queue.shift();
                const promise = operation().then(result => {
                    inProgress.delete(promise);
                    return result;
                }, error => {
                    inProgress.delete(promise);
                    throw error;
                });
                inProgress.add(promise);
                results.push(promise);
            }
            await Promise.race(inProgress);
        }
        return Promise.all(results);
    }
}
module.exports = PerformanceOptimizer;
