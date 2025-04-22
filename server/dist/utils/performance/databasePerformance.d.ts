declare const _exports: DatabasePerformanceOptimizer;
export = _exports;
declare class DatabasePerformanceOptimizer {
    redisClient: any;
    getAsync: any;
    setAsync: any;
    delAsync: any;
    cachedQuery(cacheKey: any, queryFn: any, ttl?: number): Promise<any>;
    batchDatabaseOperations(operations: any, batchSize?: number): Promise<any[]>;
    createBatchWrite(collection: any): {
        add: (docRef: any, data: any) => void;
        update: (docRef: any, data: any) => void;
        commit: () => Promise<void>;
    };
    logQueryPerformance(cacheKey: any, start: any): void;
    logBatchOperationPerformance(operationCount: any, start: any): void;
    logBatchWritePerformance(operationCount: any, start: any): void;
}
