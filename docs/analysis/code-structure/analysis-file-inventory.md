---
title: "Consolidated File Inventory Report"
created: 2025-05-06
last_updated: 2025-05-06
update_history:
  - 2025-05-06: Consolidated from analysis/file-inventory.md, analysis/file-inventory-part2.md, and analysis/file-inventory-part3.md
status: Complete
owner: Cline (AI Engineer)
related_files: []
---

# Consolidated File Inventory Report

[Home](/docs) > [Analysis Documentation](/docs/analysis) > [Code Structure Analysis](/docs/analysis/code-structure) > Consolidated File Inventory Report

## In This Document
- [Overview](#overview)
- [File Analysis](#file-analysis)
  - [Frontend Files (`client/src/`)](#frontend-files-clientsrc)
  - [Server Files (`server/src/`)](#server-files-serversrc)
    - [Middleware (`server/src/middleware/`)](#middleware-serversrcmiddleware)
    - [Models (`server/src/models/`)](#models-serversrcmodels)
    - [Routes (`server/src/routes/`)](#routes-serversrcroutes)
    - [Scripts (`server/src/scripts/`)](#scripts-serversrcscripts)
    - [Services (`server/src/services/`)](#services-serversrcservices)
    - [Utilities (`server/src/utils/`)](#utilities-serversrcutils)
  - [Cloud Functions (`functions/`)](#cloud-functions-functions)
  - [Root Directory Files](#root-directory-files)
  - [.github/ Directory Files](#github-directory-files)
  - [docs/ Directory Files](#docs-directory-files)

## Related Documentation
<!-- No related files explicitly mentioned in the content -->

## Overview
This report provides a consolidated inventory of key files in the Receipt Scanner application, detailing their purpose, imports, exports, and function counts, based on analysis reports.

## File Analysis

### Frontend Files (`client/src/`)
- **`client/src/App.js`**
    - **Purpose:** Main application component and entry point for the React frontend.
    - **Imports:** `react`, `react-router-dom`, `./core/contexts/AuthContext`, `./core/contexts/ToastContext`, `./routes`, `./core/config/firebase`, `../src/shared/styles/index.css`
    - **Exports:** `default (App)`
    - **Function Count:** 1
- **`client/src/core/config/theme.config.js`**
    - **Purpose:** Defines application theme configuration and component styling.
    - **Imports:** None
    - **Exports:** `colors`, `typography`, `spacing`, `borderRadius`, `shadows`, `transitions`, `zIndex`, `components`
    - **Function Count:** 0
- **`client/src/core/config/firebase.js`**
    - **Purpose:** Initializes and configures client-side Firebase services.
    - **Imports:** `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`
    - **Exports:** `auth`, `db`, `storage`, `app`, `default (firebaseConfig)`
    - **Function Count:** 1
- **`client/src/core/contexts/AuthContext.js`**
    - **Purpose:** React Context and Provider for authentication state management.
    - **Imports:** `react`, `../config/firebase`, `firebase/auth`
    - **Exports:** `AuthContext`, `AuthProvider`, `useAuth`
    - **Function Count:** 2
- **`client/src/routes.js`**
    - **Purpose:** Defines frontend application routes.
    - **Imports:** `react`, `react-router-dom`, `./core/pages/NotFoundPage`, `./features/analytics/pages/DashboardPage`, `./features/receipts/pages/ReceiptListPage`, `./features/analytics/pages/ReceiptDetailPage`, `./features/analytics/pages/ReportsPage`, `./features/settings/pages/SettingsPage`, `./features/auth/components/AuthGuard`, `./features/auth/components/ForgotPasswordPage`, `./features/auth/components/LoginPage`, `./features/auth/components/RegisterPage`, `./shared/components/layout/Layout`, `../pages/DashboardPage`, `../pages/NotFoundPage`, `../pages/ReceiptsPage`, `../pages/ReportsPage`, `../pages/SettingsPage`
    - **Exports:** `router`, `default (router)`
    - **Function Count:** 0
- **`client/src/index.js`**
    - **Purpose:** Frontend entry point and bootstrapping.
    - **Imports:** `react`, `react-dom/client`, `./shared/styles/index.css`, `./App`, `./reportWebVitals`
    - **Exports:** None
    - **Function Count:** 0
- **`client/src/core/config/constants.js`**
    - **Purpose:** Defines application constants and configuration.
    - **Imports:** None
    - **Exports:** `APP_CONFIG`, `AUTH_CONFIG`, `RECEIPT_CONFIG`, `REPORT_CONFIG`, `CATEGORIES`, `DATE_RANGES`, `ERROR_MESSAGES`, `ROUTES`, `UI_CONFIG`
    - **Function Count:** 0
- **`client/src/core/contexts/ToastContext.js`**
    - **Purpose:** React Context and Provider for toast notifications.
    - **Imports:** `react`, `lucide-react`
    - **Exports:** `ToastContext`, `ToastProvider`, `default (ToastProvider)`
    - **Function Count:** 3
- **`client/src/reportWebVitals.js`**
    - **Purpose:** Web Vitals reporting for performance monitoring.
    - **Imports:** None
    - **Exports:** `default (reportWebVitals)`
    - **Function Count:** 1
- **`client/src/core/types/api.ts`**
    - **Purpose:** Defines TypeScript interfaces for API responses and data structures.
    - **Imports:** None
    - **Exports:** `ApiResponse`, `PaginatedResponse`, `DocumentUploadResponse`, `InventoryItem`, `StockMovement`, `AnalyticsData`, `AlertSettings`
    - **Function Count:** 0
- **`client/src/core/types/authTypes.ts`**
    - **Purpose:** Defines TypeScript interfaces for authentication-related data structures.
    - **Imports:** None
    - **Exports:** `User`, `AuthState`, `LoginCredentials`, `RegistrationData`
    - **Function Count:** 0
- **`client/src/features/analytics/components/dashboard/DashboardStats.js`**
    - **Purpose:** React components for displaying dashboard statistics.
    - **Imports:** `lucide-react`, `react`, `../../../../shared/components/ui/Card`, `../../../../shared/utils/currency`
    - **Exports:** `StatCard`, `DashboardStats`, `default (DashboardStats)`
    - **Function Count:** 2
- **`client/src/features/analytics/components/dashboard/AnalyticsDashboard.js`**
    - **Purpose:** React components for displaying analytics charts.
    - **Imports:** `react`, `recharts`, `../../../../shared/components/ui/Card`, `../../../../shared/utils/currency`, `../../../../shared/utils/date`
    - **Exports:** `SpendingTrendChart`, `CategoryBreakdownChart`, `VendorPerformanceChart`, `InventoryValueChart`, `TurnoverRateChart`
    - **Function Count:** 5
- **`client/src/features/analytics/components/reports/BudgetAnalysis.js`**
    - **Purpose:** React component for budget analysis and reporting.
    - **Imports:** `lucide-react`, `react`, `../../../shared/components/ui/Alert`, `../../../shared/components/ui/Card`, `../../../shared/components/ui/Loading`, `../../../shared/components/ui/Progress`, `../../../shared/utils/currency`
    - **Exports:** `default (BudgetAnalysis)`
    - **Function Count:** 3
- **`client/src/features/analytics/pages/CategoryReportPage.js`**
    - **Purpose:** React page component for category-specific analytics reports.
    - **Imports:** `react`, `../../../features/categories/services/categories`, `../../../shared/components/forms/Dropdown`, `../../../shared/components/ui/Card`, `../../../shared/components/charts/ChartComponent`
    - **Exports:** `CategoryReportPage`
    - **Function Count:** 1
- **`client/src/core/pages/NotFoundPage.jsx`**
    - **Purpose:** React page component for 404 Not Found errors with dashboard link.
    - **Imports:** `react`, `react-router-dom`, `../../../shared/components/forms/Input`, `../../../shared/components/forms/Button`, `../../../shared/components/ui/Alert`, `../hooks/useAuth`, `lucide-react`
    - **Exports:** `LoginPage`, `default (LoginPage)`
    - **Function Count:** 3
- **`client/src/core/routes/index.js`**
    - **Purpose:** Defines main application router and routes configuration.
    - **Imports:** `react`, `react-router-dom`, `../../features/auth/components/AuthGuard`, `../../features/auth/components/ForgotPasswordPage`, `../../features/auth/components/LoginPage`, `../../features/auth/components/RegisterPage`, `../../shared/components/layout/Layout`, `../pages/DashboardPage`, `../pages/NotFoundPage`, `../pages/ReceiptsPage`, `../pages/ReportsPage`, `../pages/SettingsPage`
    - **Exports:** `router`, `default (router)`
    - **Function Count:** 0

### Server Files (`server/src/`)

#### Middleware (`server/src/middleware/`)
- **`server/src/middleware/auth/auth.js`**
    - **Purpose:** Middleware for authenticating users by verifying Firebase ID tokens from the request headers.
    - **Imports:** `../../../config/firebase` (admin), `../../utils/error/AppError` (AppError)
    - **Exports:** `authenticateUser`
    - **Function Count:** 1
- **`server/src/middleware/errorHandler.js`**: File not found at expected path. Based on the file structure, a server-side error handling middleware was anticipated here.
- **`server/src/middleware/requestLogger.js`**: File not found at expected path. A request logging middleware was anticipated here.
- **`server/src/middleware/validation/documentValidation.js`**
    - **Purpose:** Middleware for validating uploaded documents, including file type, size, image dimensions, and processing options.
    - **Imports:** `../../utils/error/AppError` (AppError), `../../utils/logger` (logger), `sharp`
    - **Exports:** `default (DocumentValidation)`
    - **Function Count:** 5 (validateFileUpload, validateImageDimensions, validateProcessingOptions, validateBatchProcessing, getValidationMiddleware)
- **`server/src/middleware/validation/validation.js`**
    - **Purpose:** Middleware for validating request data using `express-validator`.
    - **Imports:** `express-validator` (validationResult), `../../utils/error/errorHandler` (AppError), `../../utils/logger` (logger)
    - **Exports:** `validate`
    - **Function Count:** 1 (validate)
- **`server/src/middleware/validation/`**: This directory contains validation middleware for various aspects of the application's API requests.

#### Models (`server/src/models/`)
- **`server/src/models/Category.js`**
    - **Purpose:** Defines a JavaScript class for managing category data in Firestore.
    - **Imports:** `../../config/firebase` (db)
    - **Exports:** `default (Category)`
    - **Function Count:** 3 (constructor, findByUserId, save, toJSON)
- **`server/src/models/InventoryItem.js`**: File not found at expected path. `server/src/models/Product.js` appears to serve as the model for inventory items.
- **`server/src/models/Product.js`**
    - **Purpose:** Defines a JavaScript class for managing product/inventory item data in Firestore.
    - **Imports:** `../../config/firebase` (db), `../utils/error/AppError` (AppError), `../utils/logger` (logger)
    - **Exports:** `default (Product)`
    - **Function Count:** 8 (constructor, findById, findByBarcode, findByUser, save, updateStock, updatePrice, checkStockAlerts, validate, toJSON)
- **`server/src/models/Receipt.js`**
    - **Purpose:** Defines a JavaScript class for managing receipt data in Firestore.
    - **Imports:** `../../config/firebase` (db)
    - **Exports:** `default (Receipt)`
    - **Function Count:** 7 (constructor, findById, find, countDocuments, save, remove, toJSON, validate)
- **`server/src/models/User.js`**
    - **Purpose:** Defines a JavaScript class for managing user data in Firestore.
    - **Imports:** `../../config/firebase` (db)
    - **Exports:** `default (User)`
    - **Function Count:** 8 (constructor, findById, findByEmail, save, update, delete, updateLoginTimestamp, toJSON, validate)

#### Routes (`server/src/routes/`)
- **`server/src/routes/analyticsRoutes.js`**
    - **Purpose:** Defines API routes for analytics and reporting.
    - **Imports:** `express`, `../middleware/auth/auth` (authenticateUser), `../controllers/analyticsController` (analyticsController), `../middleware/validation/validation` (validate)
    - **Exports:** `default (router)`
    - **Function Count:** 1 (router) + 12 route handlers (getPriceAnalytics, getSpendingAnalysis, getVendorAnalysis, getInventoryAnalytics, getCategoryAnalysis, getDashboardAnalytics, getBudgetProgress, getPriceComparisonReport, getVendorPerformanceReport, getInventoryTurnoverReport, getSpendingTrendsReport, exportAnalytics, getCustomAnalytics) = 13
- **`server/src/routes/authRoutes.js`**
    - **Purpose:** Defines API routes for user authentication (register, login, verify token).
    - **Imports:** `express`, `../controllers/authController` (authController), `../middleware/validation/validation` (validate), `../utils/validation/validators` (validateAuth)
    - **Exports:** `default (router)`
    - **Function Count:** 1 (router) + 3 route handlers (register, login, verifyToken) = 4
- **`server/src/routes/categoryRoutes.js`**
    - **Purpose:** Defines API routes for managing categories (create, get all, get by ID, update, delete).
    - **Imports:** `express`, `../middleware/auth/auth` (authenticateUser), `../controllers/categoryController` (categoryController), `../utils/validation/validators` (validators), `../middleware/validation/validation` (validate)
    - **Exports:** `default (router)`
    - **Function Count:** 1 (router) + 5 route handlers (createCategory, getCategories, getCategoryById, updateCategory, deleteCategory) = 6
- **`server/src/routes/documentRoutes.js`**
    - **Purpose:** Defines API routes for document-related operations (upload, get, correct, list).
    - **Imports:** `express`, `../controllers/documentController` (documentController), `../middleware/auth/auth` (authenticate), `../config/multer-config` (upload)
    - **Exports:** `default (router)`
    - **Function Count:** 1 (router) + 4 route handlers (uploadDocument, getDocument, submitCorrection, listDocuments) = 5
- **`server/src/routes/exportRoutes.js`**
    - **Purpose:** Defines API routes for data export functionality (generate, download).
    - **Imports:** `firebase-admin/firestore` (getFirestore), `firebase-admin/storage` (getStorage), `uuid` (v4 as uuidv4), `../../utils/error/AppError` (AppError), `../../utils/logger` (logger), `json2csv` (Parser), `pdfkit` (PDFDocument), `stream` (Readable)
    - **Exports:** `default (router)`
    - **Function Count:** 1 (router) + 2 route handlers (generateExport, downloadExport) = 3
- **`server/src/routes/inventoryRoutes.js`**
    - **Purpose:** Defines API routes for managing inventory items (create, get, update, update stock, get stock movements, get alerts).
    - **Imports:** `express`, `../middleware/auth/auth` (authenticateUser), `../controllers/inventoryController` (inventoryController), `../middleware/validation/validation` (validate)
    - **Exports:** `default (router)`
    - **Function Count:** 1 (router) + 6 route handlers (createProduct, getProducts, updateProduct, updateStock, getStockMovements, getInventoryAlerts) = 7
- **`server/src/routes/userRoutes.js`**: File not found at expected path. API routes for user management were anticipated here.

#### Scripts (`server/src/scripts/`)
- **`server/src/scripts/seedCategories.js`**
    - **Purpose:** Script for seeding default categories for a given user in Firestore.
    - **Imports:** `firebase-admin` (admin), `path`, `../../client/src/features/categories/services/categories` (DEFAULT_CATEGORIES), `../utils/logger` (logError, logInfo)
    - **Exports:** `seedDefaultCategories`, `runTokenGeneration` (Note: `runTokenGeneration` seems incorrectly exported here, likely a copy-paste error)
    - **Function Count:** 2 (seedDefaultCategories, runTokenGeneration)

#### Services (`server/src/services/`)
- **`server/src/services/analytics/analyticsService.js`**
    - **Purpose:** Provides services for analyzing prices, spending, inventory, and vendors, including predictive analytics and caching.
    - **Imports:** `../../../config/firebase` (db), `../../utils/logger` (logger), `../../utils/error/AppError` (AppError), `lodash` (_)
    - **Exports:** `default (AnalyticsService)`
    - **Function Count:** 1 (constructor) + 5 public methods (analyzePrices, analyzeSpending, analyzeInventory, analyzeVendors, predictStockNeeds) + 10 private methods (_getPriceHistory, _calculatePriceStatistics, _calculateVolatility, _getReceipts, _categorizeSpending, _analyzeSpendingTrends, _aggregateByWeek, _aggregateByMonth, _predictSpending, _calculateLinearRegression, _calculatePredictionConfidence, _getFromCache, _setCache, getBudgetProgress) = 16
- **`server/src/services/auth/authService.js`**: File not found at expected path. Business logic for authentication operations was anticipated here.
- **`server/src/services/category/categoryService.js`**: File not found at expected path. Business logic for category management was anticipated here.
- **`server/src/services/document/DocumentProcessingService.js`**
    - **Purpose:** Orchestrates the end-to-end processing of uploaded documents, including image optimization, text extraction, classification, and data parsing.
    - **Imports:** `@google-cloud/vision` (vision), `sharp`, `../../../config/firebase` (storage), `../../utils/logger` (logger), `../../utils/error/AppError` (AppError), `../../services/receipts/ReceiptProcessingService` (parseReceipt), `../receipts/ReceiptProcessingService` (parseInvoice), `papaparse` (Papa), `../preprocessing` (preprocessImage)
    - **Exports:** `default (DocumentProcessingService)`
    - **Function Count:** 1 (constructor) + 2 public methods (processDocument, classifyDocument) + 25 private methods (_optimizeImage, _enhanceImage, _extractText, _processTextBlocks, _analyzeLayout, _classifyDocumentType, _processBasedOnType, _processReceipt, _processInvoice, _getBoundingBox, _analyzeLayout, _extractVendorInfo, _extractDate, _extractReceiptItems, _extractInvoiceItems, _extractTotal, _extractPaymentMethod, _extractMetadata, _analyzeStructure, _assessTextQuality, _detectColumns, _detectOrientation, _identifySections, _isLikelyHeader, _needsProcessing, _needsQualityReduction, _needsEnhancement, _needsContrastEnhancement, _needsGammaCorrection, _isDocument, _isPhoto, _analyzeTextLayout, _detectColumns, _detectAlignment, _findColumnAlignment, _detectTables, _isLikelyTableRow, _detectOrientation, _detectDocumentOrientation, _detectLanguage, _calculateDocumentTypeScore, _calculateDimensions, extractItemCode, _uploadImage) = 27
- **`server/src/services/document/documentService.js`**
    - **Purpose:** Provides services for managing document data in Firestore (create, get, update, delete, list).
    - **Imports:** `../../../config/firebase` (db), `../../utils/error/AppError` (AppError), `../../utils/logger` (logger)
    - **Exports:** `default (DocumentService)`
    - **Function Count:** 1 (constructor) + 5 public methods (createDocument, getDocumentById, updateDocument, deleteDocument, listDocuments) = 6
- **`server/src/services/export/exportService.js`**
    - **Purpose:** Provides services for generating and managing data export files in various formats (CSV, PDF, JSON) and storing them in Firebase Storage.
    - **Imports:** `firebase-admin/firestore` (getFirestore), `firebase-admin/storage` (getStorage), `uuid` (v4 as uuidv4), `../../utils/error/AppError` (AppError), `../../utils/logger` (logger), `json2csv` (Parser), `pdfkit` (PDFDocument), `stream` (Readable)
    - **Exports:** `default (ExportService)`
    - **Function Count:** 1 (constructor) + 2 public methods (generateAndStoreExport, getExportFile) + 5 private methods (_fetchReceiptData, _fetchInventoryData, _formatAsCsv, _formatAsPdf, _formatAsJson) = 8
- **`server/src/services/inventory/inventoryService.js`**
    - **Purpose:** Provides services for managing inventory data in Firestore (create, get, update, delete products, update stock, track movements, check alerts).
    - **Imports:** `../../../config/firebase` (db), `../../utils/error/AppError` (AppError), `../../utils/logger` (logger)
    - **Exports:** `default (InventoryService)`
    - **Function Count:** 1 (constructor) + 6 public methods (createProduct, getProductById, updateProduct, deleteProduct, updateStock, checkStockAlerts) + 1 private method (_trackStockMovement) = 8
- **`server/src/services/user/userService.js`**: File not found at expected path. Business logic for user management was anticipated here.
- **`server/src/services/analytics/analyticsCalculations.js`**: File not found at expected path.
- **`server/src/services/analytics/predictiveAnalytics.js`**: File not found at expected path.
- **`server/src/services/analytics/vendorPerformance.js`**: File not found at expected path.
- **`server/src/services/document/imageProcessing.js`**: File not found at expected path.
- **`server/src/services/document/ocrService.js`**: File not found at expected path.

#### Utilities (`server/src/utils/`)
- **`server/src/utils/error/AppError.js`**
    - **Purpose:** Defines a custom error class for handling application-specific errors with associated HTTP status codes.
    - **Imports:** None
    - **Exports:** `AppError`, `default (AppError)`
    - **Function Count:** 1 (constructor)
- **`server/src/utils/error/errorHandler.js`**
    - **Purpose:** Utility for handling and formatting errors, likely used for centralized error processing.
    - **Imports:** `./AppError` (AppError), `../logger` (logger)
    - **Exports:** `errorHandler`
    - **Function Count:** 1 (errorHandler)
- **`server/src/utils/firebase.js`**: File not found at expected path. Utility functions for interacting with Firebase services were anticipated here.
- **`server/src/utils/helpers.js`**: File not found at expected path. General utility functions were anticipated here.
- **`server/src/utils/logger.js`**
    - **Purpose:** Provides a logging utility using the `winston` library for logging messages with different levels.
    - **Imports:** `winston`
    - **Exports:** `logger`, `logInfo`, `logError`, `logWarn`, `logDebug` (assuming common logger exports)
    - **Function Count:** 1 (assuming logger initialization function) + 4 logging functions = 5
- **`server/src/utils/validation/validators.js`**: Contains validation schemas and middleware using `express-validator` for various API endpoints, including receipt creation/update/list and category creation. Also includes a `validateUpload` middleware for file uploads.

### Cloud Functions (`functions/`)

- **`functions/index.js`**
    - **Purpose:** Contains Firebase Cloud Functions for processing uploaded receipts (OCR) and generating reports.
    - **Imports:** `firebase-admin/storage` (StorageObjectData, getStorage), `firebase-functions/v2/storage` (onObjectFinalized, CloudEvent), `firebase-functions/v2/https` (onCall), `@google-cloud/vision` (vision), `firebase-admin` (admin), `firebase-functions/logger` (logger)
    - **Exports:** `processReceipt`, `generateReport`
    - **Function Count:** 2 (processReceipt, generateReport)

### Root Directory Files

- **`.firebaserc`**: Configuration file for Firebase projects, specifying the default project ID.
- **`Backend Documentation.txt`**: Provides a comprehensive overview of the backend architecture, including project structure, configuration, core services, data models, controllers, middleware, utilities, API routes, authentication and document processing flows, error handling, required environment variables, testing information, and key dependencies.
- **`CONTRIBUTING.md`**: Provides guidelines for contributing to the project, including how to fork and clone the repository, set up the development environment, create branches, make and test changes, commit messages, create pull requests, code style guidelines, the pull request process, security considerations, and licensing information.
- **`firebase.json`**: Configuration file for Firebase services, including emulators, functions, hosting, storage, and Firestore. It defines predeploy scripts, hosting settings (public directory, ignores, rewrites), and the rules and indexes files for storage and Firestore.
- **`firestore-debug.log`**: A log file likely containing debugging information for Firestore operations.
- **`firestore.indexes.json`**: Defines composite indexes for Firestore collections (`receipts`, `inventory`, `stockMovements`, `alerts`) to optimize query performance.
- **`firestore.rules`**: Defines security rules for Firestore, controlling read and write access to data based on user authentication and ownership.
- **`Frontend Development Requirements.txt`**: Outlines the core technologies, required dependencies, Firebase configuration, core components, page components, API integration requirements, state management requirements, UI/UX requirements, file upload requirements, security requirements, performance considerations, and testing requirements for the frontend of the application.
- **`generateToken.js`**: Script for generating custom authentication tokens (likely for testing or specific backend flows).
- **`generate_tree.js`**: Temporary script used to generate the directory tree for this documentation.
- **`LICENSE`**: Project license file.
- **`postcss.config.js`**: Configuration for PostCSS, including plugins for Tailwind CSS and Autoprefixer.
- **`README.md`**: Project README file, providing a general overview.
- **`storage.rules`**: Defines security rules for Firebase Storage, controlling read and write access to files based on user authentication and ownership for paths like `/profiles/{userId}/{fileName}`, `/documents/{userId}/{fileName}`, `/receipts/{userId}/{fileName}`, `/inventory/{userId}/{productId}/images/{imageId}`, and `/exports/{userId}/{fileName}`. Includes helper functions for authentication and ownership checks and file validation rules.

### .github/ Directory Files

- **`.github/workflows/ci.yml`**
    - **Purpose:** Defines a GitHub Actions workflow for Continuous Integration, automating build and test processes on code pushes and pull requests.
    - **Imports:** None (YAML file)
    - **Exports:** None (YAML file)
    - **Function Count:** 0 (YAML file)
- **`.github/pull_request_template.md`**
    - **Purpose:** Provides a template for creating pull requests to ensure consistent and comprehensive information is included for review.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)
- **`.github/CODEOWNERS`**
    - **Purpose:** Specifies individuals or teams responsible for code review in different parts of the repository.
    - **Imports:** None (CODEOWNERS file)
    - **Exports:** None (CODEOWNERS file)
    - **Function Count:** 0 (CODEOWNERS file)
- **`.github/ISSUE_TEMPLATE/firestore_security_rules.md`**
    - **Purpose:** Issue template for defining and implementing comprehensive Firestore security rules.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)
- **`.github/ISSUE_TEMPLATE/refactor_client_hooks.md`**
    - **Purpose:** Issue template for refactoring and improving client-side hooks.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)
- **`.github/ISSUE_TEMPLATE/consolidate_server_services.md`**
    - **Purpose:** Issue template for consolidating and improving server-side services.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)
- **`.github/ISSUE_TEMPLATE/improve_ocr_parsing.md`**
    - **Purpose:** Issue template for improving the OCR parsing logic.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)
- **`.github/ISSUE_TEMPLATE/bug_report.md`**
    - **Purpose:** Issue template for reporting bugs, guiding users to provide necessary information for reproduction and fixing.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)
- **`.github/ISSUE_TEMPLATE/feature_request.md`**
    - **Purpose:** Issue template for requesting new features, guiding users to describe the feature and its benefits.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)

### docs/ Directory Files

- **`docs/architecture.md`**
    - **Purpose:** Documentation file describing the overall architecture of the Receipt Scanner application.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)
- **`docs/api.md`**
    - **Purpose:** Documentation file detailing the application's API endpoints, request/response formats, and usage.
    - **Imports:** None (Markdown file)
    - **Exports:** None (Markdown file)
    - **Function Count:** 0 (Markdown file)
- **`docs/user-documentation.md`**: Documentation file likely providing guidance for end-users of the application.
</final_file_content>

IMPORTANT: For any future changes to this file, use the final_file_content shown above as your reference. This content reflects the current state of the file, including any auto-formatting (e.g., if you used single quotes but the formatter converted them to double quotes). Always base your SEARCH/REPLACE operations on this final version to ensure accuracy.<environment_details>
# VSCode Visible Files
docs/analysis/code-structure/analysis-file-inventory.md

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
docs/project-structure.md
docs/analysis/code-quality/analysis-code-quality-issues.md
docs/analysis/code-quality/analysis-dependency-map.md
docs/analysis/code-quality/analysis-routing-consistency.md
docs/analysis/code-quality/analysis-service-consolidation.md
docs/analysis/code-structure/analysis-file-inventory.md
seed-data.bat
server/test-emulator-connection.js
server/seed-all.js

# Recently Modified Files
These files have been modified since you last accessed them (file was just edited so you may need to re-read it before editing):
docs/analysis/code-structure/analysis-file-inventory.md

# Current Time
5/16/2025, 10:37:15 PM (Asia/Jerusalem, UTC+3:00)

# Context Window Usage
320,771 / 1,048.576K tokens used (31%)

# Current Mode
ACT MODE
</environment_details>
