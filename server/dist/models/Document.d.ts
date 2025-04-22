export = Document;
declare class Document {
    static findByUserId(userId: any, filters?: {}): Promise<any>;
    constructor(data: any);
    id: any;
    userId: any;
    type: any;
    source: any;
    metadata: any;
    extractedText: any;
    processedData: any;
    tags: any;
    confidence: any;
    status: any;
    fileUrl: any;
    createdAt: any;
    processedAt: any;
    save(): Promise<this>;
    toJSON(): {
        userId: any;
        type: any;
        source: any;
        metadata: any;
        extractedText: any;
        processedData: any;
        tags: any;
        confidence: any;
        status: any;
        fileUrl: any;
        createdAt: any;
        processedAt: any;
    };
    addTags(newTags: any): this;
    updateProcessingStatus(status: any, processedData?: {}): this;
}
