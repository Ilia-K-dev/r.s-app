export = Product;
declare class Product {
    static findById(id: any): Promise<Product | null>;
    static findByBarcode(userId: any, barcode: any): Promise<Product | null>;
    static findByUser(userId: any, filters?: {}): Promise<any>;
    constructor(data: any);
    id: any;
    userId: any;
    name: any;
    category: any;
    description: any;
    sku: any;
    barcode: any;
    currentStock: any;
    unit: any;
    unitPrice: any;
    minStockLevel: any;
    maxStockLevel: any;
    reorderPoint: any;
    reorderQuantity: any;
    vendors: any;
    location: any;
    tags: any;
    status: any;
    priceHistory: any;
    metadata: {
        createdAt: any;
        lastModified: any;
        lastStockUpdate: any;
        lastPriceUpdate: any;
    };
    save(): Promise<this>;
    updateStock(quantity: any, type?: string, reason?: string): Promise<{
        date: Date;
        type: "add" | "subtract" | "set";
        quantity: any;
        previousStock: any;
        newStock: any;
        reason: string;
    }>;
    updatePrice(newPrice: any, reason?: string): Promise<void>;
    checkStockAlerts(): Promise<({
        type: string;
        message: string;
        level: string;
        suggestedQuantity?: undefined;
    } | {
        type: string;
        message: string;
        level: string;
        suggestedQuantity: any;
    })[]>;
    validate(): string[];
    toJSON(): {
        userId: any;
        name: any;
        category: any;
        description: any;
        sku: any;
        barcode: any;
        currentStock: any;
        unit: any;
        unitPrice: any;
        minStockLevel: any;
        maxStockLevel: any;
        reorderPoint: any;
        reorderQuantity: any;
        vendors: any;
        location: any;
        tags: any;
        status: any;
        priceHistory: any;
        metadata: {
            createdAt: any;
            lastModified: any;
            lastStockUpdate: any;
            lastPriceUpdate: any;
        };
    };
}
