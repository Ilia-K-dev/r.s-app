---
title: "Receipt Scanner Application Project Structure"
creation_date: 2025-05-15
update_history:
  - date: 2025-05-15
    description: Initial creation of comprehensive project structure documentation.
  - date: 2025-05-16
    description: Added YAML front matter and navigation headers.
status: In Progress
owner: Cline EDI Assistant
related_files:
  - /docs/core/architecture.md
  - /docs/firebase/integration-architecture.md
---

# Receipt Scanner Application Project Structure

[Home](/docs) > [Core Documentation](/docs/core) > Receipt Scanner Application Project Structure

## In This Document
- [Overall Architecture](#overall-architecture)
- [Directory Structure](#directory-structure)
- [Key Files and Directories](#key-files-and-directories)
  - [Root Directory](#root-directory)
  - [analysis/](#analysis)
  - [client/](#client)
  - [client/public/](#clientpublic)
  - [client/scripts/](#clientscripts)
  - [client/src/](#clientsrc)
  - [client/src/components/](#clientsrccomponents)
  - [client/src/contexts/](#clientsrccontexts)
  - [client/src/core/](#clientsrccore)
  - [client/src/design-system/](#clientsrcdesign-system)
  - [client/src/features/](#clientsrcfeatures)
  - [client/src/hooks/](#clientsrchooks)
  - [client/src/locales/](#clientsrclocales)
  - [client/src/shared/](#clientsrcshared)
  - [client/src/store/](#clientsrcstore)
  - [client/src/styles/](#clientsrcstyles)
  - [client/src/utils/](#clientsrcutils)
  - [docs/](#docs)
  - [emulator-data/](#emulator-data)
  - [extra/](#extra)
  - [functions/](#functions)
  - [migration_docs/](#migration_docs)
  - [receipt-scanner-next/](#receipt-scanner-next)
  - [rules-test/](#rules-test)
  - [scripts/](#scripts)
  - [server/](#server)
  - [server/config/](#serverconfig)
  - [server/middleware/](#servermiddleware)
  - [server/routes/](#serverroutes)
  - [server/src/](#serversrc)
  - [server/services/](#serverservices)
  - [server/tests/](#servertests)
- [Key Integration Points](#key-integration-points)
- [Areas Requiring Special Attention](#areas-requiring-special-attention)

## Related Documentation
- [Architecture Overview](../core/architecture.md)
- [Firebase Integration Architecture](../firebase/integration-architecture.md)

## Overall Architecture

The application has transitioned from a client-server architecture heavily reliant on an Express.js backend to one where the client interacts directly with Firebase as a backend-as-a-service (BaaS) for core data operations (authentication, database, and storage). The Express.js backend's role is now reduced, primarily handling tasks not yet migrated or those requiring trusted server-side execution (e.g., document processing orchestration, reporting).

*   **Frontend (client/):** A React/React Native application built with Expo, responsible for the user interface, user interactions, and direct communication with Firebase Authentication, Firestore, and Storage services using the Firebase SDK. It also communicates with the reduced backend API for specific tasks.
*   **Backend (server/):** An Express.js server with a reduced scope. It handles API requests for tasks not migrated to direct Firebase client integration (e.g., document processing orchestration, reporting, potentially other legacy endpoints). It may still interact with Firebase Admin SDK for privileged operations or external services.
*   **Firebase:** Provides core services directly consumed by the frontend:
    *   **Authentication:** Manages user accounts and authentication state via client-side SDK.
    *   **Firestore:** A NoSQL cloud database for storing structured data (receipts, users, etc.), accessed directly by the client, with access controlled by security rules.
    *   **Storage:** Stores user-uploaded files (receipt images, profile pictures), accessed directly by the client, with access controlled by security rules.
    *   **Functions (functions/):** Serverless functions for triggering backend code in response to Firebase events or HTTP requests (currently minimal implementation).
*   **Security Rules (firestore.rules, storage.rules):** Crucial for enforcing data access control and validation directly within Firebase, as the client has direct access.
*   **Testing (rules-test/, server/tests/, client/tests/):** Includes unit tests for Firebase security rules, backend logic, and client-side integration tests.

The primary flow of data now involves the frontend interacting directly with Firebase services for most user-owned data operations. The backend API is used for specific, non-migrated functionalities.

## Directory Structure

```
.
├── .expo/
│   ├── README.md
│   ├── settings.json
├── .firebaserc
├── .git/
│   ├── .COMMIT_EDITMSG.swp
│   ├── .MERGE_MSG.swp
│   ├── COMMIT_EDITMSG
│   ├── config
│   ├── description
│   ├── FETCH_HEAD
│   ├── HEAD
│   ├── hooks/
│   ├── index
│   ├── info/
│   │   ├── exclude
│   │   ├── refs
│   ├── logs/
│   │   ├── HEAD
│   │   ├── refs/
│   │   │   ├── heads/
│   │   │   ├── remotes/
│   │   │   │   ├── origin/
│   ├── objects/
│   │   ├── 02/
│   │   ├── 12/
│   │   ├── 24/
│   │   ├── 41/
│   │   ├── 9a/
│   │   ├── info/
│   │   ├── pack/
│   ├── ORIG_HEAD
│   ├── packed-refs
│   ├── refs/
│   │   ├── heads/
│   │   ├── original/
│   │   ├── remotes/
│   │   │   ├── origin/
│   │   ├── tags/
├── .github/
│   ├── CODEOWNERS
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   ├── workflows/
├── .gitignore
├── analysis/
│   └── missing-files-audit.md
├── babel.config.js
├── Backend Documentation.txt
├── build/
│   ├── .expo/
│   │   ├── devices.json
│   │   ├── README.md
│   │   ├── web/
│   │   │   ├── cache/
│   │   │   │   ├── production/
│   │   │   │   │   ├── images/
├── claude chat/
│   ├── 1-Receipt Scanner Application Architecture and Structure.txt
│   ├── 2-Receipt Scanner Application Core Features Implementation.txt
│   ├── 3-Receipt Scanner Application Security and Performance Analysis.txt
│   ├── 4-Receipt Scanner Application Issues and Recommendations.txt
│   ├── 5-PublishCopyReceipt Scanner Application UI Component Library and Styling.txt
│   ├── 6-Receipt Scanner Application Implementation Plan.txt
│   ├── work plan and promts for cline.txt
├── client/
│   ├── .env.development
│   ├── .env.production
│   ├── .env.template
│   ├── .eslintrc.js
│   ├── .expo/
│   │   ├── devices.json
│   │   ├── packager-info.json
│   │   ├── README.md
│   │   ├── settings.json
│   │   ├── web/
│   │   │   ├── cache/
│   │   │   │   ├── development/
│   │   │   │   │   ├── babel-loader/
│   │   │   │   ├── production/
│   │   │   │   │   ├── images/
│   ├── .prettierrc
│   ├── app.json
│   ├── assets/
│   │   ├── favicon.png
│   ├── babel.config.js
│   ├── build/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   │   ├── adaptive-icon.png
│   │   │   │   ├── favicon.png
│   │   │   │   ├── icon.png
│   │   │   │   ├── splash-icon.png
│   │   ├── favicon.ico
│   │   ├── manifest.json
│   ├── extra/
│   │   ├── 1-project-structure.md
│   │   ├── 10-UI Components and Styling.md
│   │   ├── 11-Firebase Integration.md
│   │   ├── 12-Comprehensive Analysis Summary.md
│   │   ├── 2-Core Configuration.md
│   │   ├── 2ReceiptUpload.js
│   │   ├── 2ReceiptUploader.js
│   │   ├── 3-Authentication System.md
│   │   ├── 4-Server API.md
│   │   ├── 5-Data Models and Services.md
│   │   ├── 6-OCR and Document Scanning.md
│   │   ├── 7-Receipt Management.md
│   │   ├── 8-Inventory Tracking.md
│   │   ├── 9-Analytics and Reporting.md
│   │   ├── code-analysis/
│   │   ├── DashboardPage.js
│   │   ├── DocumentPreview.js
│   │   ├── DocumentScanner.js
│   │   ├── extra/
│   │   │   ├── .env
│   │   │   ├── extraBarChart.js
│   │   │   ├── extraDonutChart.js
│   │   │   ├── extraLineChart.js
│   │   │   ├── extraPieChart.js
│   │   ├── extra-formatters.js
│   │   ├── extra.ScannerInterface.js
│   │   ├── extraDocumentPreview.js
│   │   ├── extraDocumentScanner.js
│   │   ├── extraReceiptPreview.js
│   │   ├── FileUploader.js
│   │   ├── ReceiptPreview.js
│   │   ├── ReceiptScanner.js
│   │   ├── stockService.js
│   │   ├── temp-date-v2.js
│   │   ├── temp-date.js
│   ├── jest.config.js
│   ├── metro.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   │   ├── adaptive-icon.png
│   │   │   │   ├── favicon.png
│   │   │   │   ├── icon.png
│   │   │   │   ├── splash-icon.png
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── manifest.json
│   ├── scripts/
│   │   ├── build.js
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── __tests__/
│   │   │   │   ├── Button.test.js
│   │   ├── contexts/
│   │   │   ├── ThemeContext.js
│   │   ├── core/
│   │   │   ├── components/
│   │   │   │   ├── ErrorBoundary.js
│   │   │   ├── config/
│   │   │   │   ├── api.config.js
│   │   │   │   ├── constants.js
│   │   │   │   ├── environment.js
│   │   │   │   ├── featureFlags.js
│   │   │   │   ├── firebase.js
│   │   │   │   ├── theme.config.js
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── featureFlags.test.js
│   │   │   ├── contexts/
│   │   │   │   ├── AuthContext.js
│   │   │   │   ├── ToastContext.js
│   │   │   ├── pages/
│   │   │   │   ├── NotFoundPage.js
│   │   │   │   ├── NotFoundPage.jsx
│   │   │   │   ├── ReceiptsPage.js
│   │   │   │   ├── ReportsPage.js
│   │   │   │   ├── SettingsPage.js
│   │   │   ├── routes/
│   │   │   │   ├── index.js
│   │   │   ├── types/
│   │   │   │   ├── api.ts
│   │   │   │   ├── authTypes.ts
│   │   │   │   ├── common.ts
│   │   │   ├── design-system/
│   │   │   │   ├── components/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   ├── index.js
│   │   │   │   ├── utils.ts
│   │   │   ├── features/
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── BudgetProgress.js
│   │   │   │   │   │   ├── CategoryBreakdown.js
│   │   │   │   │   │   ├── charts/
│   │   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   ├── MonthlyTrends.js
│   │   │   │   │   │   ├── PredictiveAnalytics.js
│   │   │   │   │   │   ├── reports/
│   │   │   │   │   │   ├── SpendingChart.js
│   │   │   │   │   │   ├── SpendingTrends.js
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useAnalytics.js
│   │   │   │   │   │   ├── useReports.js
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── CategoryReportPage.js
│   │   │   │   │   │   ├── DashboardPage.js
│   │   │   │   │   │   ├── ReportDetailPage.js
│   │   │   │   │   │   ├── ReportsPage.js
│   │   │   │   │   │   ├── SpendingReportPage.js
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── analyticsService.js
│   │   │   │   │   │   ├── reports.js
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── analyticsCalculations.js
│   │   │   │   │   │   ├── calculators.js
│   │   │   │   │   │   ├── dataFetchers.js
│   │   │   │   │   │   ├── __tests__/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── analyticsService.test.js
│   │   │   │   ├── auth/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── AuthGuard.js
│   │   │   │   │   │   ├── ForgotPasswordPage.js
│   │   │   │   │   │   ├── LoginPage.js
│   │   │   │   │   │   ├── RegisterPage.js
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useAuth.js
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── authService.js
│   │   │   │   │   ├── types/
│   │   │   │   │   │   ├── authTypes.ts
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── authService.test.js
│   │   │   │   ├── categories/
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useCategories.js
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── categories.js
│   │   │   │   ├── documents/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── BaseDocumentHandler.js
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useCamera.js
│   │   │   │   │   │   ├── useDocumentProcessing.js
│   │   │   │   │   │   ├── useDocumentScanner.js
│   │   │   │   │   │   ├── useOCR.js
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── documentProcessingService.js
│   │   │   │   │   │   ├── ocr.js
│   │   │   │   │   │   ├── visionService.js
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── documentClassifier.js
│   │   │   │   │   │   ├── imageProcessing.js
│   │   │   │   │   │   ├── ocrProcessor.js
│   │   │   │   │   │   ├── receiptProcessing.js
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── documentProcessingService.test.js
│   │   │   │   │   │   ├── documentProcessingService.test.js.new
│   │   │   │   ├── inventory/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── InventoryItem.js
│   │   │   │   │   │   ├── InventoryList.js
│   │   │   │   │   │   ├── StockAlerts.js
│   │   │   │   │   │   ├── StockManager.js
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useInventory.js
│   │   │   │   │   │   ├── useStockManagement.js
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── inventoryService.js
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── stockCalculations.js
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── inventoryService.test.js
│   │   │   │   ├── receipts/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── ReceiptCard.js
│   │   │   │   │   │   ├── ReceiptDetail.js
│   │   │   │   │   │   ├── ReceiptEdit.js
│   │   │   │   │   │   ├── ReceiptFilters.js
│   │   │   │   │   │   ├── ReceiptForm.js
│   │   │   │   │   │   ├── ReceiptList.js
│   │   │   │   │   │   ├── ReceiptUploader.js
│   │   │   │   │   │   ├── ReceiptUploadProgress.jsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useReceipts.js
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── ReceiptDetailPage.js
│   │   │   │   │   │   ├── ReceiptListPage.js
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── receiptOcrService.js
│   │   │   │   │   │   ├── receipts.js
│   │   │   │   │   │   ├── receiptSearch.js
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── validation.js
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── receipts.test.js
│   │   │   │   ├── settings/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── CategorySettings.js
│   │   │   │   │   │   ├── ColorCustomizer.jsx
│   │   │   │   │   │   ├── ExportSettings.js
│   │   │   │   │   │   ├── FeatureToggles.js
│   │   │   │   │   │   ├── NotificationSettings.js
│   │   │   │   │   │   ├── ProfileSettings.js
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   ├── useSettings.js
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── SettingsPage.js
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── settingsService.js
│   │   │   │   │   ├── utils/
│   │   │   │   │   │   ├── settingsHelpers.js
│   │   │   ├── hooks/
│   │   │   │   ├── useRTL.js
│   │   │   ├── index.js
│   │   │   ├── locales/
│   │   │   │   ├── en/
│   │   │   │   │   ├── analytics.json
│   │   │   │   │   ├── auth.json
│   │   │   │   │   ├── common.json
│   │   │   │   │   ├── dashboard.json
│   │   │   │   │   ├── inventory.json
│   │   │   │   │   ├── receipts.json
│   │   │   │   │   ├── settings.json
│   │   │   │   ├── en.js
│   │   │   │   ├── he/
│   │   │   │   │   ├── analytics.json
│   │   │   │   │   ├── auth.json
│   │   │   │   │   ├── common.json
│   │   │   │   │   ├── dashboard.json
│   │   │   │   │   ├── inventory.json
│   │   │   │   │   ├── receipts.json
│   │   │   │   │   ├── settings.json
│   │   │   │   ├── he.js
│   │   │   │   ├── index.js
│   │   │   ├── process-patch.js
│   │   │   ├── reportWebVitals.js
│   │   │   ├── routes.js
│   │   │   ├── service-worker.js
│   │   │   ├── setupTests.js
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   │   ├── charts/
│   │   │   │   │   │   ├── ChartComponent.js
│   │   │   │   │   │   ├── chartHelpers.js
│   │   │   │   │   │   ├── ChartWrapper.js
│   │   │   │   │   ├── forms/
│   │   │   │   │   │   ├── Dropdown.js
│   │   │   │   │   │   ├── Input.js
│   │   │   │   │   │   ├── Switch.js
│   │   │   │   │   ├── layout/
│   │   │   │   │   │   ├── Footer.js
│   │   │   │   │   │   ├── Layout.js
│   │   │   │   │   │   ├── Navbar.js
│   │   │   │   │   │   ├── PageHeader.js
│   │   │   │   │   │   ├── Sidebar.js
│   │   │   │   │   ├── ui/
│   │   │   │   │   │   ├── Alert.js
│   │   │   │   │   │   ├── Badge.js
│   │   │   │   │   │   ├── Button.js
│   │   │   │   │   │   ├── Card.js
│   │   │   │   │   │   ├── DateRangePicker.js
│   │   │   │   │   │   ├── Loading.js
│   │   │   │   │   │   ├── Modal.js
│   │   │   │   │   │   ├── PerformanceOptimizedList.js
│   │   │   │   │   │   ├── SearchBar.js
│   │   │   │   │   │   ├── Table.js
│   │   │   │   │   │   ├── Tabs.js
│   │   │   │   │   │   ├── Tooltip.js
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useLocalStorage.js
│   │   │   │   │   ├── useToast.js
│   │   │   │   ├── services/
│   │   │   │   │   ├── api.js
│   │   │   │   │   ├── logger.js
│   │   │   │   │   ├── receiptApi.js
│   │   │   │   │   ├── storage.js
│   │   │   │   ├── styles/
│   │   │   │   │   ├── index.css
│   │   │   │   │   ├── tailwind.css
│   │   │   │   ├── utils/
│   │   │   │   │   ├── cache.js
│   │   │   │   │   ├── currency.js
│   │   │   │   │   ├── date.js
│   │   │   │   │   ├── errorHandler.js
│   │   │   │   │   ├── fileHelpers.js
│   │   │   │   │   ├── formatters.js
│   │   │   │   │   ├── helpers.js
│   │   │   │   │   ├── logger.js
│   │   │   │   │   ├── validation.js
│   │   │   ├── store/
│   │   │   │   ├── index.js
│   │   │   ├── styles/
│   │   │   │   ├── tailwind.css
│   │   │   ├── utils/
│   │   │   │   ├── a11y/
│   │   │   │   │   ├── index.js
│   │   │   │   ├── connection.js
│   │   │   │   ├── errorHandler.js
│   │   │   │   ├── formatters/
│   │   │   │   │   ├── hebrew.js
│   │   │   │   ├── formatters.js
│   │   │   │   ├── indexedDbCache.js
│   │   │   │   ├── monitoring/
│   │   │   │   │   ├── sentry.js
│   │   │   │   │   ├── webVitals.js
│   │   │   │   ├── offline/
│   │   │   │   │   ├── syncManager.js
│   │   │   │   ├── performance/
│   │   │   │   │   ├── cache.js
│   │   ├── tailwind.config.js
│   │   ├── tests/
│   │   │   ├── integration/
│   │   │   │   ├── analyticsReporting.test.js
│   │   │   │   ├── authFlows.test.js
│   │   │   │   ├── documentProcessingFlow.test.js
│   │   │   │   ├── featureToggleFlows.test.js
│   │   │   │   ├── inventoryManagement.test.js
│   │   │   │   ├── receiptManagement.integration.test.js
│   │   │   │   ├── receiptManagement.test.js
│   │   ├── tsconfig.json
│   │   ├── webpack.config.js
├── Cline EDI Assistant - Operating Guidelines.txt
├── cline work and md/
│   ├── 5.5/
│   │   ├── cline work plan and tasks.txt
│   │   ├── my work plan.txt
│   ├── 7.5.25/
│   │   ├── 7.5.25 work plan.txt
│   │   ├── check list for 7.5.25 work plan.md
│   │   ├── cline_work_log_20250508.md
│   │   ├── human_tasks_checklist_20250508.md
│   ├── cline work plan 6.5.25
│   ├── last edi work plan 5.33.txt
│   ├── last human work plan 5.35.txt
│   ├── new work plan human 8.5.25.txt
├── combined.log
├── CONTRIBUTING.md
├── docs/
│   ├── analysis/
│   │   ├── code-quality/
│   │   │   ├── analysis-code-quality-issues.md
│   │   │   ├── analysis-dependency-map.md
│   │   │   ├── analysis-routing-consistency.md
│   │   │   ├── analysis-service-consolidation.md
│   │   ├── code-structure/
│   │   │   ├── analysis-file-inventory.md
│   │   ├── configuration/
│   │   │   ├── analysis-firebase-config.md
│   │   │   ├── analysis-vision-api-config.md
│   │   ├── error-handling/
│   │   │   ├── analysis-error-handling-patterns.md
│   │   ├── performance/
│   │   │   ├── analysis-performance-bottlenecks.md
│   │   ├── security/
│   │   │   ├── analysis-security-vulnerabilities.md
│   │   ├── system/
│   │   │   ├── analysis-technology-implementation.md
│   │   ├── system-health/
│   │   │   ├── analysis-system-health-dashboard.md
│   │   ├── ui-ux/
│   │   │   ├── analysis-ui-ux-consistency.md
│   ├── archive/
│   │   ├── analysis-artifacts/
│   │   │   ├── dependency-optimization-report.md
│   │   │   ├── hardcoded-values-audit.md
│   │   │   ├── missing-files-audit.md
│   │   │   ├── modernization-tracker.md
│   │   │   ├── security-enhancements.md
│   │   │   ├── security-fixes-checklist.md
│   │   │   ├── service-refactoring-plan.md
│   │   │   ├── testing-infrastructure-setup.md
│   │   │   ├── ui-consolidation-plan.md
│   │   ├── old-checklists/
│   │   │   ├── accessibility-implementation.md
│   │   │   ├── analysis-task-checklist.md
│   │   │   ├── analytics-api-checklist.md
│   │   │   ├── centralize-api-client-checklist.md
│   │   │   ├── checklist-creation-verification.md
│   │   │   ├── comprehensive-checklist.md
│   │   │   ├── document-processing-checklist.md
│   │   │   ├── error-handling-checklist.md
│   │   │   ├── export-api-checklist.md
│   │   │   ├── implementation-master-checklist.md
│   │   │   ├── inventory-api-checklist.md
│   │   │   ├── master-checklist.md
│   │   │   ├── performance-optimization-checklist.md
│   │   │   ├── receipt-list-page-checklist.md
│   │   │   ├── security-tests-checklist.md
│   │   │   ├── task-continuation-summary.md
│   │   │   ├── testing-commands.md
│   │   ├── reports/
│   │   │   ├── code-changes-report.md
│   │   │   ├── config-security-report.md
│   │   │   ├── core-features-analysis.md
│   │   │   ├── file-movement-report.md
│   │   ├── work-plans/
│   │   │   ├── analysis-work-plan.md
│   ├── developer/
│   │   ├── analytics-service-client-side.md
│   │   ├── architecture/
│   │   │   ├── architecture-api-integration-map.md
│   │   │   ├── architecture-application-structure.md
│   │   │   ├── architecture-auth-flow-analysis.md
│   │   │   ├── architecture-database-schema-analysis.md
│   │   │   ├── architecture-overview.md
│   │   │   ├── architecture-project-map.md
│   │   │   ├── architecture-project-structure.md
│   │   │   ├── architecture-state-management-analysis.md
│   │   │   ├── firebase-direct-integration.md
│   │   ├── guides/
│   │   │   ├── feature-toggle-system.md
│   │   │   ├── firebase-error-handling.md
│   │   │   ├── guide-accessibility.md
│   │   │   ├── guide-deployment.md
│   │   │   ├── guide-error-handling-standards.md
│   │   │   ├── guide-testing.md
│   │   │   ├── guide-ui-component-usage.md
│   │   ├── implementation/
│   │   │   ├── implementation-analytics-api.md
│   │   │   ├── implementation-api-client-centralization.md
│   │   │   ├── implementation-caching.md
│   │   │   ├── implementation-document-processing.md
│   │   │   ├── implementation-documentation-update.md
│   │   │   ├── implementation-error-handling.md
│   │   │   ├── implementation-export-api.md
│   │   │   ├── implementation-inventory-api.md
│   │   │   ├── implementation-performance-optimization.md
│   │   │   ├── implementation-receipt-list-page.md
│   │   │   ├── implementation-rtk-query-migration.md
│   │   │   ├── implementation-security-tests.md
│   │   ├── security/
│   │   │   ├── firebase-security-rules.md
│   │   │   ├── security-configuration.md
│   │   ├── specifications/
│   │   │   ├── specification-api-documentation-setup.md
│   │   │   ├── specification-api.md
│   │   │   ├── specification-environment-config.md
│   │   │   ├── specification-security-rules.md
│   ├── firebase-direct-integration-migration-log-part2.md
│   ├── firebase-direct-integration-migration-log.md
│   ├── firebase-integration-checklist.md
│   ├── firebase-testing-guide.md
│   ├── firebase-testing.md
│   ├── known-issues.md
│   ├── maintenance/
│   │   ├── firebase-performance-cost.md
│   │   ├── maintenance-changelog.md
│   │   ├── maintenance-deployment-readiness.md
│   │   ├── maintenance-development-summary.md
│   │   ├── maintenance-recommendations.md
│   │   ├── maintenance-technical-debt.md
│   │   ├── maintenance-technical-documentation.md
│   │   ├── maintenance-workplan-checklist.md
│   ├── manual-security-rules-testing.md
│   ├── migration/
│   │   ├── api-endpoints.md
│   │   ├── component-inventory.md
│   │   ├── dependencies.md
│   │   ├── firebase-direct-migration.md
│   ├── project-structure.md
│   ├── testing/
│   │   ├── firebase-integration-test-automation.md
│   │   ├── firebase-integration-test-plan.md
│   ├── user/
│   │   ├── firebase-integration-changes.md
│   │   ├── user-guide.md
├── emulator-data/
│   ├── auth_export/
│   │   ├── accounts.json
│   │   ├── config.json
│   ├── firebase-export-metadata.json
│   ├── firestore_export/
│   │   ├── firestore_export.overall_export_metadata
│   ├── storage_export/
│   │   ├── blobs/
│   │   ├── buckets.json
│   │   ├── metadata/
├── error.log
├── extra/
├── firebase.json
├── firestore-debug.log
├── firestore-document-rules.test.json
├── firestore-inventory-rules.test.json
├── firestore-stock-movements.test.json
├── firestore.indexes.json
├── firestore.rules
├── Frontend Development Requirements.txt
├── functions/
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── index.js
│   ├── package-lock.json
│   ├── package.json
├── generateToken.js
├── generate_tree.js
├── LICENSE
├── migration_docs/
│   └── migration_log.md
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── receipt-scanner-next/
│   ├── .env.local
│   ├── .gitignore
│   ├── .next/
│   │   ├── app-build-manifest.json
│   │   ├── build-manifest.json
│   │   ├── cache/
│   │   │   ├── .rscinfo
│   │   │   ├── swc/
│   │   │   │   ├── plugins/
│   │   │   │   │   ├── v7_windows_x86_64_9.0.0/
│   │   │   │   ├── webpack/
│   │   │   │   │   ├── client-development/
│   │   │   │   │   ├── 0.pack.gz
│   │   │   │   │   ├── 1.pack.gz
│   │   │   │   │   ├── 2.pack.gz
│   │   │   │   │   ├── 3.pack.gz
│   │   │   │   │   ├── index.pack.gz
│   │   │   │   │   ├── index.pack.gz.old
│   │   │   │   ├── server-development/
│   │   │   │   │   ├── 0.pack.gz
│   │   │   │   │   ├── 1.pack.gz
│   │   │   │   │   ├── 2.pack.gz
│   │   │   │   │   ├── 3.pack.gz
│   │   │   │   │   ├── 4.pack.gz
│   │   │   │   │   ├── index.pack.gz
│   │   │   │   │   ├── index.pack.gz.old
│   │   │   │   ├── package.json
│   │   │   │   ├── react-loadable-manifest.json
│   │   │   │   ├── server/
│   │   │   │   │   ├── app/
│   │   │   │   │   │   ├── favicon.ico/
│   │   │   │   │   │   ├── route.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   │   ├── page_client-reference-manifest.js
│   │   │   │   ├── app-paths-manifest.json
│   │   │   │   ├── interception-route-rewrite-manifest.js
│   │   │   │   ├── middleware-build-manifest.js
│   │   │   │   ├── middleware-manifest.json
│   │   │   │   ├── middleware-react-loadable-manifest.js
│   │   │   │   ├── next-font-manifest.js
│   │   │   │   ├── next-font-manifest.json
│   │   │   │   ├── pages/
│   │   │   │   │   ├── _app.js
│   │   │   │   │   ├── _document.js
│   │   │   │   │   ├── _error.js
│   │   │   │   ├── pages-manifest.json
│   │   │   │   ├── server-reference-manifest.js
│   │   │   │   ├── server-reference-manifest.json
│   │   │   │   ├── vendor-chunks/
│   │   │   │   │   ├── @opentelemetry.js
│   │   │   │   │   ├── @reduxjs.js
│   │   │   │   │   ├── @standard-schema.js
│   │   │   │   │   ├── @swc.js
│   │   │   │   │   ├── immer.js
│   │   │   │   │   ├── next.js
│   │   │   │   │   ├── react-redux.js
│   │   │   │   │   ├── redux-thunk.js
│   │   │   │   │   ├── redux.js
│   │   │   │   │   ├── reselect.js
│   │   │   │   ├── webpack-runtime.js
│   │   │   │   ├── _error.js
│   │   │   │   ├── app/
│   │   │   │   │   ├── favicon.ico/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── receipts/
│   │   │   │   │   ├── _not-found/
│   │   │   │   ├── app-paths-manifest.json
│   │   │   │   ├── edge-runtime-webpack.js
│   │   │   │   ├── interception-route-rewrite-manifest.js
│   │   │   │   ├── middleware-build-manifest.js
│   │   │   │   ├── middleware-manifest.json
│   │   │   │   ├── middleware-react-loadable-manifest.js
│   │   │   │   ├── middleware.js
│   │   │   │   ├── next-font-manifest.js
│   │   │   │   ├── next-font-manifest.json
│   │   │   │   ├── pages-manifest.json
│   │   │   │   ├── server-reference-manifest.js
│   │   │   │   ├── server-reference-manifest.json
│   │   │   │   ├── static/
│   │   │   │   │   ├── webpack/
│   │   │   │   ├── vendor-chunks/
│   │   │   │   │   ├── @firebase.js
│   │   │   │   │   ├── @grpc.js
│   │   │   │   │   ├── @opentelemetry.js
│   │   │   │   │   ├── @protobufjs.js
│   │   │   │   │   ├── @reduxjs.js
│   │   │   │   │   ├── @swc.js
│   │   │   │   │   ├── asynckit.js
│   │   │   │   │   ├── axios-retry.js
│   │   │   │   │   ├── axios.js
│   │   │   │   │   ├── call-bind-apply-helpers.js
│   │   │   │   │   ├── combined-stream.js
│   │   │   │   │   ├── debug.js
│   │   │   │   │   ├── delayed-stream.js
│   │   │   │   │   ├── dunder-proto.js
│   │   │   │   │   ├── es-define-property.js
│   │   │   │   │   ├── es-errors.js
│   │   │   │   │   ├── es-object-atoms.js
│   │   │   │   │   ├── es-set-tostringtag.js
│   │   │   │   │   ├── firebase.js
│   │   │   │   │   ├── follow-redirects.js
│   │   │   │   │   ├── form-data.js
│   │   │   │   │   ├── function-bind.js
│   │   │   │   │   ├── get-intrinsic.js
│   │   │   │   │   ├── get-proto.js
│   │   │   │   │   ├── gopd.js
│   │   │   │   │   ├── has-flag.js
│   │   │   │   │   ├── has-symbols.js
│   │   │   │   │   ├── has-tostringtag.js
│   │   │   │   │   ├── hasown.js
│   │   │   │   │   ├── idb.js
│   │   │   │   │   ├── immer.js
│   │   │   │   │   ├── is-retry-allowed.js
│   │   │   │   │   ├── lodash.camelcase.js
│   │   │   │   │   ├── long.js
│   │   │   │   │   ├── math-intrinsics.js
│   │   │   │   │   ├── mime-db.js
│   │   │   │   │   ├── mime-types.js
│   │   │   │   │   ├── ms.js
│   │   │   │   │   ├── next.js
│   │   │   │   │   ├── protobufjs.js
│   │   │   │   │   ├── proxy-from-env.js
│   │   │   │   │   ├── react-redux.js
│   │   │   │   │   ├── redux-thunk.js
│   │   │   │   │   ├── redux.js
│   │   │   │   │   ├── reselect.js
│   │   │   │   │   ├── supports-color.js
│   │   │   │   │   ├── tslib.js
│   │   │   │   │   ├── use-sync-external-store.js
│   │   │   │   ├── webpack-runtime.js
│   │   │   ├── static/
│   │   │   │   ├── chunks/
│   │   │   │   │   ├── app/
│   │   │   │   │   ├── layout.js
│   │   │   │   │   ├── page.js
│   │   │   │   │   ├── app-pages-internals.js
│   │   │   │   │   ├── main-app.js
│   │   │   │   │   ├── main.js
│   │   │   │   │   ├── pages/
│   │   │   │   │   ├── _app.js
│   │   │   │   │   ├── _error.js
│   │   │   │   │   ├── polyfills.js
│   │   │   │   │   ├── react-refresh.js
│   │   │   │   │   ├── webpack.js
│   │   │   │   │   ├── _error.js
│   │   │   │   ├── css/
│   │   │   │   │   ├── app/
│   │   │   │   │   ├── layout.css
│   │   │   │   ├── development/
│   │   │   │   │   ├── _buildManifest.js
│   │   │   │   │   ├── _ssgManifest.js
│   │   │   │   ├── media/
│   │   │   │   │   ├── 569ce4b8f30dc480-s.p.woff2
│   │   │   │   │   ├── 747892c23ea88013-s.woff2
│   │   │   │   │   ├── 8d697b304b401681-s.woff2
│   │   │   │   │   ├── 93f479601ee12b01-s.p.woff2
│   │   │   │   │   ├── 9610d9e46709d722-s.woff2
│   │   │   │   │   ├── ba015fad6dcf6784-s.woff2
│   │   │   │   ├── webpack/
│   │   │   │   │   ├── 487fbba87c60c2f1.webpack.hot-update.json
│   │   │   │   │   ├── 495d2c834fc089c4.webpack.hot-update.json
│   │   │   │   │   ├── 5f5884fbbe55e9c9.webpack.hot-update.json
│   │   │   │   │   ├── 633457081244afec._.hot-update.json
│   │   │   │   │   ├── 63735c109135bae7.webpack.hot-update.json
│   │   │   │   │   ├── 6662442cc3e78b79.webpack.hot-update.json
│   │   │   │   │   ├── 6684ef5a8682dbf2.webpack.hot-update.json
│   │   │   │   │   ├── 6e6a0502eada5b01.webpack.hot-update.json
│   │   │   │   │   ├── 741a01c6de5a35a7.webpack.hot-update.json
│   │   │   │   │   ├── 854ef8ab0e57c1c1.webpack.hot-update.json
│   │   │   │   │   ├── a1b900272b46bb58.webpack.hot-update.json
│   │   │   │   │   ├── app/
│   │   │   │   │   │   ├── layout.495d2c834fc089c4.hot-update.js
│   │   │   │   │   │   ├── layout.5f5884fbbe55e9c9.hot-update.js
│   │   │   │   │   │   ├── layout.63735c109135bae7.hot-update.js
│   │   │   │   │   │   ├── layout.6662442cc3e78b79.hot-update.js
│   │   │   │   │   │   ├── layout.6684ef5a8682dbf2.hot-update.js
│   │   │   │   │   │   ├── layout.6e6a0502eada5b01.hot-update.js
│   │   │   │   │   │   ├── layout.741a01c6de5a35a7.hot-update.js
│   │   │   │   │   │   ├── layout.854ef8ab0e57c1c1.hot-update.js
│   │   │   │   │   │   ├── layout.a1b900272b46bb58.hot-update.js
│   │   │   │   │   │   ├── layout.db84f6b2d34b7a17.hot-update.js
│   │   │   │   │   │   ├── layout.e536e6526d1f477c.hot-update.js
│   │   │   │   │   │   ├── layout.fc9ea1ada35b4365.hot-update.js
│   │   │   │   │   │   ├── layout.fd9bbd1705c05fb7.hot-update.js
│   │   │   │   │   ├── db84f6b2d34b7a17.webpack.hot-update.json
│   │   │   │   │   ├── e536e6526d1f477c.webpack.hot-update.json
│   │   │   │   │   ├── fc9ea1ada35b4365.webpack.hot-update.json
│   │   │   │   │   ├── fd9bbd1705c05fb7.webpack.hot-update.json
│   │   │   │   │   ├── webpack.487fbba87c60c2f1.hot-update.js
│   │   │   │   │   ├── webpack.495d2c834fc089c4.hot-update.js
│   │   │   │   │   ├── webpack.5f5884fbbe55e9c9.hot-update.js
│   │   │   │   │   ├── webpack.63735c109135bae7.hot-update.js
│   │   │   │   │   ├── webpack.6662442cc3e78b79.hot-update.js
│   │   │   │   │   ├── webpack.6684ef5a8682dbf2.hot-update.js
│   │   │   │   │   ├── webpack.6e6a0502eada5b01.hot-update.js
│   │   │   │   │   ├── webpack.741a01c6de5a35a7.hot-update.js
│   │   │   │   │   ├── webpack.854ef8ab0e57c1c1.hot-update.js
│   │   │   │   │   ├── webpack.a1b900272b46bb58.hot-update.js
│   │   │   │   │   ├── webpack.db84f6b2d34b7a17.hot-update.js
│   │   │   │   │   ├── webpack.e536e6526d1f477c.hot-update.js
│   │   │   │   │   ├── webpack.fc9ea1ada35b4365.hot-update.js
│   │   │   │   │   ├── webpack.fd9bbd1705c05fb7.hot-update.js
│   │   │   │   ├── trace
│   │   │   │   ├── types/
│   │   │   │   │   ├── app/
│   │   │   │   │   ├── layout.ts
│   │   │   │   │   ├── page.ts
│   │   │   │   ├── cache-life.d.ts
│   │   │   │   ├── package.json
│   │   │   ├── eslint.config.mjs
│   │   │   ├── migration_docs/
│   │   │   │   ├── migration_checklist.md
│   │   │   │   ├── migration_log.md
│   │   │   ├── next-env.d.ts
│   │   │   ├── next.config.js
│   │   │   ├── next.config.ts
│   │   │   ├── package-lock.json
│   │   │   ├── package.json
│   │   │   ├── postcss.config.mjs
│   │   │   ├── public/
│   │   │   │   ├── file.svg
│   │   │   │   ├── globe.svg
│   │   │   │   ├── next.svg
│   │   │   │   ├── vercel.svg
│   │   │   │   ├── window.svg
│   │   │   ├── README.md
│   │   │   ├── receipt-scanner-next-minimal/
│   │   │   │   ├── .env.local
│   │   │   │   ├── .gitignore
│   │   │   │   ├── .next/
│   │   │   │   │   ├── app-build-manifest.json
│   │   │   │   │   ├── build-manifest.json
│   │   │   │   │   ├── cache/
│   │   │   │   │   │   ├── .rscinfo
│   │   │   │   │   │   ├── swc/
│   │   │   │   │   │   ├── webpack/
│   │   │   │   │   ├── package.json
│   │   │   │   │   ├── react-loadable-manifest.json
│   │   │   │   │   ├── server/
│   │   │   │   │   │   ├── app/
│   │   │   │   │   │   ├── login/
│   │   │   │   │   │   ├── receipts/
│   │   │   │   │   │   ├── _not-found/
│   │   │   │   │   ├── app-paths-manifest.json
│   │   │   │   │   ├── edge-runtime-webpack.js
│   │   │   │   │   ├── interception-route-rewrite-manifest.js
│   │   │   │   │   ├── middleware-build-manifest.js
│   │   │   │   │   ├── middleware-manifest.json
│   │   │   │   │   ├── middleware-react-loadable-manifest.js
│   │   │   │   │   ├── middleware.js
│   │   │   │   │   ├── next-font-manifest.js
│   │   │   │   │   ├── next-font-manifest.json
│   │   │   │   │   ├── pages-manifest.json
│   │   │   │   │   ├── server-reference-manifest.js
│   │   │   │   │   ├── server-reference-manifest.json
│   │   │   │   │   ├── static/
│   │   │   │   │   │   ├── webpack/
│   │   │   │   │   ├── vendor-chunks/
│   │   │   │   │   ├── webpack-runtime.js
│   │   │   │   ├── static/
│   │   │   │   │   ├── chunks/
│   │   │   │   │   ├── app/
│   │   │   │   │   ├── app-pages-internals.js
│   │   │   │   │   ├── main-app.js
│   │   │   │   │   ├── polyfills.js
│   │   │   │   │   ├── webpack.js
│   │   │   │   │   ├── css/
│   │   │   │   │   ├── development/
│   │   │   │   │   ├── media/
│   │   │   │   │   ├── webpack/
│   │   │   │   ├── trace
│   │   │   │   ├── types/
│   │   │   │   │   ├── app/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── receipts/
│   │   │   │   ├── cache-life.d.ts
│   │   │   │   ├── package.json
│   │   │   ├── eslint.config.mjs
│   │   │   ├── next-env.d.ts
│   │   │   ├── next.config.ts
│   │   │   ├── package-lock.json
│   │   │   ├── package.json
│   │   │   ├── postcss.config.mjs
│   │   │   ├── public/
│   │   │   │   ├── file.svg
│   │   │   │   ├── globe.svg
│   │   │   │   ├── next.svg
│   │   │   │   ├── vercel.svg
│   │   │   │   ├── window.svg
│   │   │   ├── README.md
│   │   │   ├── src/
│   │   │   │   ├── app/
│   │   │   │   │   ├── favicon.ico
│   │   │   │   │   ├── globals.css
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── test-button/
│   │   │   ├── tsconfig.json
│   │   ├── tsconfig.json
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   ├── firebase.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── ReduxTest.tsx
│   │   ├── contexts/
│   │   ├── core/
│   │   ├── design-system/
│   │   ├── features/
│   │   ├── locales/
│   │   ├── shared/
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── uiSlice.ts
│   │   ├── styles/
│   │   ├── utils/
│   │   │   ├── a11y/
│   │   │   │   ├── index.js
│   │   │   │   ├── index.ts
│   │   │   ├── connection.js
│   │   │   ├── errorHandler.js
│   │   │   ├── formatters/
│   │   │   │   ├── hebrew.js
│   │   │   ├── formatters.js
│   │   │   ├── indexedDbCache.js
│   │   │   ├── monitoring/
│   │   │   │   ├── sentry.js
│   │   │   │   ├── webVitals.js
│   │   │   ├── offline/
│   │   │   │   ├── syncManager.js
│   │   │   ├── performance/
│   │   │   │   ├── cache.js
│   ├── tailwind.config.js
│   ├── tests/
│   │   ├── integration/
│   │   │   ├── analyticsReporting.test.js
│   │   │   ├── authFlows.test.js
│   │   │   ├── documentProcessingFlow.test.js
│   │   │   ├── featureToggleFlows.test.js
│   │   │   ├── inventoryManagement.test.js
│   │   │   ├── receiptManagement.integration.test.js
│   │   │   ├── receiptManagement.test.js
│   ├── tsconfig.json
│   ├── utils/
│   │   ├── api.ts
│   │   ├── firebase.ts
├── rules-test/
│   ├── firestore-debug.log
│   ├── package-lock.json
│   ├── package.json
│   ├── test-rules.js
├── scripts/
│   ├── a11y-test.js
│   ├── final-validation.js
│   ├── migrate-button-imports.js
│   ├── migrate-charts.js
│   ├── performance-benchmark.js
│   ├── verify-env.js
├── seed-data.bat
├── seed-data.ps1
├── seed-emulators.ps1
├── server/
│   ├── .env
│   ├── .env.production
│   ├── .env.template
│   ├── admin-sdk-test.js
│   ├── combined.log
│   ├── config/
│   │   ├── ConfigurationService.js
│   │   ├── firebase.d.ts
│   │   ├── firebase.js
│   │   ├── multer-config.js
│   │   ├── service-account.json
│   │   ├── vision.js
│   ├── dist/
│   │   ├── app.d.ts
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   ├── alertController.d.ts
│   │   │   ├── alertController.js
│   │   │   ├── analyticsController.d.ts
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.d.ts
│   │   │   ├── authController.js
│   │   │   ├── categoryController.d.ts
│   │   │   ├── categoryController.js
│   │   │   ├── inventoryController.d.ts
│   │   │   ├── inventoryController.js
│   │   │   ├── receiptController.d.ts
│   │   │   ├── receiptController.js
│   │   │   ├── reportController.d.ts
│   │   │   ├── reportController.js
│   │   ├── middleware/
│   │   │   ├── auth/
│   │   │   │   ├── auth.d.ts
│   │   │   │   ├── auth.js
│   │   │   ├── performance/
│   │   │   │   ├── networkPerformance.d.ts
│   │   │   │   ├── networkPerformance.js
│   │   │   │   ├── performanceMonitoring.d.ts
│   │   │   │   ├── performanceMonitoring.js
│   │   │   ├── upload.d.ts
│   │   │   │   ├── upload.js
│   │   │   ├── validation/
│   │   │   │   ├── documentValidation.d.ts
│   │   │   │   ├── documentValidation.js
│   │   │   │   ├── validation.d.ts
│   │   │   │   ├── validation.js
│   │   ├── models/
│   │   │   ├── Category.d.ts
│   │   │   ├── Category.js
│   │   │   ├── Document.d.ts
│   │   │   ├── Document.js
│   │   │   ├── Inventory.d.ts
│   │   │   ├── Inventory.js
│   │   │   ├── InventoryAlert.d.ts
│   │   │   ├── InventoryAlert.js
│   │   │   ├── Product.d.ts
│   │   │   ├── Product.js
│   │   │   ├── Receipt.d.ts
│   │   │   ├── Receipt.js
│   │   │   ├── StockMovement.d.ts
│   │   │   ├── StockMovement.js
│   │   │   ├── User.d.ts
│   │   │   ├── User.js
│   │   │   ├── Vendor.d.ts
│   │   │   ├── Vendor.js
│   │   ├── routes/
│   │   │   ├── alertRoutes.d.ts
│   │   │   ├── alertRoutes.js
│   │   │   ├── analyticsRoutes.d.ts
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── authRoutes.d.ts
│   │   │   ├── authRoutes.js
│   │   │   ├── categoryRoutes.d.ts
│   │   │   ├── categoryRoutes.js
│   │   │   ├── diagnosticRoutes.d.ts
│   │   │   ├── diagnosticRoutes.js
│   │   │   ├── inventoryRoutes.d.ts
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── receiptRoutes.d.ts
│   │   │   ├── receiptRoutes.js
│   │   │   ├── reportRoutes.d.ts
│   │   │   ├── reportRoutes.js
│   │   ├── scripts/
│   │   │   ├── checkEnv.d.ts
│   │   │   ├── checkEnv.js
│   │   ├── services/
│   │   │   ├── alert/
│   │   │   │   ├── alertService.d.ts
│   │   │   │   ├── alertService.js
│   │   │   ├── analytics/
│   │   │   │   ├── analyticsService.d.ts
│   │   │   │   ├── analyticsService.js
│   │   │   ├── auth/
│   │   │   │   ├── AuthenticationService.d.ts
│   │   │   │   ├── AuthenticationService.js
│   │   │   ├── category/
│   │   │   │   ├── CategoryManagementService.d.ts
│   │   │   │   ├── CategoryManagementService.js
│   │   │   ├── document/
│   │   │   │   ├── DocumentProcessingService.d.ts
│   │   │   │   ├── DocumentProcessingService.js
│   │   │   │   ├── visionService.d.ts
│   │   │   │   ├── visionService.js
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryManagementService.d.ts
│   │   │   │   ├── InventoryManagementService.js
│   │   │   │   ├── stockTrackingService.d.ts
│   │   │   │   ├── stockTrackingService.js
│   │   │   ├── notification/
│   │   │   │   ├── NotificationService.d.ts
│   │   │   │   ├── NotificationService.js
│   │   │   ├── preprocessing.d.ts
│   │   │   │   ├── preprocessing.js
│   │   │   ├── receipts/
│   │   │   │   ├── ReceiptProcessingService.d.ts
│   │   │   │   ├── ReceiptProcessingService.js
│   │   │   ├── report/
│   │   │   │   ├── reportService.d.ts
│   │   │   │   ├── reportService.js
│   │   │   ├── validation/
│   │   │   │   ├── Validation Service.d.ts
│   │   │   │   ├── Validation Service.js
│   │   ├── utils/
│   │   │   ├── document/
│   │   │   │   ├── documentClassifier.d.ts
│   │   │   │   ├── documentClassifier.js
│   │   │   ├── error/
│   │   │   │   ├── AppError.d.ts
│   │   │   │   ├── AppError.js
│   │   │   │   ├── errorHandler.d.ts
│   │   │   │   ├── errorHandler.js
│   │   │   ├── logger.d.ts
│   │   │   │   ├── logger.js
│   │   │   ├── misc/
│   │   │   │   ├── priceCalculator.d.ts
│   │   │   │   ├── priceCalculator.js
│   │   │   │   ├── testUtils.d.ts
│   │   │   │   ├── testUtils.js
│   │   │   ├── performance/
│   │   │   │   ├── databasePerformance.d.ts
│   │   │   │   ├── databasePerformance.js
│   │   │   │   ├── performanceOptimizer.d.ts
│   │   │   │   ├── performanceOptimizer.js
│   │   │   ├── validation/
│   │   │   │   ├── validators.d.ts
│   │   │   │   ├── validators.js
│   ├── error.log
│   ├── esm-security-test.js
│   ├── extra/
│   │   ├── documentClassifier.js
│   │   ├── visionService.js
│   ├── firestore-debug.log
│   ├── firestore.rules
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── minimal-test.js
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── run-tests.js
│   ├── seed-all.js
│   ├── seed-auth.cjs
│   ├── seed-firestore.cjs
│   ├── simple-connection-test.cjs
│   ├── simple-security-test.js
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   │   ├── swagger.js
│   │   ├── controllers/
│   │   │   ├── alertController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── documentController.js
│   │   │   ├── exportController.js
│   │   │   ├── inventoryController.js
│   │   │   ├── receiptController.js
│   │   │   ├── reportController.js
│   │   ├── middleware/
│   │   │   ├── auth/
│   │   │   │   ├── auth.js
│   │   │   ├── performance/
│   │   │   │   ├── networkPerformance.js
│   │   │   │   ├── performanceMonitoring.js
│   │   │   ├── security/
│   │   │   │   ├── security.js
│   │   │   ├── upload.js
│   │   │   ├── validation/
│   │   │   │   ├── documentValidation.js
│   │   │   │   ├── validation.js
│   │   ├── models/
│   │   │   ├── Category.js
│   │   │   ├── Document.js
│   │   │   ├── Inventory.js
│   │   │   ├── InventoryAlert.js
│   │   │   ├── Product.js
│   │   │   ├── Receipt.js
│   │   │   ├── StockMovement.js
│   │   │   ├── User.js
│   │   │   ├── Vendor.js
│   │   ├── routes/
│   │   │   ├── alertRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── diagnosticRoutes.js
│   │   │   ├── documentRoutes.js
│   │   │   ├── exportRoutes.js
│   │   │   ├── inventoryRoutes.js
│   │   │   ├── receiptRoutes.js
│   │   │   ├── reportRoutes.js
│   │   ├── scripts/
│   │   │   ├── checkEnv.js
│   │   │   ├── seedCategories.js
│   │   ├── services/
│   │   │   ├── alert/
│   │   │   │   ├── alertService.js
│   │   │   ├── analytics/
│   │   │   │   ├── analyticsService.js
│   │   │   ├── auth/
│   │   │   │   ├── AuthenticationService.js
│   │   │   ├── category/
│   │   │   │   ├── CategoryManagementService.js
│   │   │   ├── core/
│   │   │   │   ├── BaseService.js
│   │   │   ├── document/
│   │   │   │   ├── DocumentProcessingService.js
│   │   │   │   ├── documentService.js
│   │   │   ├── export/
│   │   │   │   ├── exportService.js
│   │   │   ├── imageOptimization/
│   │   │   │   ├── ImageOptimizationService.js
│   │   │   ├── inventory/
│   │   │   │   ├── categoryService.js
│   │   │   │   ├── InventoryManagementService.js
│   │   │   │   ├── inventoryService.js
│   │   │   │   ├── stockTrackingService.js
│   │   │   ├── notification/
│   │   │   │   ├── NotificationService.js
│   │   │   ├── orchestration/
│   │   │   │   ├── DocumentProcessingOrchestrator.js
│   │   │   ├── preprocessing.js
│   │   │   ├── receipts/
│   │   │   │   ├── ReceiptProcessingService.js
│   │   │   ├── report/
│   │   │   │   ├── reportService.js
│   │   │   ├── textExtraction/
│   │   │   │   ├── GoogleVisionAdapter.js
│   │   │   │   ├── TesseractAdapter.js
│   │   │   │   ├── TextExtractionService.js
│   │   │   ├── validation/
│   │   │   │   ├── Validation Service.js
│   │   ├── utils/
│   │   │   ├── document/
│   │   │   ├── error/
│   │   │   │   ├── AppError.js
│   │   │   │   ├── errorHandler.js
│   │   │   ├── errorHandler.js
│   │   │   ├── logger.js
│   │   │   ├── misc/
│   │   │   │   ├── priceCalculator.js
│   │   │   │   ├── testUtils.js
│   │   │   ├── performance/
│   │   │   │   ├── databasePerformance.js
│   │   │   │   ├── performanceOptimizer.js
│   │   │   ├── sanitize/
│   │   │   │   ├── inputSanitizer.js
│   │   │   ├── text/
│   │   │   │   ├── hebrewNormalizer.js
│   │   │   ├── validation/
│   │   │   │   ├── validators.js
│   ├── technical-documentation.md
│   ├── test-emulator-connection.js
│   ├── tests/
│   │   ├── analyticsCalculation.test.js
│   │   ├── backend-tester.js
│   │   ├── categorySystem.test.js
│   │   ├── documentProcessing.test.js
│   │   ├── documentProcessingService.test.js
│   │   ├── firestore/
│   │   │   ├── indexVerification.test.js
│   │   ├── fixtures/
│   │   │   ├── blank.jpg
│   │   │   ├── document.jpg
│   │   │   ├── invalid.jpg
│   │   │   ├── low-contrast.jpg
│   │   │   ├── receipt.jpg
│   │   │   ├── test-image.jpg
│   │   ├── inventoryManagement.test.js
│   │   ├── minimal-test.js
│   │   ├── receiptParser-tester.js
│   │   ├── security/
│   │   │   ├── firestore.test.js
│   │   │   ├── README.md
│   │   │   ├── simplified-firestore.test.js
│   │   │   ├── storage.test.js
│   │   ├── setup.js
│   │   ├── storage/
│   │   │   ├── storage.rules.test.js
│   │   ├── __mocks__/
│   │   │   ├── @google-cloud/
│   │   │   │   ├── vision.js
│   │   │   ├── firebase/
│   │   │   │   ├── storage.js
│   ├── tsconfig.json
│   ├── verify-seeding.js
├── setupTest.js
├── storage.rules
├── temp-test.txt
└── work plan 10.5.md
```<environment_details>
# VSCode Visible Files
docs/known-issues.md

# VSCode Open Tabs
seed-data.ps1
firebase.json
server/seed-auth.js
server/simple-connection-test.js
server/package.json
storage.rules
server/verify-seeding.js
server/seed-firestore.cjs
server/seed-auth.cjs
client/src/core/config/featureFlags.js
client/src/features/analytics/utils/__tests__/calculators.test.js
client/src/features/analytics/utils/calculators.js
client/src/features/analytics/utils/dataFetchers.js
client/src/utils/indexedDbCache.js
client/src/features/analytics/services/analyticsService.js
docs/developer/analytics-service-client-side.md
docs/testing/firebase-integration-test-plan.md
client/src/features/auth/__tests__/authService.test.js
client/src/features/receipts/__tests__/receipts.test.js
client/src/features/inventory/__tests__/inventoryService.test.js
client/src/features/analytics/__tests__/analyticsService.test.js
client/src/core/config/__tests__/featureFlags.test.js
server/tests/security/firestore.test.js
server/tests/security/storage.test.js
client/tests/integration/authFlows.test.js
client/tests/integration/receiptManagement.test.js
client/tests/integration/documentProcessingFlow.test.js
client/tests/integration/inventoryManagement.test.js
client/tests/integration/analyticsReporting.test.js
client/tests/integration/featureToggleFlows.test.js
docs/testing/firebase-integration-test-automation.md
client/src/features/documents/__tests__/documentProcessingService.test.js.new
client/tests/integration/receiptManagement.integration.test.js
client/src/features/documents/__tests__/documentProcessingService.test.js
docs/firebase-direct-integration-migration-log.md
generate_tree.js
docs/project-structure.md
docs/management/documentation-inventory.md
docs/management/documentation-gap-analysis.md
docs/templates/architecture-template.md
docs/templates/feature-template.md
docs/templates/api-template.md
docs/templates/implementation-template.md
docs/templates/workflow-template.md
docs/templates/template-usage-guide.md
docs/management/documentation-quality-assessment.md
docs/management/documentation-hierarchy.md
docs/management/documentation-consolidation-plan.md
docs/archive/README.md
docs/api/endpoints/README.md
docs/guides/error-handling.md
docs/firebase/integration-architecture.md
docs/firebase/migration-history.md
.markdownlint.jsonc
scripts/link-validator.js
scripts/template-conformance-checker.js
scripts/code-example-validator.js
scripts/generate-doc-template.js
scripts/generate-doc-status-report.js
scripts/cross-reference-validator.js
.github/PULL_REQUEST_TEMPLATE.md
docs/development/documentation-review-checklist.md
docs/development/documentation-change-template.md
scripts/generate-doc-health-metrics.js
package.json
docs/core/architecture.md
docs/core/project-structure.md
docs/core/security-model.md
docs/core/data-flows.md
docs/core/data-model.md
docs/features/auth/overview.md
docs/features/auth/implementation.md
docs/features/auth/firebase-auth.md
docs/features/auth/roles-permissions.md
docs/features/receipts/overview.md
docs/features/receipts/scanning.md
docs/features/receipts/processing.md
docs/features/receipts/storage.md
docs/features/receipts/search-filter.md
docs/features/documents/overview.md
docs/features/documents/storage.md
docs/features/documents/lifecycle.md
docs/features/documents/metadata.md
docs/features/inventory/overview.md
docs/features/inventory/implementation.md
docs/features/inventory/data-models.md
docs/features/inventory/stock-management.md
docs/features/inventory/alerts-notifications.md
docs/features/inventory/search-filter.md
docs/features/analytics/overview.md
docs/features/analytics/implementation.md
docs/features/analytics/data-sources.md
docs/features/analytics/calculations-metrics.md
docs/features/analytics/visualization.md
docs/features/analytics/filtering-customization.md
docs/features/analytics/export.md
docs/firebase/overview.md
docs/firebase/authentication.md
docs/firebase/firestore.md
docs/firebase/security-rules.md
docs/firebase/migration.md
docs/firebase/testing.md
docs/api/firebase/auth.md
docs/api/firebase/firestore.md
docs/api/firebase/storage.md
docs/developer/specifications/specification-api.md
docs/guides/development-setup.md
docs/guides/testing-environment.md
docs/guides/deployment-process.md
docs/guides/development-process-workflow.md
docs/guides/code-review-guidelines.md
docs/guides/testing-requirements.md
docs/guides/documentation-update-process.md
docs/guides/feature-flag-management.md
docs/guides/release-process.md
docs/guides/tools-and-utilities.md
docs/developer/guides/feature-toggle-system.md
docs/user/firebase-integration-changes.md
doc-similarity.js
doc-quality.js
doc-inventory.js
docs/README.md
docs/firebase-testing.md
docs/known-issues.md
seed-data.bat
server/test-emulator-connection.js
server/seed-all.js

# Current Time
5/16/2025, 10:33:28 PM (Asia/Jerusalem, UTC+3:00)

# Context Window Usage
200,051 / 1,048.576K tokens used (19%)

# Current Mode
ACT MODE
</environment_details>
