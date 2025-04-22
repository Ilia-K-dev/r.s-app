declare const _exports: ReceiptProcessingService;
export = _exports;
declare class ReceiptProcessingService {
    visionClient: vision.v1.ImageAnnotatorClient;
    collection: any;
    categories: {
        food: string[];
        beverages: string[];
        household: string[];
        electronics: string[];
        clothing: string[];
        health: string[];
        beauty: string[];
    };
    processReceipt(imageFile: any, userId: any): Promise<any>;
    _extractText(imageBuffer: any): Promise<{
        fullText: string | null | undefined;
        blocks: any;
        confidence: any;
    } | null>;
    _processTextBlocks(blocks: any): any;
    _parseReceiptData(extractedText: any): Promise<any>;
    _extractStoreName(lines: any): any;
    _extractDate(lines: any): Date;
    _extractItems(lines: any): {
        name: any;
        price: number;
        quantity: number;
        category: string;
    }[];
    _isNonItemLine(line: any): any;
    _extractTotals(lines: any): {
        subtotal: null;
        tax: null;
        total: null;
    };
    _extractPaymentMethod(text: any): string;
    _categorizeItem(name: any): string;
    _uploadImage(file: any, userId: any): Promise<any>;
    _saveToDatabase(receiptData: any): Promise<any>;
    _validateAndClean(receiptData: any): any;
    calculateUnitPrice(price: any, quantity: any, unit?: null): {
        price: number;
        unit: string;
    } | null;
    categorizePurchase(items: any): {
        categoryTotals: {};
        topCategory: null;
        topAmount: number;
    };
    formatReceiptData(receiptData: any): any;
    getReceipts(userId: any, filters?: {}): Promise<any>;
    getReceiptById(id: any, userId: any): Promise<any>;
    updateReceipt(id: any, userId: any, updateData: any): Promise<any>;
    deleteReceipt(id: any, userId: any): Promise<boolean>;
    generateReceiptSummary(receiptId: any, userId: any): Promise<{
        id: any;
        merchant: any;
        date: any;
        totalAmount: any;
        itemCount: any;
        categories: {};
        primaryCategory: null;
        averageItemPrice: number;
    }>;
    getReceiptStatistics(userId: any, timeframe?: string): Promise<{
        totalSpent: number;
        receiptCount: any;
        categoryTotals: {};
        averageReceiptAmount: number;
        topMerchants: {};
        itemCount: number;
    }>;
    searchReceipts(userId: any, searchParams: any): Promise<any>;
}
import vision = require("@google-cloud/vision");
