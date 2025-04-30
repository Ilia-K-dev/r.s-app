# Service Consolidation Report (Cleanup Session 2025-04-29)

**Author:** Cline (AI Engineer)
**Objective:** Consolidate redundant service logic identified during the project audit, improving maintainability and centralizing functionality.

## 1. Document Processing Services (Server-Side)

*   **Files Involved:**
    *   Target Service: `server/src/services/document/documentService.js`
    *   Redundant Service 1: `server/extra/visionService.js`
    *   Redundant Service 2: `server/extra/documentClassifier.js`
*   **Analysis:**
    *   `visionService.js` contained logic for initializing the Google Vision client and extracting text from an image buffer (`extractText`). It also duplicated file upload logic using the Admin SDK.
    *   `documentClassifier.js` contained a class with methods to classify document text (receipt, invoice, warranty), extract metadata based on type, extract vendor info, and perform basic layout/quality analysis.
    *   `documentService.js` initially only contained the `handleUpload` function (using Admin SDK).
*   **Consolidation Actions:**
    1.  **Vision Client Initialization:** Moved Vision client initialization from `visionService.js` to the top level of `documentService.js`.
    2.  **Text Extraction:** Integrated the `extractText` logic from `visionService.js` into `documentService.js` as `extractTextFromGcsUri`, modifying it to accept a GCS URI (obtained after upload) instead of an image buffer for better efficiency with the Vision API.
    3.  **Classification Logic:** Copied the `DocumentClassifier` class's methods (`classifyDocument`, `_calculateScore`, `_extractVendorInfo`, `_extractMetadata`, `_analyzeStructure`, etc.) and supporting definitions (`documentTypes`, `vendorPatterns`, `metadataPatterns`) into `documentService.js` as standalone functions (removing `this` context). Renamed `classifyDocument` to `classifyDocumentText` for clarity.
    4.  **Upload Logic:** The `uploadImage` method in `visionService.js` was redundant with the existing `handleUpload` in `documentService.js` and was therefore discarded. `handleUpload` was slightly modified to return the `gcsUri` along with the `imageUrl`.
    5.  **Firestore Saving:** Added a new function `saveDocumentData` to `documentService.js` to handle saving the combined results (upload info, extracted text, classification results) to the `documents` collection in Firestore using the Admin SDK.
    6.  **Controller Orchestration:** Updated `server/src/controllers/documentController.js`'s `uploadDocument` function to orchestrate the new flow: call `handleUpload`, then `extractTextFromGcsUri`, then `classifyDocumentText`, prepare the data, and finally call `saveDocumentData`.
*   **Result:** All core document processing logic (upload, OCR, classification, metadata/vendor extraction, saving) is now centralized within `server/src/services/document/documentService.js`. The files `server/extra/visionService.js` and `server/extra/documentClassifier.js` are now fully superseded and serve only as archives.

## 2. Inventory Management Services (Client-Side)

*   **Files Involved:**
    *   Target Service: `client/src/features/inventory/services/inventoryService.js`
    *   Redundant Service: `client/extra/stockService.js`
*   **Analysis:**
    *   `inventoryService.js` (before refactoring) contained methods for basic inventory CRUD (`getInventory`, `addItem`, `updateItem`, `deleteItem`) and stock management (`updateStock`, `checkLowStock`), all using **direct Firestore client SDK calls**.
    *   `stockService.js` contained methods specifically for stock movements (`getStockMovements`, `addStockMovement`), also using **direct Firestore client SDK calls**.
*   **Consolidation Actions:**
    1.  **API-Based Refactoring:** Rewrote *all* methods within `client/src/features/inventory/services/inventoryService.js` to remove direct Firestore SDK usage.
    2.  **API Client:** Imported and used the shared `api` utility (`client/src/shared/services/api.js`) for making backend calls.
    3.  **Endpoint Mapping:** Mapped the existing service methods to assumed RESTful backend endpoints (e.g., `getInventory` -> `GET /api/inventory`, `addItem` -> `POST /api/inventory`, `updateStock` -> `PUT /api/inventory/:id/stock`, `addStockMovement` -> `POST /api/inventory/movements`).
    4.  **Logic Integration:** The functionality previously in `stockService.js` (`getStockMovements`, `addStockMovement`) was directly incorporated into the refactored `inventoryService.js` as methods calling their respective assumed backend endpoints.
*   **Result:** All client-side inventory and stock management logic now goes through `inventoryService.js`, which acts as an API client layer. Direct Firestore access from the client for inventory is eliminated. `client/extra/stockService.js` is superseded and archived.

## Recommendations

1.  **Backend Implementation:** The refactoring of `inventoryService.js` assumes corresponding backend endpoints exist. These endpoints (`/api/inventory`, `/api/inventory/:id/stock`, `/api/inventory/movements`, etc.) and their associated controller/service logic **must be implemented** on the server using the Admin SDK, similar to how the document upload was handled. This is a critical next step identified in `technical-debt.md`.
2.  **Document Service Refinement:** The integrated classification logic in `documentService.js` (specifically helpers like `_analyzeStructure`) might need further refinement and testing for accuracy based on real Vision API output. Error handling within the classification/extraction helpers could be improved.
3.  **Error Handling Consistency:** Ensure consistent error object structure and status codes are used across all new backend endpoints and handled uniformly by the client-side API utility and services.
4.  **Testing:** Add server-side integration tests for the new document processing and inventory endpoints. Update client-side tests (if any) to mock the API service calls instead of Firebase directly.
