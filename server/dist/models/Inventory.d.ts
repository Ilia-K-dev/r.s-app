export = Inventory;
declare class Inventory {
    static findByUserId(userId: any, filters?: {}): Promise<any>;
    constructor(data: any);
    id: any;
    userId: any;
    productId: any;
    quantity: any;
    unit: any;
    location: any;
    reorderPoint: any;
    maxStock: any;
    lastStockUpdate: any;
    status: string;
    batchInfo: any;
    createdAt: any;
    updatedAt: string;
    save(): Promise<this>;
    toJSON(): {
        userId: any;
        productId: any;
        quantity: any;
        unit: any;
        location: any;
        reorderPoint: any;
        maxStock: any;
        lastStockUpdate: any;
        status: string;
        batchInfo: any;
        createdAt: any;
        updatedAt: string;
    };
    calculateStatus(): "low_stock" | "out_of_stock" | "overstocked" | "in_stock";
    updateQuantity(change: any, batchInfo?: {}): this;
    setReorderPoint(point: any): this;
}
