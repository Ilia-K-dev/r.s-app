declare const _exports: DocumentClassifier;
export = _exports;
declare class DocumentClassifier {
    documentTypes: {
        receipt: {
            keywords: string[];
            patterns: RegExp[];
            confidence: number;
            metadataFields: string[];
        };
        invoice: {
            keywords: string[];
            patterns: RegExp[];
            confidence: number;
            metadataFields: string[];
        };
        warranty: {
            keywords: string[];
            patterns: RegExp[];
            confidence: number;
            metadataFields: string[];
        };
    };
    vendorPatterns: {
        header: RegExp;
        website: RegExp;
        phone: RegExp;
        address: RegExp;
    };
    classifyDocument(textData: any): Promise<{
        type: string;
        confidence: any;
        vendor: {
            name: null;
            website: null;
            phone: null;
            address: null;
            confidence: number;
        };
        metadata: any;
        possibleTypes: {
            type: string;
            confidence: any;
        }[];
        textQuality: {
            score: number;
            confidence: number;
            hasErrors: any;
        };
        layoutAnalysis: {
            columns: number[];
            orientation: {
                angle: number;
                confidence: number;
            };
            sections: any[];
        };
    }>;
    _calculateScore(fullText: any, blocks: any, criteria: any): number;
    _extractVendorInfo(fullText: any, blocks: any): {
        name: null;
        website: null;
        phone: null;
        address: null;
        confidence: number;
    };
    _extractMetadata(text: any, fields: any): {};
    _analyzeStructure(blocks: any): number;
    _analyzeLayout(blocks: any): {
        columns: number[];
        orientation: {
            angle: number;
            confidence: number;
        };
        sections: any[];
    };
    _assessTextQuality(blocks: any): {
        score: number;
        confidence: number;
        hasErrors: any;
    };
    _detectColumns(blocks: any): number[];
    _detectOrientation(blocks: any): {
        angle: number;
        confidence: number;
    };
    _identifySections(blocks: any): any[];
    _isLikelyHeader(block: any): boolean;
}
