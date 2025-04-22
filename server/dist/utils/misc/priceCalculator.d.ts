declare const _exports: PriceCalculator;
export = _exports;
declare class PriceCalculator {
    unitConversions: {
        mg: number;
        g: number;
        kg: number;
        oz: number;
        lb: number;
        ml: number;
        l: number;
        gal: number;
        fl_oz: number;
        mm: number;
        cm: number;
        m: number;
        in: number;
        ft: number;
        pc: number;
        pack: number;
        dozen: number;
    };
    calculateUnitPrice(price: any, quantity: any, fromUnit: any, toUnit?: null): {
        unitPrice: number;
        baseUnit: string;
    } | {
        unitPrice: number;
        baseUnit: null;
    };
    extractUnitFromString(text: any): {
        unit: any;
        type: string;
    } | null;
    standardizeUnit(unit: any): any;
    compareUnitPrices(items: any): any;
    calculateBulkDiscount(regularPrice: any, bulkPrice: any, regularQty: any, bulkQty: any): {
        regularUnitPrice: number;
        bulkUnitPrice: number;
        savings: number;
        savingsPercentage: number;
        recommendation: string;
    };
    formatPrice(price: any, currency?: string): string;
}
