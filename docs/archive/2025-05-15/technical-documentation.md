# Receipt Scanner Application Technical Documentation
Last Updated: 2025-04-27 11:12 PM

## Overview
This document provides detailed descriptions of each implemented component and feature, key design decisions, implementation approaches, dependencies, code structure explanations, usage examples, important code snippets, and potential future improvements.

## Components and Features
- Authentication System
- Core UI Components
- Document Scanning and OCR
- Receipt Management
- Inventory Tracking
- Analytics and Reporting
- Settings and User Preferences
- Testing and Deployment

## Design Decisions
- Use of React functional components with hooks
- TypeScript for type safety
- Firebase SDK v9+ for backend services
- Modular and reusable component architecture
- Performance optimizations and error handling

## Authentication System

### Overview
Authentication is implemented using Firebase Authentication with email/password and Google OAuth providers.

### Components
- **AuthContext.js**: React Context for global auth state management
  - Provides current user object
  - Handles auth state persistence
  - Exports useAuth hook
  - Includes login, register (with displayName), logout, and resetPassword functions
- **useAuth Hook**: Custom hook for accessing auth context with loading states and toast notifications.
- **LoginPage.js**: Component for user login with form handling and navigation.
- **RegisterPage.js**: Component for user registration with form handling and basic validation.
- **AuthGuard.js**: Component for protecting routes that require authentication, displaying a loading state or redirecting to login.
- **ForgotPasswordPage.js**: Component for initiating password reset via email.

## Core UI Components

### Overview
Reusable UI components for forms, layout, and basic display elements.

### Components
- **Button.js**: Customizable button with variants, sizes, loading state, and icon support.
- **Input.js**: Reusable input field with label, icon, and error display.
- **Card.js**: Simple container for grouping content with basic styling.
- **Layout components (Layout.js, Navbar.js, Sidebar.js)**: Provides the basic page structure and navigation.
- **Toast notification system (ToastContext.js, useToast.js)**: Provides a global system for displaying temporary notifications to the user.
- **Loading.js**: Simple loading spinner component with different size options.
- **Switch Component (Switch.js)**: Reusable toggle switch used in settings.

### Implementation Details
These core UI components are built using React functional components and Tailwind CSS for styling. They are designed to be modular and reusable across the application. The toast notification system uses React Context to manage the state of notifications and a custom hook for easy access. The Loading component provides visual feedback during asynchronous operations. The Switch component is a reusable UI element used within the settings.

### Considerations
- The components provide a consistent look and feel based on the design.
- They are implemented with common states like loading and disabled where applicable.
- The toast notification system enhances user feedback for various actions.
- The Loading component provides clear visual indication of ongoing processes.
- The Switch component provides a standard toggle control.
- No harmful or problematic code was found; these are foundational UI elements.

## Document Scanning and OCR

### Overview
Implementation of document scanning, OCR, and text extraction functionalities.

### Components
- **DocumentScanner.js**: Component for initiating document scanning/upload.

### Implementation Details
The DocumentScanner component provides the user interface for selecting or capturing documents. It likely integrates with underlying utilities for image processing and OCR. The server-side implementation in `DocumentProcessingService.js` and `documentClassifier.js` handles the core OCR and text extraction using Google Cloud Vision API, image preprocessing, document classification, and data extraction. The `Receipt.js` model defines the data structure for storing extracted receipt information.

### Considerations
- The current implementation of DocumentScanner is a basic wrapper. Further integration with camera/file handling and processing logic is needed.
- Based on the project analysis, there is redundancy in client-side OCR services and direct Firestore writes from the client, which should be addressed for security and maintainability.
- The server-side OCR implementation has been refined to leverage bounding box information for improved total and vendor extraction.
- Further improvements to item extraction using bounding boxes are noted as a potential future enhancement.
- Redundancy in Vision API calls across different server services should be addressed.
- Lack of explicit handling for long processing times (e.g., background jobs) for bulk uploads is a potential area for improvement.
- The `Receipt.js` model's current structure appears adequate for storing the extracted data.
- No harmful or problematic code was found in the DocumentScanner component itself, the reviewed server-side files, or the Receipt model.

