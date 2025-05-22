---
title: Technical Debt Tracking
created: 2025-05-06
last_updated: 2025-05-19
update_history:
  - 2025-05-19: Added technical debt item for client-side testing environment stability and mocking issues.
  - 2025-05-18: Added technical debt item for incomplete security rules test coverage due to emulator limitations.
  - 2025-05-06: Added standardized metadata header.
status: Complete
owner: Cline (AI Engineer)
related_files: []
---

# Technical Debt Tracking

## Table of Contents

*   [Priority 1: Critical Issues (High Impact)](#priority-1-critical-issues-high-impact)
*   [Priority 2: Consolidations & Refactoring (Medium Impact)](#priority-2-consolidations--refactoring-medium-impact)
    *   [4. Incomplete Security Rules Test Coverage (Emulator Limitations)](#incomplete-security-rules-test-coverage-emulator-limitations)
    *   **5. Feature Flag System Enhancements:**
        *   **Issue:** The feature flag system has several areas for improvement, including a limited audit log, basic analytics, no gradual recovery, and client-side only management.
        *   **Files:** [`client/src/core/config/featureFlags.js`](../../../client/src/core/config/featureFlags.js), [`client/src/features/settings/components/FeatureToggles.js`](../../../client/src/features/settings/components/FeatureToggles.js), [`client/src/utils/errorHandler.js`](../../../client/src/utils/errorHandler.js)
        *   **Recommendation:** Implement a full audit log, integrate with a dedicated analytics/monitoring platform, develop a gradual recovery system for auto-disabled flags, consider server-based flag state, implement granular permissions, and add support for advanced flag types. Move feature flag descriptions out of the UI component into a separate config file.
        *   **Effort:** High (Cumulative)
        *   **Impact:** Medium (Robustness, Observability, Management)
    *   **6. Client-Side Testing Environment Stability and Mocking Issues:**
        *   **Issue:** The client-side testing environment is unstable due to persistent module resolution errors, inconsistent mocking of dependencies (Firebase SDK, API services, etc.), and issues with clearing mocks between tests. This is blocking effective unit and integration testing.
        *   **Files:** [`client/jest.config.js`](../../../client/jest.config.js), [`client/src/setupTests.js`](../../../client/src/setupTests.js), [`client/src/__mocks__`](../../../client/src/__mocks__), [`client/src/features/auth/__tests__/authService.test.js`](../../../client/src/features/auth/__tests__/authService.test.js), [`client/src/features/analytics/__tests__/analyticsService.test.js`](../../../client/src/features/analytics/__tests__/analyticsService.test.js), [`client/src/features/inventory/__tests__/inventoryService.test.js`](../../../client/src/features/inventory/__tests__/inventoryService.test.js), [`client/src/features/receipts/__tests__/receipts.test.js`](../../../client/src/features/receipts/__tests__/receipts.test.js), [`client/src/components/__tests__/Button.test.js`](../../../client/src/components/__tests__/Button.test.js), [`tests/integration/receiptManagement.integration.test.js`](../../../tests/integration/receiptManagement.integration.test.js) (and potentially other client-side test files).
        *   **Recommendation:** Conduct a deep dive into the Jest configuration (`jest.config.js`, `setupTests.js`) to ensure correct module resolution and consistent application of mocks. Review and refine mock implementations in the `__mocks__` directory. Investigate alternative mocking strategies or Jest configurations if current approaches are insufficient. Ensure test files correctly import and utilize mocks and clear them appropriately.
        *   **Effort:** High
        *   **Impact:** Medium (Development Velocity, Code Quality Assurance)
*   [Priority 3: Improvements & Standardization (Low Impact)](#priority-3-improvements--standardization-low-impact)
*   [Future Considerations](#future-considerations)

## Priority 1: Critical Issues (High Impact)

1.  **Incomplete Security Rules:**
    *   **Issue:** Firestore and Cloud Storage security rules are incomplete, potentially exposing user data.
*   **Files:** [`firestore.rules`](../../../firestore.rules), [`storage.rules`](../../../storage.rules)
    *   **Required Rules:**
        *   Firestore Collections: `products`, `inventory`, `stockMovements`, `alerts`, `vendors`, `documents`, `notifications`, `notificationPreferences`
        *   Storage Paths: `/profiles/{userId}/{fileName}`, `/documents/{userId}/{fileName}`, `/exports/{userId}/{fileName}`
    *   **Recommendation:** Implement comprehensive, user-specific rules for all collections and storage paths to ensure proper data access control.
    *   **Effort:** Medium
    *   **Impact:** Critical (Security)

2.  **Direct Firebase Access from Client:**
    *   **Issue:** Several client-side hooks directly access Firestore/Storage instead of using dedicated API services. This bypasses backend validation and security rules, couples the frontend tightly to the database structure, and duplicates logic.
    *   **Files:**
        *   [`client/src/features/receipts/hooks/useReceipts.js`](../../../client/src/features/receipts/hooks/useReceipts.js) (Firestore)
        *   [`client/src/features/inventory/hooks/useInventory.js`](../../../client/src/features/inventory/hooks/useInventory.js) (Firestore)
        *   [`client/src/features/analytics/hooks/useAnalytics.js`](../../../client/src/features/analytics/hooks/useAnalytics.js) (Firestore)
        *   [`client/src/features/documents/hooks/useDocumentScanner.js`](../../../client/src/features/documents/hooks/useDocumentScanner.js) (Storage - via `documentProcessingService`)
    *   **Recommendation:** Refactor these hooks to call backend API endpoints (via [`client/src/shared/services/api.js`](../../../client/src/shared/services/api.js) or feature-specific services) for all data fetching and manipulation. Ensure corresponding backend services and controllers exist.
    *   **Effort:** High
    *   **Impact:** Critical (Security, Architecture, Maintainability)

## Priority 2: Consolidations & Refactoring (Medium Impact)

1.  **Server-Side Service Consolidation:**
    *   **Issue:** Overlapping responsibilities between server-side services.
    *   **Files:**
        *   [`server/src/services/document/DocumentProcessingService.js`](../../../server/src/services/document/DocumentProcessingService.js), [`server/extra/visionService.js`](../../../server/extra/visionService.js), [`server/extra/documentClassifier.js`](../../../server/extra/documentClassifier.js)
        *   Inventory Management: [`client/src/features/inventory/services/inventoryService.js`](../../../client/src/features/inventory/services/inventoryService.js), [`client/extra/stockService.js`](../../../client/extra/stockService.js) (Note: These seem to be client-side, but likely interact with potentially duplicate backend logic). Need corresponding backend services.
    *   **Recommendation:** Consolidate document-related services (`DocumentProcessingService`, `visionService`, `documentClassifier`) into a single, cohesive service on the server. Review and consolidate backend inventory/stock logic into unified services.
    *   **Effort:** Medium
    *   **Impact:** Medium (Maintainability, Code Clarity)

2.  **Client-Side Hook Consolidation:**
    *   **Issue:** Potential redundancy between analytics and document hooks.
    *   **Files:**
        *   [`client/src/features/analytics/hooks/useReports.js`](../../../client/src/features/analytics/hooks/useReports.js) vs [`client/src/features/analytics/hooks/useAnalytics.js`](../../../client/src/features/analytics/hooks/useAnalytics.js)
        *   [`client/src/features/documents/hooks/useDocumentScanner.js`](../../../client/src/features/documents/hooks/useDocumentScanner.js) vs [`client/src/features/documents/hooks/useOCR.js`](../../../client/src/features/documents/hooks/useOCR.js)
    *   **Recommendation:** Review `useReports` and `useAnalytics` for overlapping logic and consolidate if possible. Review `useDocumentScanner` and `useOCR`; `useDocumentScanner` seems more comprehensive, consider merging `useOCR`'s unique logic (if any) into it or removing `useOCR`.
    *   **Effort:** Medium
    *   **Impact:** Medium (Maintainability)

3.  **Duplicate Client Components:**
    *   **Issue:** Components with similar functionality exist.
    *   **Files:**
        *   [`client/src/features/receipts/components/ReceiptUploader.js`](../../../client/src/features/receipts/components/ReceiptUploader.js) vs [`client/extra/FileUploader.js`](../../../client/extra/FileUploader.js) (and potentially [`client/extra/2ReceiptUploader.js`](../../../client/extra/2ReceiptUploader.js))
        *   [`client/src/features/analytics/components/SpendingChart.js`](../../../client/src/features/analytics/components/SpendingChart.js) vs [`client/extra/SpendingSummary.js`](../../../client/extra/SpendingSummary.js)
        *   [`client/src/features/analytics/components/SpendingTrends.js`](../../../client/src/features/analytics/components/SpendingTrends.js) vs [`client/extra/PredictiveAnalytics.js`](../../../client/extra/PredictiveAnalytics.js)
        *   [`client/src/features/receipts/components/ReceiptCard.js`](../../../client/src/features/receipts/components/ReceiptCard.js) vs [`client/extra/ReceiptPreview.js`](../../../client/extra/ReceiptPreview.js)
    *   **Recommendation:** Consolidate functionality into the primary components (`ReceiptUploader.js`, `SpendingChart.js`, `SpendingTrends.js`, `ReceiptCard.js`) and remove the duplicates from `/extra`. Ensure the primary components cover all necessary use cases.
    *   **Effort:** Medium
    *   **Impact:** Medium (Maintainability, Bundle Size)

4.  **Incomplete Security Rules Test Coverage (Emulator Limitations):**
    *   **Issue:** Certain security rules tests in `simplified-firestore.test.js` are currently skipped due to identified limitations or unexpected behavior in the Firebase emulator regarding cross-collection `get().exists()` and the evaluation of `request.resource.data.keys().hasOnly()` on update.
    *   **Files:** [`server/tests/security/simplified-firestore.test.js`](../../../server/tests/security/simplified-firestore.test.js), [`firestore.rules`](../../../firestore.rules) (affected rules)
    *   **Recommendation:** Investigate potential updates to the Firebase emulator and `@firebase/rules-unit-testing` library. If emulator limitations persist, consider refactoring the affected security rules for better testability or implementing alternative testing strategies. Unskip and fix the tests once the underlying issues are resolved.
    *   **Effort:** Medium
    *   **Impact:** Medium (Testing Reliability, Security Assurance Gap)

5.  **Date Utility Consolidation:**
    *   **Issue:** Multiple date utility files.
    *   **Files:** [`client/src/shared/utils/date.js`](../../../client/src/shared/utils/date.js), [`client/extra/temp-date.js`](../../../client/extra/temp-date.js), [`client/extra/temp-date-v2.js`](../../../client/extra/temp-date-v2.js)
    *   **Recommendation:** Merge all necessary date functions into `client/src/shared/utils/date.js` and remove the temporary files from `/extra`.
    *   **Effort:** Low
    *   **Impact:** Low (Maintainability)

6.  **Client-Side Testing Environment Stability and Mocking Issues:**
    *   **Issue:** The client-side testing environment is unstable due to persistent module resolution errors, inconsistent mocking of dependencies (Firebase SDK, API services, etc.), and issues with clearing mocks between tests. This is blocking effective unit and integration testing.
    *   **Files:** [`client/jest.config.js`](../../../client/jest.config.js), [`client/src/setupTests.js`](../../../client/src/setupTests.js), [`client/src/__mocks__`](../../../client/src/__mocks__), [`client/src/features/auth/__tests__/authService.test.js`](../../../client/src/features/auth/__tests__/authService.test.js), [`client/src/features/analytics/__tests__/analyticsService.test.js`](../../../client/src/features/analytics/__tests__/analyticsService.test.js), [`client/src/features/inventory/__tests__/inventoryService.test.js`](../../../client/src/features/inventory/__tests__/inventoryService.test.js), [`client/src/features/receipts/__tests__/receipts.test.js`](../../../client/src/features/receipts/__tests__/receipts.test.js), [`client/src/components/__tests__/Button.test.js`](../../../client/src/components/__tests__/Button.test.js), [`tests/integration/receiptManagement.integration.test.js`](../../../tests/integration/receiptManagement.integration.test.js) (and potentially other client-side test files).
        *   **Actions Taken:** Created mock files for browser APIs, Firebase SDK, feature flags, error handler, and file assets. Updated `setupTests.js` to import these mocks. Modified `jest.config.js` for module resolution. Iteratively debugged test failures by adjusting mock implementations, import paths, and mock clearing logic in various test files based on error messages. Attempted explicit imports of mocks in some test files and adjusted `jest.mock` definitions.
        *   **Current Status:** While some initial errors are resolved, module resolution issues and errors related to accessing/clearing mocks persist in several test files. The environment is not yet stable.
    *   **Recommendation:** Conduct a deep dive into the Jest configuration (`jest.config.js`, `setupTests.js`) to ensure correct module resolution and consistent application of mocks. Review and refine mock implementations in the `__mocks__` directory. Investigate alternative mocking strategies or Jest configurations if current approaches are insufficient. Ensure test files correctly import and utilize mocks and clear them appropriately.
    *   **Effort:** High
    *   **Impact:** Medium (Development Velocity, Code Quality Assurance)

## Priority 3: Improvements & Standardization (Low Impact)

1.  **Type Definitions:**
    *   **Issue:** Areas with poor or missing TypeScript type definitions (`any`, implicit types).
    *   **Files:** Throughout the codebase, especially in older JS files or areas interacting with Firebase data ([`client/src/core/types/common.ts`](../../../client/src/core/types/common.ts), [`client/src/core/types/api.ts`](../../../client/src/core/types/api.ts), [`client/src/core/types/authTypes.ts`](../../../client/src/core/types/authTypes.ts) exist but coverage might be incomplete).
    *   **Recommendation:** Gradually improve type coverage, replacing `any` with specific types, defining interfaces for API responses and data models.
    *   **Effort:** Ongoing (Low per instance)
    *   **Impact:** Low-Medium (Developer Experience, Bug Prevention)

2.  **Standardize Utility Functions:**
    *   **Issue:** Potential overlap between feature-specific utils and shared utils.
    *   **Files:** e.g., [`client/src/features/analytics/utils/analyticsCalculations.js`](../../../client/src/features/analytics/utils/analyticsCalculations.js), [`client/src/features/inventory/utils/stockCalculations.js`](../../../client/src/features/inventory/utils/stockCalculations.js) vs [`client/src/shared/utils/*`](../../../client/src/shared/utils/)
    *   **Recommendation:** Review feature-specific utility functions. If a function is generic enough, move it to `client/src/shared/utils/` to promote reusability.
    *   **Effort:** Low
    *   **Impact:** Low (Maintainability)

3.  **Optimize Utility Components:**
    *   **Issue:** Utility components like `PerformanceOptimizedList`, `SearchBar`, `Table`, `ChartWrapper` might need review for consistency and optimization opportunities.
    *   **Files:** [`client/src/shared/components/ui/*`](../../../client/src/shared/components/ui/), [`client/src/shared/components/charts/*`](../../../client/src/shared/components/charts/)
    *   **Recommendation:** Ensure these components are used consistently across features and review for potential performance improvements or consolidation if similar components exist.
    *   **Effort:** Low-Medium
    *   **Impact:** Low (Performance, Consistency)

4.  **Move `useCategories` Hook:**
    *   **Issue:** `useCategories` hook is in the root `client/src/hooks` folder.
    *   **File:** [`client/src/hooks/useCategories.js`](../../../client/src/hooks/useCategories.js)
    *   **Recommendation:** Move to `client/src/features/categories/hooks/useCategories.js` to follow the feature-based organization. Create the `categories` feature folder if it doesn't exist.
    *   **Effort:** Low
    *   **Impact:** Low (Code Organization)

5.  **Review Unused File Candidates:**
    *   **Issue:** Some files were marked as potentially unused but require verification.
    *   **Files:**
        *   [`client/src/features/receipts/components/ReceiptFilters.js`](../../../client/src/features/receipts/components/ReceiptFilters.js)
        *   [`client/src/shared/utils/validation.js`](../../../client/src/shared/utils/validation.js) (Check if all functions were moved or if it's still needed)
        *   [`server/tests/__mocks__/firebase/storage.js`](../../../server/tests/__mocks__/firebase/storage.js)
    *   **Recommendation:** Verify if these files/components are integrated or used elsewhere. If confirmed unused, move them to the `/extra` folder.
    *   **Effort:** Low
    *   **Impact:** Low (Code Cleanup)

## Future Considerations

*   **Testing:** Increase test coverage for both client and server, especially after refactoring.
*   **Documentation:** Keep [`docs/maintenance/maintenance-technical-documentation.md`](docs/maintenance/maintenance-technical-documentation.md), [`docs/developer/architecture/architecture-overview.md`](../developer/architecture/overview.md), and [`docs/developer/specifications/specification-api.md`](../developer/specifications/api.md) updated as the codebase evolves. Move standalone documentation files ([`Backend Documentation.txt`](../../../Backend Documentation.txt), etc.) into the `/docs` folder.
*   **Error Handling:** Standardize error handling patterns across the client and server.
*   **Logging:** Enhance server-side logging for better monitoring and debugging.
*   **Security Testing Automation:** Implement more advanced features for security rule testing automation, including detailed test reporting, visualization, and automated detection of security rule changes that require test updates.
