export = Vendor;
declare class Vendor {
    static findByUserId(userId: any): Promise<any>;
    constructor(data: any);
    id: any;
    name: any;
    userId: any;
    address: any;
    contactInfo: any;
    tags: any;
    productCategories: any;
    performanceMetrics: {
        averagePrice: any;
        totalPurchases: any;
        lastPurchaseDate: any;
    };
    createdAt: any;
    updatedAt: string;
    save(): Promise<this>;
    toJSON(): {
        name: any;
        userId: any;
        address: any;
        contactInfo: any;
        tags: any;
        productCategories: any;
        performanceMetrics: {
            averagePrice: any;
            totalPurchases: any;
            lastPurchaseDate: any;
        };
        createdAt: any;
        updatedAt: string;
    };
    updatePerformanceMetrics(purchaseData: any): this;
}
