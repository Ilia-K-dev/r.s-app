"use strict";
const { db } = require('/server/config/firebase'); //good
const redis = require('redis');
const { promisify } = require('util');
class DatabasePerformanceOptimizer {
    constructor() {
        // Initialize Redis client for caching
        this.redisClient = redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
        });
        // Promisify Redis methods
        this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
        this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
        this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);
    }
    // Cached database query with performance tracking
    async cachedQuery(cacheKey, queryFn, ttl = 300) {
        const start = Date.now();
        try {
            // Check cache first
            const cachedData = await this.getAsync(cacheKey);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            // Execute query
            const result = await queryFn();
            // Cache the result
            await this.setAsync(cacheKey, JSON.stringify(result), 'EX', ttl);
            // Log query performance
            this.logQueryPerformance(cacheKey, start);
            return result;
        }
        catch (error) {
            console.error(`Cached query error for ${cacheKey}:`, error);
            throw error;
        }
    }
    // Batch database operations with performance tracking
    async batchDatabaseOperations(operations, batchSize = 10) {
        const start = Date.now();
        const results = [];
        for (let i = 0; i < operations.length; i += batchSize) {
            const batch = operations.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(op => op()));
            results.push(...batchResults);
        }
        this.logBatchOperationPerformance(results.length, start);
        return results;
    }
    // Create performance-optimized batch write
    createBatchWrite(collection) {
        const batch = db.batch();
        const operations = [];
        return {
            add: (docRef, data) => {
                operations.push(() => {
                    const ref = collection.doc(docRef);
                    batch.set(ref, data);
                    return ref;
                });
            },
            update: (docRef, data) => {
                operations.push(() => {
                    const ref = collection.doc(docRef);
                    batch.update(ref, data);
                    return ref;
                });
            },
            commit: async () => {
                const start = Date.now();
                await batch.commit();
                this.logBatchWritePerformance(operations.length, start);
            }
        };
    }
    // Performance logging methods
    logQueryPerformance(cacheKey, start) {
        const duration = Date.now() - start;
        console.log(`Query Performance [${cacheKey}]: ${duration}ms`);
    }
    logBatchOperationPerformance(operationCount, start) {
        const duration = Date.now() - start;
        console.log(`Batch Operation Performance: 
      - Operations: ${operationCount}
      - Duration: ${duration}ms
      - Average: ${duration / operationCount}ms per operation
    `);
    }
    logBatchWritePerformance(operationCount, start) {
        const duration = Date.now() - start;
        console.log(`Batch Write Performance: 
      - Documents: ${operationCount}
      - Duration: ${duration}ms
      - Average: ${duration / operationCount}ms per document
    `);
    }
}
module.exports = new DatabasePerformanceOptimizer();