## Receipt Management

### Overview
Client-side components and services for managing receipts, including upload, display, and editing.

### Components
- **Receipt API Service (receipts.js)**: Client-side service for interacting with the server-side receipt API.
- **Receipt Uploader Component (ReceiptUploader.js)**: Provides a UI for uploading receipt images.
- **Receipt Hooks (useReceipts.js)**: Custom hook for managing receipt data state and interactions.
- **Receipt Card Component (ReceiptCard.js)**: Displays a summary of a receipt in a list.
- **Badge Component (Badge.js)**: Reusable component for displaying status or categories.
- **Receipt List Component (ReceiptList.js)**: Displays a paginated list of Receipt Cards.
- **Receipt Detail Component (ReceiptDetail.js)**: Displays detailed information about a single receipt.
- **Receipt Detail Page Component (ReceiptDetailPage.js)**: Page component for viewing, editing, and deleting receipt details.

### Implementation Details
The receipt management features are implemented using React components and hooks, interacting with the server API via the `receiptApi` service. The `useReceipts` hook centralizes data fetching and manipulation logic. Components like `ReceiptUploader`, `ReceiptList`, and `ReceiptDetail` provide the user interface for these operations.

### Considerations
- The client-side implementation relies on the server API for data persistence and processing.
- The `useReceipts` hook simplifies data management in components.
- The components provide a clear and intuitive user interface for managing receipts.
- No harmful or problematic code was found in these components or services.

## Inventory Tracking

### Overview
Client-side components and hooks for managing inventory items and tracking stock levels.

### Components
- **Inventory Hooks (useInventory.js)**: Custom hook for managing inventory data state and interactions.
- **Inventory Item Component (InventoryItem.js)**: Displays a single inventory item with quantity controls.
- **Stock Manager Component (StockManager.js)**: Provides a form for adding new inventory items.
- **Stock Management Hooks (useStockManagement.js)**: Custom hook for updating stock quantities.
- **Stock Alerts Component (StockAlerts.js)**: Displays alerts for low stock inventory items.

### Implementation Details
The inventory tracking features are implemented using React components and hooks, interacting with the `inventoryService`. The `useInventory` hook manages the overall inventory list, while `useStockManagement` handles stock updates for individual items. `InventoryItem` and `StockManager` provide the user interface. The server-side `StockMovement.js` model and `stockTrackingService.js` handle the recording and retrieval of stock movement history. The `StockAlerts` component displays relevant alerts.

### Considerations
- The client-side implementation interacts with the `inventoryService` for data persistence.
- The hooks centralize inventory data management and stock update logic.
- The components provide a user interface for viewing and managing inventory items and alerts.
- The server-side implementation for stock movement tracking appears functional based on the provided code.
- The potential overlap between `InventoryManagementService` and `stockTrackingService` is noted as an area for future review and potential consolidation.
- The need for client-side components to display stock movement history is noted as a potential future task.
- No harmful or problematic code was found in these components, hooks, or the reviewed server-side files.

## Analytics and Reporting

### Overview
Implementation of analytics and reporting features, including spending analysis and data visualization.

### Components
- **Dashboard Page (DashboardPage.js)**: Main dashboard page displaying summary information and recent activity.
- **Spending Chart Component (SpendingChart.js)**: Component for visualizing spending data over time.
- **Category Breakdown Component (CategoryBreakdown.js)**: Component for visualizing spending by category.
- **Spending Trends Component (SpendingTrends.js)**: Component for analyzing spending trends.
- **Reports Page (ReportsPage.js)**: Page for viewing various reports and analytics.

### Implementation Details
The analytics and reporting features are implemented using React components and hooks, interacting with receipt data. The DashboardPage provides an overview, while other components visualize specific aspects of spending.

### Considerations
- The client-side implementation performs data aggregation and visualization based on available receipt data.
- The components provide visual insights into user spending patterns.
- No harmful or problematic code was found in these components.

