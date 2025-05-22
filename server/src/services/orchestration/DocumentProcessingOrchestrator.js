// Last updated: 2025-05-08 12:46:36
const BaseService = require('../core/BaseService');
const DocumentProcessingService = require('../document/DocumentProcessingService'); // Import DocumentProcessingService

class DocumentProcessingOrchestrator extends BaseService {
  constructor() {
    super();
    this.documentProcessingService = new DocumentProcessingService(); // Use the actual service
    // Remove placeholder service instantiations
    // this.imageOptimizer = new ImageOptimizationService();
    // this.textExtractor = new TextExtractionService();
    // this.classifier = new DocumentClassificationService();
    // this.dataExtractor = new DataExtractionService();
  }
  
  async processDocument(file, userId) { // Accept file and userId directly
    try {
      // Orchestrate the processing steps using DocumentProcessingService methods
      const processedResult = await this.documentProcessingService.processDocument(file, userId);

      // The orchestrator returns the processed result
      return processedResult;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Removed placeholder methods
  // async fetchDocument(documentId, userId) { ... }
  // async saveProcessedDocument(documentId, processedData) { ... }
}
