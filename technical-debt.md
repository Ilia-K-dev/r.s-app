# Technical Debt Tracking

This document tracks identified technical debt in the Receipt Scanner project that requires future attention. Items are prioritized based on impact and effort.

## Priority 1: Critical Issues (High Impact)

1.  **Incomplete Security Rules:**
    *   **Issue:** Firestore and Cloud Storage security rules are incomplete, potentially exposing user data.
    *   **Files:** `firestore.rules`, `storage.rules`
    *   **Required Rules:**
        *   Firestore Collections: `products`, `inventory`, `stockMovements`, `alerts`, `vendors`, `documents`, `notifications`, `notificationPreferences`
        *   Storage Paths: `/profiles/{userId}/{fileName}`, `/documents/{userId}/{fileName}`, `/exports/{userId}/{fileName}`
    *   **Recommendation:** Implement comprehensive, user-specific rules for all collections and storage paths to ensure proper data access control.
    *   **Effort:** Medium
    *   **Impact:** Critical (Security)

2.  **Direct Firebase Access from Client:**
    *   **Issue:** Several client-side hooks directly access Firestore/Storage instead of using dedicated API services. This bypasses backend validation and security rules, couples the frontend tightly to the database structure, and duplicates logic.
    *   **Files:**
        *   `client/src/features/receipts/hooks/useReceipts.js` (Firestore)
        *   `client/src/features/inventory/hooks/useInventory.js` (Firestore)
        *   `client/src/features/analytics/hooks/useAnalytics.js` (Firestore)
        *   `client/src/features/documents/hooks/useDocumentScanner.js` (Storage - via `documentProcessingService`)
    *   **Recommendation:** Refactor these hooks to call backend API endpoints (via `client/src/shared/services/api.js` or feature-specific services) for all data fetching and manipulation. Ensure corresponding backend services and controllers exist.
    *   **Effort:** High
    *   **Impact:** Critical (Security, Architecture, Maintainability)

## Priority 2: Consolidations & Refactoring (Medium Impact)

1.  **Server-Side Service Consolidation:**
    *   **Issue:** Overlapping responsibilities between server-side services.
    *   **Files:**
        *   Document Processing: `server/src/services/document/DocumentProcessingService.js`, `server/extra/visionService.js`, `server/extra/documentClassifier.js`
        *   Inventory Management: `client/src/features/inventory/services/inventoryService.js`, `client/extra/stockService.js` (Note: These seem to be client-side, but likely interact with potentially duplicate backend logic). Need corresponding backend services.
    *   **Recommendation:** Consolidate document-related services (`DocumentProcessingService`, `visionService`, `documentClassifier`) into a single, cohesive service on the server. Review and consolidate backend inventory/stock logic into unified services.
    *   **Effort:** Medium
    *   **Impact:** Medium (Maintainability, Code Clarity)

2.  **Client-Side Hook Consolidation:**
    *   **Issue:** Potential redundancy between analytics and document hooks.
    *   **Files:**
        *   `client/src/features/analytics/hooks/useReports.js` vs `useAnalytics.js`
        *   `client/src/features/documents/hooks/useDocumentScanner.js` vs `useOCR.js`
    *   **Recommendation:** Review `useReports` and `useAnalytics` for overlapping logic and consolidate if possible. Review `useDocumentScanner` and `useOCR`; `useDocumentScanner` seems more comprehensive, consider merging `useOCR`'s unique logic (if any) into it or removing `useOCR`.
    *   **Effort:** Medium
    *   **Impact:** Medium (Maintainability)

3.  **Duplicate Client Components:**
    *   **Issue:** Components with similar functionality exist.
    *   **Files:**
        *   `client/src/features/receipts/components/ReceiptUploader.js` vs `client/extra/FileUploader.js` (and potentially `client/extra/2ReceiptUploader.js`)
        *   `client/src/features/analytics/components/SpendingChart.js` vs `client/extra/SpendingSummary.js`
        *   `client/src/features/analytics/components/SpendingTrends.js` vs `client/extra/PredictiveAnalytics.js`
        *   `client/src/features/receipts/components/ReceiptCard.js` vs `client/extra/ReceiptPreview.js`
    *   **Recommendation:** Consolidate functionality into the primary components (`ReceiptUploader.js`, `SpendingChart.js`, `SpendingTrends.js`, `ReceiptCard.js`) and remove the duplicates from `/extra`. Ensure the primary components cover all necessary use cases.
    *   **Effort:** Medium
    *   **Impact:** Medium (Maintainability, Bundle Size)