## Settings and User Preferences

### Overview
Implementation of settings and user preference management.

### Components
- **Settings Page (SettingsPage.js)**: Main page for managing user settings.
- **Profile Settings Component (ProfileSettings.js)**: Component for editing user profile information.
- **Category Settings Component (CategorySettings.js)**: Component for managing receipt categories.
- **Notification Settings Component (NotificationSettings.js)**: Component for managing notification preferences.
- **Export Settings Component (ExportSettings.js)**: Component for exporting receipt data.
- **Switch Component (Switch.js)**: Reusable toggle switch used in settings.

### Implementation Details
The settings and user preference features are implemented using React components and hooks. Components like ProfileSettings, CategorySettings, NotificationSettings, and ExportSettings provide the user interface for configuring various application settings. The Switch component is a reusable UI element used within the settings.

### Considerations
- The client-side implementation interacts with relevant services for data persistence.
- The components provide a user interface for managing user-specific settings.
- The Switch component provides a standard toggle control.
- No harmful or problematic code was found in these components.

## Phase 7: Testing and Deployment

### Overview
Implementation of testing and deployment strategies for the application.

### Tasks
- **Unit and Integration Testing**: Implementing unit and integration tests for client, server, and functions.
- **Performance Testing**: Conducting performance tests to identify bottlenecks and ensure optimal performance.
- **Deployment and Monitoring**: Setting up deployment pipelines and monitoring for the application.

### Implementation Details
- **Unit and Integration Testing**:
    - Reviewed existing server-side tests in `server/tests/`.
    - Outlined a plan for implementing unit and integration tests for client, server, and functions.
    - Noted the need for setting up testing frameworks and writing tests.
- **Performance Testing**:
    - Reviewed existing performance monitoring middleware (`networkPerformance.js`, `performanceMonitoring.js`).
    - Outlined a plan for conducting performance testing, including identifying KPIs, choosing tools, and defining scenarios.
    - Noted the need for implementing performance tests and analyzing results.
- **Deployment and Monitoring**:
    - Outlined a plan for setting up deployment pipelines (e.g., using Firebase CLI, GitHub Actions).
    - Outlined a plan for setting up monitoring and logging (e.g., using Firebase Performance Monitoring, Cloud Logging).
    - Noted the need for implementing deployment and monitoring configurations.

### Considerations
- The project includes existing server-side tests, indicating a foundation for testing.
- A comprehensive testing strategy is needed to cover all parts of the application.
- Performance testing is crucial for ensuring the application scales effectively.
- Deployment and monitoring are essential for releasing and maintaining the application in production.

## Implementation Details
(To be updated as tasks are implemented)

### Overview
Implementation of testing and deployment strategies for the application.

### Tasks
- **Unit and Integration Testing**: Implementing unit and integration tests for client, server, and functions.
- **Performance Testing**: Conducting performance tests to identify bottlenecks and ensure optimal performance.
- **Deployment and Monitoring**: Setting up deployment pipelines and monitoring for the application.

### Implementation Details
(To be updated as tasks is implemented)

### Considerations
- The project includes existing server-side tests, indicating a foundation for testing.
- A comprehensive testing strategy is needed to cover all parts of the application.
- Performance testing is crucial for ensuring the application scales effectively.
- Deployment and monitoring are essential for releasing and maintaining the application in production.

## Implementation Details
(To be updated as tasks is implemented)

### Overview
Implementation of testing and deployment strategies for the application.

### Tasks
- **Unit and Integration Testing**: Implementing unit and integration tests for client, server, and functions.
- **Performance Testing**: Conducting performance tests to identify bottlenecks and ensure optimal performance.
- **Deployment and Monitoring**: Setting up deployment pipelines and monitoring for the application.

### Implementation Details
(To be updated as tasks is implemented)

### Considerations
- The project includes existing server-side tests, indicating a foundation for testing.
- A comprehensive testing strategy is needed to cover all parts of the application.
- Performance testing is crucial for ensuring the application scales effectively.
- Deployment and monitoring are essential for releasing and maintaining the application in production.

