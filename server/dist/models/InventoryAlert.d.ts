export = InventoryAlert;
declare class InventoryAlert {
    static findActiveAlerts(userId: any): Promise<any>;
    static findByProduct(productId: any): Promise<any>;
    static findCriticalAlerts(userId: any): Promise<any>;
    constructor(data: any);
    id: any;
    userId: any;
    productId: any;
    type: any;
    message: any;
    level: any;
    status: any;
    suggestedAction: any;
    actionData: any;
    createdAt: any;
    resolvedAt: any;
    resolvedBy: any;
    metadata: {
        currentStock: any;
        threshold: any;
        triggerValue: any;
        previousPrice: any;
        newPrice: any;
    };
    save(): Promise<this>;
    resolve(userId: any, notes?: string): Promise<void>;
    dismiss(userId: any, reason?: string): Promise<void>;
    validate(): string[];
    toJSON(): {
        userId: any;
        productId: any;
        type: any;
        message: any;
        level: any;
        status: any;
        suggestedAction: any;
        actionData: any;
        createdAt: any;
        resolvedAt: any;
        resolvedBy: any;
        metadata: {
            currentStock: any;
            threshold: any;
            triggerValue: any;
            previousPrice: any;
            newPrice: any;
        };
    };
}
