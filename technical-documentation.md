# Receipt Scanner Application Technical Documentation
Last Updated: 2025-04-30

## Overview
This document provides detailed descriptions of implemented components and features, key design decisions, implementation approaches, dependencies, code structure explanations, usage examples, important code snippets, and potential future improvements.

**For a detailed view of the current file structure and architecture, please refer to `project-structure.md`.**
**For a list of known issues and areas for future improvement, please refer to `technical-debt.md`.**
**For a summary of recent development activities, please refer to `comprehensive-summary.md`.**
**For detailed reports on specific implementation tasks, please refer to the `implementation-report-prompt-*.md` files.**
**For detailed checklists of completed tasks, please refer to the `checklist-prompt-*.md` files and the `receipt-scanner-master-checklist.md`.**

## Components and Features
- Authentication System
- Core UI Components
- Document Scanning and OCR
- Receipt Management
- Inventory Tracking
- Analytics and Reporting
- Settings and User Preferences
- Testing and Deployment (including Security Rules Testing)
- Backend API Endpoints (Inventory, Analytics, Export, Documents)
- Centralized API Client
- Performance Optimizations (Pagination, Filtering, Caching, Memoization)
- Standardized Error Handling

## Design Decisions
- Use of React functional components with hooks
- TypeScript for type safety where implemented
- Firebase SDK v9+ for backend services (Admin SDK on server, Client SDK on client for Auth)
- Modular and reusable component architecture (feature-based structure)
- API-centric architecture with backend handling sensitive operations and complex logic
- Standardized Error Handling across client and server
- Server-side data processing and aggregation for analytics
- Centralized API client for consistent communication, authentication, and error handling
- Client-side caching for improved performance of static/infrequently changing data
- Targeted memoization for optimized rendering
- Cursor-based pagination and server-side filtering for large datasets

## Authentication System

### Overview
Authentication is implemented using Firebase Authentication with email/password and Google OAuth providers.

### Components
- **AuthContext.js**: React Context for global auth state management (`client/src/core/contexts/AuthContext.js`)
  - Provides current user object
  - Handles auth state persistence
  - Exports useAuth hook
  - Includes login, register (with displayName), logout, and resetPassword functions
- **useAuth Hook**: Custom hook for accessing auth context (`client/src/features/auth/hooks/useAuth.js`)
- **LoginPage.js**: Component for user login (`client/src/features/auth/components/LoginPage.js`)
- **RegisterPage.js**: Component for user registration (`client/src/features/auth/components/RegisterPage.js`)
- **AuthGuard.js**: Component for protecting routes (`client/src/features/auth/components/AuthGuard.js`)
- **ForgotPasswordPage.js**: Component for password reset (`client/src/features/auth/components/ForgotPasswordPage.js`)

### Implementation Details
Built with React functional components and Tailwind CSS. Designed for reusability. Authentication logic primarily resides in the client-side Firebase SDK, managed via the `AuthContext` and `useAuth` hook. Server-side authentication middleware (`server/src/middleware/auth/auth.js`) verifies tokens for protected API routes.

## Document Scanning and OCR

### Overview
Handles document upload and processing initiation on the client. Core OCR logic, image preprocessing, data parsing, and saving reside on the server. The document processing API has been enhanced for improved OCR accuracy and error handling, and a new endpoint for receipt correction has been added.

### Components & Hooks
- **BaseDocumentHandler.js**: Core component for handling file selection/capture and preview (`client/src/features/documents/components/BaseDocumentHandler.js`). Uses shared `validateFile`.
- **useDocumentScanner.js**: Hook managing the document scanning process state and interaction with services (`client/src/features/documents/hooks/useDocumentScanner.js`). Uses shared `validateFile`.
- **useOCR.js**: Hook potentially overlapping with `useDocumentScanner`, needs review (`client/src/features/documents/hooks/useOCR.js`). Uses shared `validateFile`.

