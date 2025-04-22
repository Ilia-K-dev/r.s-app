declare const _exports: InventoryManagementService;
export = _exports;
declare class InventoryManagementService {
    alertThresholds: {
        lowStock: number;
        criticalStock: number;
        overstock: number;
    };
    stockMovementTypes: {
        ADD: string;
        REMOVE: string;
        ADJUST: string;
        TRANSFER: string;
    };
    updateStock(productId: any, quantity: any, type: any, metadata?: {}): Promise<{
        success: boolean;
        currentStock: any;
        movement: {
            productId: any;
            type: any;
            quantity: any;
            previousStock: any;
            newStock: any;
            date: Date;
            metadata: {};
            userId: any;
        };
    }>;
    getInventoryStatus(userId: any, options?: {}): Promise<{
        summary: {
            totalProducts: any;
            totalValue: any;
            averageValue: any;
        };
        stockStatus: any;
        valueMetrics: any;
        turnoverMetrics: any;
        alerts: any;
    }>;
    transferStock(fromProductId: any, toProductId: any, quantity: any, metadata?: {}): Promise<boolean>;
    adjustStockLevels(productId: any, adjustments: any): Promise<{
        success: boolean;
        productId: any;
        updates: any;
    }>;
    _checkStockLevels(product: any, newStock: any): Promise<{
        type: string;
        level: string;
        message: string;
        threshold: any;
        currentStock: any;
    }[]>;
    _calculateNewStock(currentStock: any, quantity: any, type: any): any;
    _createAlerts(alerts: any, productId: any): Promise<void>;
    _calculateStockMetrics(currentStock: any, product: any): {
        daysOfStock: number;
        stockValue: number;
        turnoverRate: number;
        lastStockUpdate: Date;
    };
    _calculateDaysOfStock(currentStock: any, product: any): number;
    _calculateTurnoverRate(product: any): number;
}
