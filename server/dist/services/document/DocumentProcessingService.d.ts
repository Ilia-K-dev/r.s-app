declare const _exports: DocumentProcessingService;
export = _exports;
declare class DocumentProcessingService {
    visionClient: vision.v1.ImageAnnotatorClient;
    processingConfig: {
        maxWidth: number;
        maxHeight: number;
        quality: number;
        defaultFormat: string;
        documentTypes: {
            receipt: {
                keywords: string[];
                patterns: RegExp[];
                confidence: number;
            };
            invoice: {
                keywords: string[];
                patterns: RegExp[];
                confidence: number;
            };
            prescription: {
                keywords: string[];
                patterns: RegExp[];
                confidence: number;
            };
            identification: {
                keywords: string[];
                patterns: RegExp[];
                confidence: number;
            };
        };
    };
    processDocument(file: any, userId: any): Promise<{
        documentType: string;
        confidence: any;
        processedData: {
            vendor: any;
            date: Date;
            items: {
                name: string;
                price: number;
                quantity: number;
            }[];
            total: number | null;
            paymentMethod: string;
            type: string;
        } | {
            invoiceNumber: any;
            date: Date;
            total: number | null;
            items: {
                itemCode: any;
                description: string;
                name: string;
                price: number;
                quantity: number;
            }[];
            type: string;
        } | {
            type: string;
            text: any;
        };
        imageUrl: any;
        metadata: {
            originalFileName: any;
            processedAt: Date;
            textLayout: {
                blocks: any;
                layout: any;
                orientation: number;
            };
        };
    }>;
    classifyDocument(extractedText: any): Promise<{
        type: string;
        confidence: any;
    }>;
    _optimizeImage(buffer: any): Promise<any>;
    _enhanceImage(pipeline: any, metadata: any, stats: any): Promise<any>;
    _extractText(imageBuffer: any): Promise<{
        fullText: string | null | undefined;
        blocks: any;
        layout: {
            columns: number[];
            alignment: any;
            tables: any[];
            orientation: number;
        };
        confidence: any;
        language: string;
    }>;
    _processTextBlocks(blocks: any): any;
    _classifyDocumentType(textData: any): {
        type: string;
        confidence: any;
    };
    _processBasedOnType(textData: any, documentType: any): Promise<{
        vendor: any;
        date: Date;
        items: {
            name: string;
            price: number;
            quantity: number;
        }[];
        total: number | null;
        paymentMethod: string;
        type: string;
    } | {
        invoiceNumber: any;
        date: Date;
        total: number | null;
        items: {
            itemCode: any;
            description: string;
            name: string;
            price: number;
            quantity: number;
        }[];
        type: string;
    } | {
        type: string;
        text: any;
    }>;
    _processReceipt(textData: any): {
        vendor: any;
        date: Date;
        items: {
            name: string;
            price: number;
            quantity: number;
        }[];
        total: number | null;
        paymentMethod: string;
        type: string;
    };
    _processInvoice(textData: any): {
        invoiceNumber: any;
        date: Date;
        total: number | null;
        items: {
            itemCode: any;
            description: string;
            name: string;
            price: number;
            quantity: number;
        }[];
        type: string;
    };
    _getBoundingBox(boundingBox: any): {
        left: number;
        right: number;
        top: number;
        bottom: number;
        vertices: any;
    } | null;
    _analyzeLayout(blocks: any): {
        columns: number[];
        alignment: any;
        tables: any[];
        orientation: number;
    };
    _extractVendor(text: any): any;
    _extractDate(text: any): Date;
    _extractReceiptItems(text: any): {
        name: string;
        price: number;
        quantity: number;
    }[];
    _extractInvoiceItems(text: any): {
        itemCode: any;
        description: string;
        name: string;
        price: number;
        quantity: number;
    }[];
    _extractTotal(text: any): number | null;
    _extractPaymentMethod(text: any): string;
    _needsProcessing(metadata: any): boolean;
    _needsQualityReduction(metadata: any): boolean;
    _needsEnhancement(metadata: any): boolean;
    _needsContrastEnhancement(stats: any): boolean;
    _needsGammaCorrection(stats: any): boolean;
    _isDocument(metadata: any, stats: any): Promise<any>;
    _isPhoto(metadata: any, stats: any): Promise<boolean>;
    _analyzeTextLayout(extractedText: any): {
        blocks: any;
        layout: any;
        orientation: number;
    };
    _detectColumns(blocks: any): number[];
    _detectAlignment(blocks: any): any;
    _findColumnAlignment(bounds: any): "left" | "right" | "center" | "justified";
    _detectTables(blocks: any): any[];
    _isLikelyTableRow(block: any, prevBlock: any, nextBlock: any): any;
    _detectOrientation(boundingBox: any): 0 | 90;
    _detectDocumentOrientation(blocks: any): 0 | 90;
    _detectLanguage(text: any): string;
    _calculateDocumentTypeScore(text: any, criteria: any): number;
    _calculateDimensions(metadata: any): {
        width: any;
        height: any;
    };
    extractItemCode(itemName: any): any;
    _uploadImage(file: any, userId: any, buffer: any): Promise<any>;
}
import vision = require("@google-cloud/vision");
