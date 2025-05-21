## Service Refactoring Architecture
/server/src/services/
  ├── core/
  │   └── BaseService.js
  ├── imageOptimization/
  │   ├── ImageOptimizationService.js
  │   └── ImageValidationService.js
  ├── textExtraction/
  │   ├── TextExtractionService.js
  │   ├── GoogleVisionAdapter.js
  │   └── TesseractAdapter.js
  ├── documentClassification/
  │   ├── DocumentClassificationService.js
  │   └── MLModelService.js
  ├── dataExtraction/
  │   ├── ReceiptDataExtractor.js
  │   └── InvoiceDataExtractor.js
  └── orchestration/
      └── DocumentProcessingOrchestrator.js

// Step 1: Create Base Service
Create: /server/src/services/core/BaseService.js
class BaseService {
  constructor() {
    this.logger = require('../../utils/logger');
  }
  
  async execute() {
    throw new Error('Method must be implemented');
  }
  
  handleError(error) {
    this.logger.error(error);
    throw new AppError(error.message, error.statusCode || 500);
  }
}

## Completed Steps
- Created `server/src/services/core/BaseService.js`.
- Created `server/src/services/imageOptimization/ImageOptimizationService.js`.
- Created `server/src/services/textExtraction/TextExtractionService.js`.
- Created `server/src/services/textExtraction/TesseractAdapter.js`.
- Created `server/src/services/textExtraction/GoogleVisionAdapter.js`.
- Created `server/src/services/orchestration/DocumentProcessingOrchestrator.js`.
- Created `server/src/utils/errorHandler.js`.
- Addressed the duplicate category service issue (Task 2.6) by creating and improving `server/src/services/inventory/categoryService.js` with update and delete functionality.