### Implementation Details
Client components trigger processing via services that call the backend API (`/api/documents/upload`). Server-side services (`server/src/services/document/documentService.js`, integrating logic from `server/extra/visionService.js` and `server/extra/documentClassifier.js`) handle image preprocessing, Cloud Vision API interaction, robust receipt data parsing (merchant, date, total, with confidence scores), and saving to Firestore. A `PUT /api/documents/correct/:id` endpoint allows users to submit corrections, storing both original and corrected data. Server-side fetching with pagination and filtering has been implemented for documents/receipts.

### Considerations
- Several related components (`DocumentPreview`, `DocumentScanner`, `FileUploader`, `ReceiptScanner`, `2ReceiptUploader`, `extra.ScannerInterface`) have been moved to `/client/extra` as they were redundant or unused.
- `client/src/features/documents/utils/validation.js` was removed; validation now uses `client/src/shared/utils/fileHelpers.js`.
- **Technical Debt:** Potential consolidation needed for `useDocumentScanner` and `useOCR` hooks, and server-side document/vision services. See `technical-debt.md`.

## Receipt Management

### Overview
Client-side components and services for managing receipts. The `/receipts` route now points to a dedicated list page component.

### Components & Hooks
- **Receipt API Service (receipts.js)**: Client-side service for receipt API interactions (`client/src/features/receipts/services/receipts.js`). Uses the centralized `api.js` client.
- **Receipt Uploader Component (ReceiptUploader.js)**: UI for uploading receipts (`client/src/features/receipts/components/ReceiptUploader.js`).
- **useReceipts Hook**: Manages receipt data state (`client/src/features/receipts/hooks/useReceipts.js`). Uses the `receipts.js` service. Mutation functions use `useCallback` for performance.
- **Receipt Card Component (ReceiptCard.js)**: Displays receipt summary (`client/src/features/receipts/components/ReceiptCard.js`).
- **Receipt List Component (ReceiptList.js)**: Displays list of receipts (`client/src/features/receipts/components/Receiptlist.js`). Uses `PerformanceOptimizedList` and is wrapped in `React.memo`.
- **Receipt List Page Component (ReceiptListPage.js)**: Dedicated page for viewing the receipt list (`client/src/features/receipts/pages/ReceiptListPage.js`). Uses `useReceipts`, `ReceiptList`, and `ReceiptFilters`.
- **Receipt Detail Component (ReceiptDetail.js)**: Displays receipt details (`client/src/features/receipts/components/ReceiptDetail.js`).
- **Receipt Detail Page Component (ReceiptDetailPage.js)**: Page for viewing/editing receipts (`client/src/features/receipts/pages/ReceiptDetailPage.js`).
- **Receipt Edit Component (ReceiptEdit.js)**: Form for editing receipts (`client/src/features/receipts/components/ReceiptEdit.js`).
- **Receipt Filters Component (ReceiptFilters.js)**: Filters for receipt list (`client/src/features/receipts/components/ReceiptFilters.js`).
- **Receipt Validation Utils**: (`client/src/features/receipts/utils/validation.js`) - Contains receipt-specific validation logic (e.g., `validateReceipt`). File validation was moved to shared utils.

### Implementation Details
Client components and hooks interact with the backend via the `receipts.js` service, which uses the centralized `api.js` client. The `/receipts` route in `client/src/routes.js` now renders the `ReceiptListPage`. Performance optimizations include using `PerformanceOptimizedList` and memoization.

## Inventory Tracking

### Overview
Client-side components and hooks for inventory management. Backend API endpoints for inventory operations have been implemented.

