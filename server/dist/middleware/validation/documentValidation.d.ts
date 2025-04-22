export = DocumentValidation;
declare class DocumentValidation {
    static validateFileUpload(req: any, res: any, next: any): void;
    static validateImageDimensions(req: any, res: any, next: any): Promise<void>;
    static validateProcessingOptions(req: any, res: any, next: any): void;
    static validateBatchProcessing(req: any, res: any, next: any): void;
    static getValidationMiddleware(options?: {}): (typeof DocumentValidation.validateFileUpload)[];
}