4.  **Date Utility Consolidation:**
    *   **Issue:** Multiple date utility files.
    *   **Files:** `client/src/shared/utils/date.js`, `client/extra/temp-date.js`, `client/extra/temp-date-v2.js`
    *   **Recommendation:** Merge all necessary date functions into `client/src/shared/utils/date.js` and remove the temporary files from `/extra`.
    *   **Effort:** Low
    *   **Impact:** Low (Maintainability)

## Priority 3: Improvements & Standardization (Low Impact)

1.  **Type Definitions:**
    *   **Issue:** Areas with poor or missing TypeScript type definitions (`any`, implicit types).
    *   **Files:** Throughout the codebase, especially in older JS files or areas interacting with Firebase data (`*.ts` files like `client/src/core/types/common.ts`, `api.ts`, `authTypes.ts` exist but coverage might be incomplete).
    *   **Recommendation:** Gradually improve type coverage, replacing `any` with specific types, defining interfaces for API responses and data models.
    *   **Effort:** Ongoing (Low per instance)
    *   **Impact:** Low-Medium (Developer Experience, Bug Prevention)

2.  **Standardize Utility Functions:**
    *   **Issue:** Potential overlap between feature-specific utils and shared utils.
    *   **Files:** e.g., `client/src/features/analytics/utils/analyticsCalculations.js`, `client/src/features/inventory/utils/stockCalculations.js` vs `client/src/shared/utils/*`
    *   **Recommendation:** Review feature-specific utility functions. If a function is generic enough, move it to `client/src/shared/utils/` to promote reusability.
    *   **Effort:** Low
    *   **Impact:** Low (Maintainability)

3.  **Optimize Utility Components:**
    *   **Issue:** Utility components like `PerformanceOptimizedList`, `SearchBar`, `Table`, `ChartWrapper` might need review for consistency and optimization opportunities.
    *   **Files:** `client/src/shared/components/ui/*`, `client/src/shared/components/charts/*`
    *   **Recommendation:** Ensure these components are used consistently across features and review for potential performance improvements or consolidation if similar components exist.
    *   **Effort:** Low-Medium
    *   **Impact:** Low (Performance, Consistency)

4.  **Move `useCategories` Hook:**
    *   **Issue:** `useCategories` hook is in the root `client/src/hooks` folder.
    *   **File:** `client/src/hooks/useCategories.js`
    *   **Recommendation:** Move to `client/src/features/categories/hooks/useCategories.js` to follow the feature-based organization. Create the `categories` feature folder if it doesn't exist.
    *   **Effort:** Low
    *   **Impact:** Low (Code Organization)

5.  **Review Unused File Candidates:**
    *   **Issue:** Some files were marked as potentially unused but require verification.
    *   **Files:**
        *   `client/src/features/receipts/components/ReceiptFilters.js`
        *   `client/src/shared/utils/validation.js` (Check if all functions were moved or if it's still needed)
        *   `server/tests/__mocks__/firebase/storage.js`
    *   **Recommendation:** Verify if these files/components are integrated or used elsewhere. If confirmed unused, move them to the `/extra` folder.
    *   **Effort:** Low
    *   **Impact:** Low (Code Cleanup)

## Future Considerations

*   **Testing:** Increase test coverage for both client and server, especially after refactoring.
*   **Documentation:** Keep `technical-documentation.md`, `docs/architecture.md`, and `docs/api.md` updated as the codebase evolves. Move standalone documentation files (`Backend Documentation.txt`, etc.) into the `/docs` folder.
*   **Error Handling:** Standardize error handling patterns across the client and server.
*   **Logging:** Enhance server-side logging for better monitoring and debugging.