## Implementation Details
(To be updated as tasks is implemented)

## Dependencies and External Services
- Firebase Authentication, Firestore, Storage
- Third-party OCR libraries (if any)
- Analytics services

## Usage Examples
(To be added)

## Important Code Snippets
(To be added)

## Potential Future Improvements
(To be added)

## Storage Security Rules

### Overview
Storage security rules are used to control access to files stored in Firebase Storage. They are written in a declarative language that allows you to specify who has access to what files.

### Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow the user to only access their own files
    match /receipts/{userId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }

    match /users/{userId}/profile_image {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }

    match /inventory/{userId}/{productId}/images/{imageId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 3 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }

    match /documents/{userId}/{documentId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### Considerations
- The security rules are based on user-based access control, where each user can only access their own files.
- The security rules include validation for file uploads (size and MIME type).
- The security rules should be tested thoroughly using the Firebase emulator.

## Functions Implementation

### Overview
Cloud Functions are used to handle backend logic, such as processing uploaded receipt images.

### processReceipt Function
This function is triggered when a new object is finalized in Firebase Storage. It uses the Google Cloud Vision API to extract text from the receipt image and stores the extracted text in Firestore.

### Error Handling
During the initial setup, the following error was encountered:

```
TypeError: onFinalize is not a function
```

This error was caused by using outdated syntax for defining a Cloud Storage trigger in Firebase Functions v2. The code was updated to use the correct syntax:

```javascript
const { StorageObjectData, getStorage } = require('firebase-admin/storage');
const { onObjectFinalized, CloudEvent } = require('firebase-functions/v2/storage');

exports.processReceipt = onObjectFinalized(
  { memory: '2GiB', timeoutSeconds: 120 },
  async (event) => {
    // ... your code ...
  }
);
```

### Considerations
- The Cloud Functions should be thoroughly tested to ensure they are working correctly.
- The Cloud Functions should be deployed to Firebase.

## Testing Storage Security Rules

### Overview
Storage security rules can be tested using Jest and the `@firebase/testing` library.

### Steps
1.  Install Jest and `@firebase/testing` as dev dependencies:

```
npm install --save-dev jest @firebase/testing
```

2.  Create a test file for Storage security rules (e.g., `tests/storage/storage.rules.test.js`).

3.  Add a test script to `server/package.json`:

```json
"scripts": {
  "test:storage": "jest tests/storage/storage.rules.test.js"
}
```

4.  Run the tests using the command:

```
npm run test:storage
```

### Results
The tests are passing.

### Considerations
- The security rules are based on user-based access control, where each user can only access their own files.
- The security rules include validation for file uploads (size and MIME type).
- The security rules should be tested thoroughly using the Firebase emulator.

### Overview
Cloud Functions are used to handle backend logic, such as processing uploaded receipt images.

### processReceipt Function
This function is triggered when a new object is finalized in Firebase Storage. It uses the Google Cloud Vision API to extract text from the receipt image and stores the extracted text in Firestore.

### Error Handling
During the initial setup, the following error was encountered:

```
TypeError: onFinalize is not a function
```

This error was caused by using outdated syntax for defining a Cloud Storage trigger in Firebase Functions v2. The code was updated to use the correct syntax:

```javascript
const { StorageObjectData, getStorage } = require('firebase-admin/storage');
const { onObjectFinalized, CloudEvent } = require('firebase-functions/v2/storage');

exports.processReceipt = onObjectFinalized(
  { memory: '2GiB', timeoutSeconds: 120 },
  async (event) => {
    // ... your code ...
  }
);
```

### Considerations
- The Cloud Functions should be thoroughly tested to ensure they are working correctly.
- The Cloud Functions should be deployed to Firebase.

## Testing Storage Security Rules

### Overview
Storage security rules can be tested manually using the Firebase Emulator UI.

### Steps
1.  Start the Firebase emulator using the `firebase emulators:start` command.
2.  Open the Emulator UI in your browser (usually at `http://127.0.0.1:4000`).
3.  Go to the Storage tab.
4.  Use the UI to simulate different user roles and attempt to upload, download, and delete files in the Storage buckets.
5.  Verify that the security rules are enforced as expected. For example, try to upload a file to a path that the current user should not have access to, and verify that the operation is denied.

## Firestore Security Rules

### Overview
Firestore security rules are used to control access to data in the Firestore database. They are written in a declarative language that allows you to specify who has access to what data.

### Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(resource) {
      return isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    function isValidProduct(data) {
      return data.name is string && data.name.size() > 0
          && data.unitPrice is number && data.unitPrice >= 0
          && data.userId is string;
    }

    // Users Collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Receipts Collection
    match /receipts/{receiptId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }

    // Categories Collection
    match /categories/{categoryId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }

    // Products Collection
    match /products/{productId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() &&
                     request.resource.data.userId == request.auth.uid &&
                     isValidProduct(request.resource.data);
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }

    // Inventory Collection
    match /inventory/{inventoryId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }

    // StockMovements Collection
    match /stockMovements/{stockMovementId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if false; // Stock movements should be immutable
      allow delete: if isOwner(resource);
    }

    // Alerts Collection
    match /alerts/{alertId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }

    // Vendors Collection
    match /vendors/{vendorId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }

    // Documents Collection
    match /documents/{documentId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }

    // Notifications Collection
     match /notifications/{notificationId} {
      allow read: if isOwner(resource);
      allow create: if false; // Only server should create
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }
    
    // NotificationPreferences Collection
    match /notificationPreferences/{notificationPreferencesId} {
      allow read: if isOwner(resource);
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if isOwner(resource);
      allow delete: if isOwner(resource);
    }

    // Test Collection (for diagnostics)
    match /_test/{docId} {
      allow read, write: if request.auth != null;
    }
  }
}

    function isValidProduct(data) {
      return data.name is string && data.name.size() > 0
          && data.unitPrice is number && data.unitPrice >= 0
          && data.userId is string && data.userId.size() > 0;
    }

    function isValidReceipt(data) {
      return data.userId is string && data.userId.size() > 0;
    }

    function isValidInventory(data) {
      return data.userId is string && data.userId.size() > 0;
    }

    function isValidStockMovement(data) {
      return data.userId is string && data.userId.size() > 0;
    }

    function isValidAlert(data) {
      return data.userId is string && data.userId.size() > 0;
    }

    function isValidVendor(data) {
      return data.userId is string && data.userId.size() > 0;
    }

    function isValidDocument(data) {
      return data.userId is string && data.userId.size() > 0;
    }

    function isValidNotification(data) {
      return data.userId is string && data.userId.size() > 0;
    }

    function isValidNotificationPreferences(data) {
      return data.userId is string && data.userId.size() > 0;
    }