### Components & Hooks
- **useInventory Hook**: Manages inventory data state (`client/src/features/inventory/hooks/useInventory.js`). Uses the `inventoryService.js` service.
- **Inventory Item Component (InventoryItem.js)**: Displays single inventory item (`client/src/features/inventory/components/InventoryItem.js`).
- **Stock Manager Component (StockManager.js)**: UI for managing stock (`client/src/features/inventory/components/StockManager.js`).
- **useStockManagement Hook**: Handles stock updates (`client/src/features/inventory/hooks/useStockManagement.js`).
- **Stock Alerts Component (StockAlerts.js)**: Displays low stock alerts (`client/src/features/inventory/components/StockAlerts.js`).
- **Inventory List Component (InventoryList.js)**: Displays list of inventory items (`client/src/features/inventory/components/InventoryList.js`).
- **Inventory Service (inventoryService.js)**: Client-side service for inventory API (`client/src/features/inventory/services/inventoryService.js`). Uses the centralized `api.js` client.

### Implementation Details
Client components and hooks interact with the backend via the `inventoryService.js` service, which uses the centralized `api.js` client. Backend API endpoints (`server/src/routes/inventoryRoutes.js`, `server/src/controllers/inventoryController.js`) have been implemented for CRUD operations on items, stock updates (`PUT /api/inventory/:id/stock`), stock movements (`POST /api/inventory/movements`), and low stock alerts (`GET /api/inventory/low-stock`). Server-side pagination and filtering are implemented for inventory data.

### Considerations
- **Technical Debt:** Potential consolidation needed for backend inventory/stock services. See `technical-debt.md`.

## Analytics and Reporting

### Overview
Features for data visualization and reporting. Backend API endpoints for analytics have been implemented, and performance optimizations applied.

### Components & Hooks
- **Dashboard Page (DashboardPage.js)**: Main analytics dashboard (`client/src/features/analytics/pages/DashboardPage.js`).
- **Spending Chart Component (SpendingChart.js)**: Visualizes spending (`client/src/features/analytics/components/SpendingChart.js`). Wrapped in `React.memo`.
- **Category Breakdown Component (CategoryBreakdown.js)**: Visualizes spending by category (`client/src/features/analytics/components/CategoryBreakdown.js`). Wrapped in `React.memo`.
- **Spending Trends Component (SpendingTrends.js)**: Analyzes trends (`client/src/features/analytics/components/SpendingTrends.js`). Wrapped in `React.memo`.
- **Reports Page (ReportsPage.js)**: Container for reports (`client/src/features/analytics/pages/ReportsPage.js`).
- **useAnalytics Hook**: Manages analytics data (`client/src/features/analytics/hooks/useAnalytics.js`). Uses the `analyticsService.js` service.
- **useReports Hook**: Manages report generation/data (`client/src/features/analytics/hooks/useReports.js`). Uses the `analyticsService.js` service.
- **Analytics Service (analyticsService.js)**: Client-side service for analytics API (`client/src/features/analytics/services/analyticsService.js`). Uses the centralized `api.js` client.

### Implementation Details
Client components and hooks interact with the backend via the `analyticsService.js` service, which uses the centralized `api.js` client. Backend API endpoints (`server/src/routes/analyticsRoutes.js`, `server/src/controllers/analyticsController.js`) have been implemented for analytics data, including budget progress (`GET /api/analytics/budget`). Server-side data aggregation is performed for charts. Performance optimizations include memoization and server-side aggregation.

### Considerations
- **Technical Debt:** Potential consolidation needed for `useAnalytics` and `useReports` hooks. Redundant components (`SpendingSummary`, `PredictiveAnalytics`) moved to `/client/extra`. See `technical-debt.md`.

## Settings and User Preferences

### Overview
Allows users to manage their profile, categories, notifications, and data exports. Client-side services have been refactored to use the centralized API client.

