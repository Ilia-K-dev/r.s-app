---
title: "React Project Map"
creation_date: 2025-05-16
update_history:
  - date: 2025-05-16
    description: Added YAML front matter and navigation headers.
status: Completed
owner: Cline EDI Assistant
related_files:
  - docs/core/project-structure.md
  - docs/developer/architecture/architecture-api-integration-map.md
---

# React Project Map: Receipt & Inventory Management System

[Home](/docs) > [Developer Documentation](/docs/developer) > [Architecture Documentation](/docs/developer/architecture) > React Project Map

## In This Document
- [Project Overview](#project-overview)
- [Architecture Overview](#architecture-overview)
- [Frontend Structure](#frontend-structure)
  - [Core Module](#core-module)
  - [Authentication Feature](#authentication-feature)
  - [Document/Receipt Processing Feature](#documentreceipt-processing-feature)
  - [Receipt Management Feature](#receipt-management-feature)
  - [Inventory Management Feature](#inventory-management-feature)
  - [Analytics Feature](#analytics-feature)
  - [Settings Feature](#settings-feature)
  - [Shared Components and Utilities](#shared-components-and-utilities)
- [Backend Structure](#backend-structure)
  - [API Routes](#api-routes)
  - [Controllers](#controllers)
  - [Middleware](#middleware)
  - [Services](#services)
  - [Models](#models)
- [Key Integration Points](#key-integration-points)
  - [API Integration](#api-integration)
  - [Authentication Flow](#authentication-flow)
  - [Document/Receipt Processing Flow](#documentreceipt-processing-flow)
  - [Inventory Management Flow](#inventory-management-flow)
  - [Analytics and Reporting Flow](#analytics-and-reporting-flow)
- [Technology Stack](#technology-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Database and Storage](#database-and-storage)
- [Conclusion](#conclusion)

## Related Documentation
- [Project Structure](../../core/project-structure.md)
- [API Integration Map](../architecture-api-integration-map.md)

## Project Overview

This application is a comprehensive receipt and inventory management system built with React on the frontend and Node.js/Express on the backend. It uses Firebase for authentication, storage, and database functionality. The application allows users to scan and process receipts, manage inventory, track expenses, and generate analytics reports.

## Architecture Overview

The project follows a feature-based architecture with clear separation of concerns:

```
client/                  # Frontend React application
├── public/              # Static assets
└── src/                 # Source code
    ├── core/            # Core application components and configuration
    ├── features/        # Feature modules (auth, receipts, inventory, etc.)
    ├── shared/          # Shared utilities, components, and services
    └── styles/          # Global styles

server/                  # Backend Node.js/Express application
├── config/              # Server configuration
├── src/                 # Source code
    ├── controllers/     # Request handlers
    ├── middleware/      # Express middleware
    ├── models/          # Data models
    ├── routes/          # API routes
    ├── services/        # Business logic
    └── utils/           # Utility functions
```

## Frontend Structure

### Core Module

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `client/src/App.js` | Main application component | Initializes Firebase and sets up providers | React Router, Firebase, AuthContext, ToastContext | Entry point for the application |
| `client/src/routes.js` | Application routing | Defines routes and protected routes | React Router | Connects pages to URLs |
| `client/src/core/contexts/AuthContext.js` | Authentication context | Manages user authentication state | Firebase Auth | Used throughout the app for auth state |
| `client/src/core/contexts/ToastContext.js` | Toast notification context | Manages application notifications | React | Used for user feedback throughout the app |
| `client/src/core/config/firebase.js` | Firebase configuration | Initializes Firebase services | Firebase | Used by services that interact with Firebase |
| `client/src/core/config/constants.js` | Application constants | Defines global constants | None | Referenced throughout the application |

### Authentication Feature

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `client/src/features/auth/components/LoginPage.js` | Login page | User login interface | AuthContext, React Hook Form | Connects to auth service |
| `client/src/features/auth/components/RegisterPage.js` | Registration page | User registration interface | AuthContext, React Hook Form | Connects to auth service |
| `client/src/features/auth/components/ForgotPasswordPage.js` | Password reset | Password recovery interface | AuthContext | Connects to auth service |
| `client/src/features/auth/components/AuthGuard.js` | Route protection | Protects routes from unauthenticated access | AuthContext, React Router | Used in routes.js |
| `client/src/features/auth/types/authTypes.ts` | Auth type definitions | TypeScript types for auth data | TypeScript | Used by auth components |

### Document/Receipt Processing Feature

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `client/src/features/documents/components/DocumentScanner.js` | Document scanner | Handles document scanning and processing | BaseDocumentHandler, imageProcessing | Used in receipt upload flow |
| `client/src/features/documents/components/FileUploader.js` | File upload component | Handles file uploads | React Dropzone | Used in document scanner |
| `client/src/features/documents/components/ReceiptPreview.js` | Receipt preview | Displays scanned receipt | None | Used after scanning |
| `client/src/features/documents/services/documentProcessingService.js` | Document processing | Processes and stores documents | Firebase Storage, OCR | Core document processing logic |
| `client/src/features/documents/services/visionService.js` | OCR service | Extracts text from images | External OCR API | Used by document processing service |
| `client/src/features/documents/utils/imageProcessing.js` | Image processing | Optimizes images for OCR | Image manipulation libraries | Used before OCR processing |
| `client/src/features/documents/hooks/useDocumentScanner.js` | Scanner hook | Custom hook for document scanning | React | Used by scanner components |
| `client/src/features/documents/hooks/useOCR.js` | OCR hook | Custom hook for OCR operations | React | Used by document processing components |

### Receipt Management Feature

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `client/src/features/receipts/components/ReceiptCard.js` | Receipt card | Displays receipt summary | UI components | Used in receipt list |
| `client/src/features/receipts/components/ReceiptDetail.js` | Receipt detail | Displays detailed receipt information | UI components | Used in receipt detail page |
| `client/src/features/receipts/components/ReceiptEdit.js` | Receipt editor | Allows editing receipt data | Form components | Used in receipt detail page |
| `client/src/features/receipts/components/ReceiptFilters.js` | Receipt filters | Filters for receipt list | UI components | Used in receipts page |
| `client/src/features/receipts/components/ReceiptForm.js` | Receipt form | Form for receipt data | Form components | Used in receipt edit/create |
| `client/src/features/receipts/components/ReceiptList.js` | Receipt list | Displays list of receipts | UI components, ReceiptCard | Used in receipts page |
| `client/src/features/receipts/hooks/useReceipts.js` | Receipts hook | Custom hook for receipt operations | React, API | Used by receipt components |
| `client/src/features/receipts/services/receipts.js` | Receipt service | API calls for receipt operations | API service | Used by receipt hooks |
| `client/src/features/receipts/utils/validation.js` | Receipt validation | Validates receipt data | None | Used by receipt form |
| `client/src/features/receipts/utils/extra-formatters.js` | Receipt formatters | Formats receipt data | None | Used by receipt components |

### Inventory Management Feature

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `client/src/features/inventory/components/InventoryItem.js` | Inventory item | Displays inventory item | UI components | Used in inventory list |
| `client/src/features/inventory/components/InventoryList.js` | Inventory list | Displays list of inventory items | UI components, useInventory | Used in inventory page |
| `client/src/features/inventory/components/StockAlerts.js` | Stock alerts | Displays low stock alerts | UI components | Used in dashboard |
| `client/src/features/inventory/components/StockManager.js` | Stock manager | Manages stock levels | UI components | Used in inventory page |
| `client/src/features/inventory/hooks/useInventory.js` | Inventory hook | Custom hook for inventory operations | React, inventoryService | Used by inventory components |
| `client/src/features/inventory/hooks/useStockManagement.js` | Stock hook | Custom hook for stock operations | React, stockService | Used by stock components |
| `client/src/features/inventory/services/inventoryService.js` | Inventory service | Firebase operations for inventory | Firebase | Used by inventory hooks |
| `client/src/features/inventory/services/stockService.js` | Stock service | Operations for stock management | Firebase | Used by stock hooks |
| `client/src/features/inventory/utils/stockCalculations.js` | Stock calculations | Utility functions for stock calculations | None | Used by inventory components |

### Analytics Feature

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `client/src/features/analytics/components/dashboard/AnalyticsDashboard.js` | Analytics dashboard | Main analytics dashboard | Recharts, UI components | Used in dashboard page |
| `client/src/features/analytics/components/dashboard/DashboardStats.js` | Dashboard stats | Key metrics display | UI components | Used in dashboard |
| `client/src/features/analytics/components/dashboard/SpendingSummary.js` | Spending summary | Summarizes spending data | UI components | Used in dashboard |
| `client/src/features/analytics/components/CategoryBreakdown.js` | Category breakdown | Visualizes spending by category | Recharts | Used in reports |
| `client/src/features/analytics/components/SpendingChart.js` | Spending chart | Visualizes spending trends | Recharts | Used in reports |
| `client/src/features/analytics/components/SpendingTrends.js` | Spending trends | Analyzes spending patterns | Recharts | Used in reports |
| `client/src/features/analytics/components/BudgetProgress.js` | Budget progress | Tracks budget progress | UI components | Used in reports |
| `client/src/features/analytics/components/PredictiveAnalytics.js` | Predictive analytics | Predicts future spending | Recharts | Used in reports |
| `client/src/features/analytics/hooks/useAnalytics.js` | Analytics hook | Custom hook for analytics data | React, analyticsService | Used by analytics components |
| `client/src/features/analytics/hooks/useReports.js` | Reports hook | Custom hook for report generation | React, analyticsService | Used by report components |
| `client/src/features/analytics/services/analyticsService.js` | Analytics service | Processes analytics data | Firebase | Used by analytics hooks |
| `client/src/features/analytics/utils/analyticsCalculations.js` | Analytics calculations | Utility functions for analytics | None | Used by analytics components |

### Settings Feature

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `client/src/features/settings/components/ProfileSettings.js` | Profile settings | User profile management | UI components | Used in settings page |
| `client/src/features/settings/components/NotificationSettings.js` | Notification settings | Manages user notifications | UI components | Used in settings page |
| `client/src/features/settings/components/CategorySettings.js` | Category settings | Manages expense categories | UI components | Used in settings page |
| `client/src/features/settings/hooks/useSettings.js` | Settings hook | Custom hook for settings operations | React, settingsService | Used by settings components |
| `client/src/features/settings/services/settingsService.js` | Settings service | API calls for settings operations | API service | Used by settings hooks |
| `client/src/features/settings/utils/settingsHelpers.js` | Settings helpers | Utility functions for settings | None | Used by settings components |

### Shared Components and Utilities

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `client/src/shared/components/ui/Card.js` | Card component | Reusable card UI component | UI library | Used throughout the app |
| `client/src/shared/components/ui/Table.js` | Table component | Reusable table UI component | UI library | Used throughout the app |
| `client/src/shared/components/ui/SearchBar.js` | Search bar | Reusable search component | UI library | Used in list views |
| `client/src/shared/components/ui/PerformanceOptimizedList.js` | Optimized list | Performance-optimized list component | React virtualization | Used for long lists |
| `client/src/shared/components/charts/ChartWrapper.js` | Chart wrapper | Wrapper for chart components | Recharts | Used by analytics charts |
| `client/src/shared/components/charts/DonutChart.js` | Donut chart | Reusable donut chart | Recharts | Used in analytics |
| `client/src/shared/components/forms/Input.js` | Input component | Reusable form input | UI library | Used in forms |
| `client/src/shared/components/layout/Layout.js` | Layout component | Main application layout | UI library | Used as main layout |
| `client/src/shared/services/api.js` | API service | Handles API requests | Axios | Used by feature services |
| `client/src/shared/services/storage.js` | Storage service | Handles local storage | None | Used for client-side storage |
| `client/src/shared/utils/currency.js` | Currency utilities | Currency formatting functions | None | Used throughout the app |
| `client/src/shared/utils/date.js` | Date utilities | Date formatting functions | None | Used throughout the app |
| `client/src/shared/utils/formatters.js` | General formatters | General formatting utilities | None | Used throughout the app |
| `client/src/shared/utils/validation.js` | Validation utilities | Form validation functions | None | Used in forms |
| `client/src/shared/hooks/useToast.js` | Toast hook | Custom hook for notifications | ToastContext | Used throughout the app |
| `client/src/shared/hooks/useLocalStorage.js` | Local storage hook | Custom hook for local storage | None | Used for persistent state |

## Backend Structure

### API Routes

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `server/src/routes/authRoutes.js` | Auth routes | Authentication endpoints | authController | Used for user authentication |
| `server/src/routes/receiptRoutes.js` | Receipt routes | Receipt management endpoints | receiptController | Used for receipt operations |
| `server/src/routes/inventoryRoutes.js` | Inventory routes | Inventory management endpoints | inventoryController | Used for inventory operations |
| `server/src/routes/analyticsRoutes.js` | Analytics routes | Analytics endpoints | analyticsController | Used for analytics data |
| `server/src/routes/categoryRoutes.js` | Category routes | Category management endpoints | categoryController | Used for category operations |
| `server/src/routes/alertRoutes.js` | Alert routes | Alert management endpoints | alertController | Used for system alerts |
| `server/src/routes/reportRoutes.js` | Report routes | Report generation endpoints | reportController | Used for generating reports |
| `server/src/routes/diagnosticRoutes.js` | Diagnostic routes | System diagnostic endpoints | Various controllers | Used for system diagnostics |

### Controllers

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `server/src/controllers/authController.js` | Auth controller | Handles authentication requests | AuthenticationService | Connected to auth routes |
| `server/src/controllers/receiptController.js` | Receipt controller | Handles receipt operations | ReceiptProcessingService | Connected to receipt routes |
| `server/src/controllers/inventoryController.js` | Inventory controller | Handles inventory operations | InventoryManagementService | Connected to inventory routes |
| `server/src/controllers/analyticsController.js` | Analytics controller | Handles analytics requests | analyticsService | Connected to analytics routes |
| `server/src/controllers/categoryController.js` | Category controller | Handles category operations | CategoryManagementService | Connected to category routes |
| `server/src/controllers/alertController.js` | Alert controller | Handles alert operations | alertService | Connected to alert routes |
| `server/src/controllers/reportController.js` | Report controller | Handles report generation | reportService | Connected to report routes |

### Middleware

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `server/src/middleware/auth/auth.js` | Auth middleware | Authenticates API requests | Firebase Admin | Used in protected routes |
| `server/src/middleware/upload.js` | Upload middleware | Handles file uploads | Multer | Used in routes with file uploads |
| `server/src/middleware/validation/validation.js` | Validation middleware | Validates request data | Validators | Used in routes for data validation |
| `server/src/middleware/performance/performanceMonitoring.js` | Performance middleware | Monitors API performance | Logger | Used globally for performance tracking |

### Services

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `server/src/services/auth/AuthenticationService.js` | Auth service | Handles authentication logic | Firebase Admin | Used by auth controller |
| `server/src/services/receipts/ReceiptProcessingService.js` | Receipt service | Processes receipt data | Firebase, Vision API | Used by receipt controller |
| `server/src/services/document/DocumentProcessingService.js` | Document service | Processes document data | Firebase, Vision API | Used by receipt service |
| `server/src/services/document/visionService.js` | Vision service | OCR and image analysis | Google Vision API | Used by document service |
| `server/src/services/inventory/InventoryManagementService.js` | Inventory service | Manages inventory data | Firebase | Used by inventory controller |
| `server/src/services/inventory/stockTrackingService.js` | Stock service | Tracks stock levels | Firebase | Used by inventory service |
| `server/src/services/analytics/analyticsService.js` | Analytics service | Processes analytics data | Firebase | Used by analytics controller |
| `server/src/services/report/reportService.js` | Report service | Generates reports | Firebase | Used by report controller |
| `server/src/services/category/CategoryManagementService.js` | Category service | Manages categories | Firebase | Used by category controller |
| `server/src/services/alert/alertService.js` | Alert service | Manages system alerts | Firebase | Used by alert controller |
| `server/src/services/notification/NotificationService.js` | Notification service | Sends notifications | Firebase | Used by various services |

### Models

| File Path | Description | Functionality | Dependencies | Connections |
|-----------|-------------|---------------|--------------|-------------|
| `server/src/models/User.js` | User model | User data structure | None | Used by auth service |
| `server/src/models/Receipt.js` | Receipt model | Receipt data structure | None | Used by receipt service |
| `server/src/models/Document.js` | Document model | Document data structure | None | Used by document service |
| `server/src/models/Inventory.js` | Inventory model | Inventory data structure | None | Used by inventory service |
| `server/src/models/InventoryAlert.js` | Inventory alert model | Alert data structure | None | Used by alert service |
| `server/src/models/Product.js` | Product model | Product data structure | None | Used by inventory service |
| `server/src/models/StockMovement.js` | Stock movement model | Stock movement data structure | None | Used by stock service |
| `server/src/models/Category.js` | Category model | Category data structure | None | Used by category service |
| `server/src/models/Vendor.js` | Vendor model | Vendor data structure | None | Used by inventory service |

## Key Integration Points

### API Integration

The frontend communicates with the backend through the API service (`client/src/shared/services/api.js`), which uses Axios to make HTTP requests. Each feature module has its own service that uses this API service to perform specific operations.

### Authentication Flow

1. User logs in through `LoginPage.js`
2. Authentication request is sent to `/api/auth/login` endpoint
3. `authController.js` processes the request using `AuthenticationService.js`
4. Firebase authentication token is returned to the client
5. Token is stored and used for subsequent API requests
6. `AuthContext.js` maintains the authentication state throughout the application
7. `auth.js` middleware validates the token on protected API endpoints

### Document/Receipt Processing Flow

1. User uploads a document through `DocumentScanner.js` or `FileUploader.js`
2. Image is preprocessed using `imageProcessing.js`
3. Document is sent to the backend through the API
4. `receiptController.js` receives the document and passes it to `ReceiptProcessingService.js`
5. `DocumentProcessingService.js` processes the document using `visionService.js` for OCR
6. Extracted data is validated and stored in Firebase
7. Receipt data is returned to the client and displayed in `ReceiptPreview.js`

### Inventory Management Flow

1. User interacts with inventory through `InventoryList.js` and `StockManager.js`
2. Inventory operations are handled by `useInventory.js` and `useStockManagement.js` hooks
3. These hooks use `inventoryService.js` and `stockService.js` to communicate with the API
4. API requests are processed by `inventoryController.js`
5. `InventoryManagementService.js` and `stockTrackingService.js` handle the business logic
6. Data is stored in and retrieved from Firebase
7. Stock alerts are generated by `alertService.js` and displayed in `StockAlerts.js`

### Analytics and Reporting Flow

1. User views analytics through `AnalyticsDashboard.js` and various chart components
2. Data is fetched using `useAnalytics.js` and `useReports.js` hooks
3. These hooks use `analyticsService.js` to communicate with the API
4. API requests are processed by `analyticsController.js` and `reportController.js`
5. `analyticsService.js` and `reportService.js` aggregate and process the data
6. Processed data is returned to the client and visualized using Recharts components

## Technology Stack

### Frontend
- React.js: UI library
- React Router: Routing
- Axios: HTTP client
- Recharts: Data visualization
- Firebase SDK: Authentication and database access
- Tailwind CSS: Styling

### Backend
- Node.js: Runtime environment
- Express.js: Web framework
- Firebase Admin SDK: Authentication and database management
- Google Cloud Vision API: OCR and image analysis
- Multer: File upload handling

### Database and Storage
- Firebase Firestore: NoSQL database
- Firebase Storage: File storage

## Conclusion

This application is a comprehensive solution for receipt and inventory management with robust features for document processing, inventory tracking, and analytics. The architecture follows modern best practices with a clear separation of concerns and a modular approach to feature development.<environment_details>
# VSCode Visible Files
docs/developer/architecture/architecture-overview.md

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
docs/project-structure.md
docs/analysis/code-quality/analysis-code-quality-issues.md
docs/analysis/code-quality/analysis-dependency-map.md
docs/analysis/code-quality/analysis-routing-consistency.md
docs/analysis/code-quality/analysis-service-consolidation.md
docs/analysis/code-structure/analysis-file-inventory.md
docs/analysis/configuration/analysis-firebase-config.md
docs/analysis/configuration/analysis-vision-api-config.md
docs/analysis/performance/analysis-performance-bottlenecks.md
docs/analysis/security/analysis-security-vulnerabilities.md
docs/analysis/system/analysis-technology-implementation.md
docs/analysis/system-health/analysis-system-health-dashboard.md
docs/analysis/ui-ux/analysis-ui-ux-consistency.md
docs/api/README.md
docs/api/endpoints/README.md
docs/api/firebase/auth.md
docs/api/firebase/firestore.md
docs/api/firebase/storage.md
docs/developer/analytics-service-client-side.md
docs/developer/architecture/architecture-api-integration-map.md
docs/developer/architecture/architecture-database-schema-analysis.md
docs/developer/architecture/architecture-overview.md
docs/developer/architecture/architecture-project-map.md
seed-data.bat
server/test-emulator-connection.js
server/seed-all.js

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
docs/developer/architecture/architecture-project-map.md

# Current Time
5/16/2025, 10:47:05 PM (Asia/Jerusalem, UTC+3:00)

# Context Window Usage
962,000 / 1,048.576K tokens used (91%)

# Current Mode
ACT MODE
</environment_details>
