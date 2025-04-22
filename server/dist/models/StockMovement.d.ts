export = StockMovement;
declare class StockMovement {
    static findByProduct(productId: any, options?: {}): Promise<any>;
    static findByDateRange(userId: any, startDate: any, endDate: any): Promise<any>;
    constructor(data: any);
    id: any;
    userId: any;
    productId: any;
    type: any;
    quantity: any;
    previousStock: any;
    newStock: any;
    reason: any;
    reference: any;
    date: any;
    location: any;
    cost: any;
    notes: any;
    metadata: {
        createdAt: any;
        createdBy: any;
        documentType: any;
        documentId: any;
    };
    save(): Promise<this>;
    validate(): string[];
    toJSON(): {
        userId: any;
        productId: any;
        type: any;
        quantity: any;
        previousStock: any;
        newStock: any;
        reason: any;
        reference: any;
        date: any;
        location: any;
        cost: any;
        notes: any;
        metadata: {
            createdAt: any;
            createdBy: any;
            documentType: any;
            documentId: any;
        };
    };
}