### Components & Hooks
- **Settings Page (SettingsPage.js)**: Main settings container (`client/src/features/settings/pages/SettingsPage.js`).
- **Profile Settings Component (ProfileSettings.js)**: Edits user profile (`client/src/features/settings/components/ProfileSettings.js`).
- **Category Settings Component (CategorySettings.js)**: Manages categories (`client/src/features/settings/components/CategorySettings.js`). Uses `useCategories` hook.
- **Notification Settings Component (NotificationSettings.js)**: Manages notifications (`client/src/features/settings/components/NotificationSettings.js`).
- **Export Settings Component (ExportSettings.js)**: Handles data export (`client/src/features/settings/components/ExportSettings.js`).
- **useSettings Hook**: Manages settings data (`client/src/features/settings/hooks/useSettings.js`). Uses the `settingsService.js` service and client-side caching.
- **Settings Service (settingsService.js)**: Client-side service for settings API (`client/src/features/settings/services/settingsService.js`). Uses the centralized `api.js` client.
- **useCategories Hook**: Manages category data (`client/src/features/categories/hooks/useCategories.js`). Uses client-side caching.

### Implementation Details
Client components and hooks interact with the backend via their respective services (`settingsService.js`, category service), which use the centralized `api.js` client. Client-side caching is implemented for settings and categories. Backend API endpoints for export (`server/src/routes/exportRoutes.js`, `server/src/controllers/exportController.js`, `server/src/services/export/exportService.js`) have been implemented, supporting various formats (CSV, PDF, JSON) and storing exports in Firebase Storage with signed URLs for download.

## Testing and Deployment

### Overview
Strategies for ensuring application quality and deploying to production. Firebase Security Rules testing scripts have been implemented.

### Tasks
- Implement comprehensive unit, integration, and end-to-end tests.
- Conduct performance testing.
- Set up CI/CD pipelines for automated deployment.
- Configure monitoring and logging.

### Security Rules Testing
- **Firebase Security Rules Testing Script (Prompt 6):** Implemented test scripts (`server/tests/security/firestore.test.js`, `server/tests/security/storage.test.js`) using the Firebase Emulator Suite to validate Firestore and Storage security rules. Includes tests for data ownership, validation, and write restrictions. A README (`server/tests/security/README.md`) provides instructions.

### Considerations
- Existing server tests and the new security rules tests provide a starting point.
- A full testing suite is required for comprehensive coverage.
- Performance and monitoring are crucial for production readiness.

## Dependencies and External Services
- React, React DOM, React Router
- Tailwind CSS
- Axios
- Recharts, Chart.js, react-chartjs-2
- Firebase SDK (Auth, Firestore, Storage, Functions)
- Google Cloud Vision API (via server)
- Node.js, Express (for server)
- Jest, @firebase/testing (for testing)
- Multer (for server file uploads)
- json2csv, pdfkit (for server export generation - assumed libraries)

## Security Rules

### Firestore (`firestore.rules`)
Defines access control for Firestore collections. Primarily user-based access (users can only access their own data). Includes comprehensive validation functions for various data models (`isValidReceipt`, `isValidProduct`, etc.). Rules are implemented for all key collections.

### Storage (`storage.rules`)
Defines access control for Firebase Storage buckets. Primarily user-based access with file type and size validation. Rules are implemented for key paths, including user-specific upload directories and server-only paths.

## Cloud Functions (`functions/index.js`)

### Overview
Handles backend tasks triggered by events (e.g., file uploads).

### `processReceipt` Function
Triggered on new file uploads to Storage. Intended to use the backend API (`/api/documents/upload`) for OCR and saving results to Firestore, leveraging the implemented server-side logic and security.
**Note:** Requires proper implementation and error handling within the function itself to call the backend API securely.

## Backend API Endpoints

### Overview
The Node.js/Express backend provides API endpoints for various application features.

### Document API (`/api/documents`)
- `POST /api/documents/upload`: Handles secure document upload via multipart/form-data. Triggers server-side processing (OCR, classification, saving).
- `PUT /api/documents/correct/:id`: Allows users to submit corrections for a processed document.
- `GET /api/documents`: Fetches documents with pagination and filtering.

