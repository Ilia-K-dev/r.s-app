declare const _exports: StockTrackingService;
export = _exports;
declare class StockTrackingService {
    trackStockMovement(data: any): Promise<{
        productId: any;
        type: any;
        quantity: any;
        previousStock: any;
        newStock: any;
        reason: any;
        reference: any;
        location: any;
        userId: any;
        timestamp: Date;
        batchNumber: string;
    }>;
    getCurrentStock(productId: any): Promise<any>;
    _updateCurrentStock(productId: any, newStock: any): Promise<void>;
    getStockHistory(productId: any, options?: {}): Promise<any>;
    getStockByLocation(locationId: any): Promise<any>;
    stockAudit(productId: any): Promise<{
        productId: any;
        timestamp: Date;
        calculatedStock: any;
        actualStock: any;
        discrepancy: number;
        movements: any;
        status: string;
    }>;
    _checkStockLevels(productId: any, currentStock: any): Promise<{
        type: string;
        level: string;
        message: string;
    }[]>;
    _generateBatchNumber(): Promise<string>;
}
