export = PerformanceOptimizer;
declare class PerformanceOptimizer {
    static measureExecutionTime(fn: any): (...args: any[]) => Promise<any>;
    static cacheMethod(ttl?: number): (target: any, key: any, descriptor: any) => any;
    static batchOperations(operations: any, concurrencyLimit?: number): Promise<any[]>;
}