```

### Considerations
- The security rules are based on user-based access control, where each user can only access their own data.
- The `isValidProduct` function is used to validate the data in the `products` collection.
- The security rules should be tested thoroughly using the Firebase emulator.

</file_content>

Now that you have the latest state of the file, try the operation again with fewer, more precise SEARCH blocks. For large files especially, it may be prudent to try to limit yourself to <5 SEARCH/REPLACE blocks at a time, then wait for the user to respond with the result of the operation before following up with another replace_in_file call to make additional edits.
(If you run into this error 3 times in a row, you may use the write_to_file tool as a fallback.)
</error><environment_details>
# VSCode Visible Files
technical-documentation.md

# VSCode Open Tabs
server/src/routes/authRoutes.js
server/src/middleware/auth/auth.js
Backend Documentation.txt
Frontend Development Requirements.txt
client/src/features/receipts/utils/extra-formatters.js
client/src/shared/utils/formatters.js
client/src/shared/utils/validation.js
client/src/shared/services/api.js
client/src/shared/services/storage.js
client/src/core/config/constants.js
client/src/core/types/common.ts
client/src/core/types/api.ts
client/src/features/analytics/components/dashboard/AnalyticsDashboard.js
client/src/features/inventory/components/InventoryList.js
server/tests/__mocks__/firebase/storage.js
client/src/features/documents/components/ReceiptPreview.js
client/src/features/receipts/components/ReceiptForm.js
client/src/features/documents/components/2ReceiptUploader.js
client/src/features/documents/components/FileUploader.js
client/src/shared/components/ui/PerformanceOptimizedList.js
client/src/shared/components/ui/SearchBar.js
client/src/shared/components/ui/Table.js
client/src/features/analytics/components/dashboard/DashboardStats.js
client/src/features/analytics/pages/CategoryReportPage.js
client/src/core/pages/DashboardPage.js
client/src/features/analytics/components/reports/BudgetAnalysis.js
server/VScodeCommands.TXT
client/package.json
server/config/firebase.js
server/.env
project-map.md
client/src/hooks/useCategories.js
client/src/features/receipts/components/ReceiptFilters.js
client/src/features/analytics/components/dashboard/SpendingSummary.js
client/src/features/auth/types/authTypes.ts
client/src/features/inventory/services/inventoryService.js
client/src/features/stockService.js
client/src/features/inventory/utils/stockCalculations.js
client/src/features/analytics/components/PredictiveAnalytics.js
client/src/features/analytics/hooks/useReports.js
client/src/features/analytics/hooks/useAnalytics.js
client/src/features/analytics/services/analyticsService.js
client/src/features/analytics/utils/analyticsCalculations.js
client/src/features/settings/hooks/useSettings.js
client/src/features/settings/services/settingsService.js
client/src/features/settings/utils/settingsHelpers.js
client/src/shared/components/charts/ChartWrapper.js
client/src/shared/hooks/useLocalStorage.js
client/src/shared/components/charts/DonutChart.js
client/src/features/analytics/components/BudgetProgress.js
client/src/features/documents/hooks/useDocumentScanner.js
client/src/features/documents/hooks/useOCR.js
project-analysis.md
code-analysis/1-project-structure.md
code-analysis/2-Core Configuration.md
.github/pull_request_template.md
docs/architecture.md
.github/ISSUE_TEMPLATE/firestore_security_rules.md
.github/ISSUE_TEMPLATE/refactor_client_hooks.md
.github/ISSUE_TEMPLATE/consolidate_server_services.md
code-analysis/3-Authentication System.md
code-analysis/4-Server API.md
code-analysis/5-Data Models and Services.md
code-analysis/6-OCR and Document Scanning.md
code-analysis/7-Receipt Management.md
code-analysis/8-Inventory Tracking.md
code-analysis/9-Analytics and Reporting.md
code-analysis/10-UI Components and Styling.md
code-analysis/11-Firebase Integration.md
code-analysis/12-Comprehensive Analysis Summary.md
.github/ISSUE_TEMPLATE/bug_report.md
.github/ISSUE_TEMPLATE/feature_request.md
docs/api.md
tech-implementation-analysis.md
client/src/core/contexts/AuthContext.js
client/src/features/auth/hooks/useAuth.js
client/src/features/auth/components/LoginPage.js
client/src/features/auth/components/RegisterPage.js
client/src/features/auth/components/AuthGuard.js
client/src/features/auth/components/ForgotPasswordPage.js
firebase.json
firestore.rules
storage.rules
functions/index.js
technical-documentation.md
workplan-checklist.md
client/src/features/documents/utils/imageProcessing.js
client/src/features/documents/services/documentProcessingService.js
client/src/features/receipts/utils/validation.js
client/src/features/receipts/components/ReceiptEdit.js
client/src/features/documents/services/visionService.js
client/src/features/documents/components/extra.ScannerInterface.js
client/src/features/documents/components/DocumentPreview.js

# Actively Running Terminals
## Original command: `firebase emulators:start`

# Current Time
4/28/2025, 4:08:56 AM (Asia/Jerusalem, UTC+3:00)

# Context Window Usage
616,168 / 1,000K tokens used (62%)

# Current Mode
ACT MODE
</environment_details>