### Inventory API (`/api/inventory`)
- `GET /api/inventory`: Fetches inventory items with pagination and filtering.
- `GET /api/inventory/:id`: Fetches a single inventory item by ID.
- `POST /api/inventory`: Creates a new inventory item.
- `PUT /api/inventory/:id`: Updates an existing inventory item.
- `DELETE /api/inventory/:id`: Deletes an inventory item.
- `PUT /api/inventory/:id/stock`: Updates the stock level for an inventory item.
- `POST /api/inventory/movements`: Records a stock movement.
- `GET /api/inventory/low-stock`: Fetches low stock alerts.

### Analytics API (`/api/analytics`)
- `GET /api/analytics/spending`: Fetches spending analytics data (includes category breakdown and trends).
- `GET /api/analytics/inventory`: Fetches inventory analytics data (e.g., total value).
- `GET /api/analytics/budget`: Fetches budget progress data.

### Export API (`/api/exports`)
- `POST /api/exports`: Initiates the generation of a data export file (receipts or inventory) based on filters and format (CSV, PDF, JSON). Stores the file in Storage and returns a download link.
- `GET /api/exports/:id`: Downloads a previously generated export file using a signed URL.

### Other APIs (Assumed/Partial Implementation)
- `/api/auth`: Authentication endpoints (login, register, etc.).
- `/api/categories`: Category management endpoints.
- `/api/alerts`: Alert management endpoints.
- `/api/reports`: Report generation endpoints (potentially overlapping with analytics).
- `/api/diagnostics`: System diagnostic endpoints.

## Centralized API Client (`client/src/shared/services/api.js`)

### Overview
A single Axios instance configured for making API calls to the backend.

### Implementation Details
- Configured with a configurable base URL (from environment variables).
- Includes request interceptor to automatically attach the Firebase Auth token (`auth.currentUser.getIdToken()`) to outgoing requests.
- Includes a response interceptor to handle standardized error responses from the backend, extract user-friendly messages, log detailed errors, and automatically attempt token refresh on 401 errors.
- Configured with a default request timeout.
- Includes request/response logging in development.

## Performance Optimizations

### Overview
Implemented strategies to improve application performance, especially with large datasets.

### Key Implementations
- **Server-Side Pagination and Filtering:** Implemented cursor-based pagination and server-side filtering for fetching inventory and document/receipt data from Firestore.
- **Server-Side Data Aggregation:** Moved data aggregation logic for analytics charts to the backend.
- **Client-Side Caching:** Introduced a simple in-memory cache utility (`client/src/shared/utils/cache.js`) and applied it to frequently accessed data (categories, settings).
- **Memoization:** Applied `React.memo` to list and chart components and `useCallback` to functions in key hooks to reduce unnecessary re-renders.
- **PerformanceOptimizedList:** Utilized a component designed for list virtualization (assumed to use `react-window` or similar).

## Standardized Error Handling

### Overview
Defined and implemented consistent patterns for handling and communicating errors across the application layers.

### Key Implementations
- **Server-Side:** Uses a custom `AppError` class for operational errors, `try...catch` in controllers/services, and a centralized error handling middleware in `server/src/app.js` for consistent JSON responses. Detailed logging is implemented.
- **Client-Side:** Uses a centralized `errorHandler.js` utility. API services use `try...catch` and rely on the `api.js` interceptor to extract user-friendly messages. Hooks use `errorHandler` to set error state, show toasts, and log details. Components display loading states and error messages using Alert components.

## Future Improvements (Technical Debt)
Refer to `technical-debt.md` for a detailed list of known issues and areas for future improvement, including:
- Completing backend API implementations (Inventory, Export).
- Implementing comprehensive testing (unit, integration, E2E, security rules).
- Enhancing secrets management for production.
- Formalizing server environment configurations.
- Consolidating client hooks and server services where redundant.
- Adding TypeScript coverage.
- Improving advanced error handling in components.
- Implementing more sophisticated OCR parsing and item extraction.
- Enhancing performance optimizations (advanced search, caching strategies).
