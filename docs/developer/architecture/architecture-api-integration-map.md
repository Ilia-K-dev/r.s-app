---
title: "API Integration Map"
created: 2025-05-16
last_updated: 2025-05-06
update_history:
  - 2025-05-06: Added standardized metadata header.
  - date: 2025-05-16
    description: Added YAML front matter and navigation headers.
status: Complete
owner: Cline EDI Assistant
related_files:
  - docs/developer/specifications/specification-api.md
  - docs/core/project-structure.md
---

# API Integration Map

[Home](/docs) > [Developer Documentation](/docs/developer) > [Architecture Documentation](/docs/developer/architecture) > API Integration Map

## In This Document
- [Client-Server API Integrations](#client-server-api-integrations)
  - [Base URL Configuration](#base-url-configuration)
  - [API Service Objects and Endpoints](#api-service-objects-and-endpoints)
  - [Authentication](#authentication)
- [Server-Firebase Integrations](#server-firebase-integrations)
- [Server-Google Cloud Vision Integrations](#server-google-cloud-vision-integrations)
- [Server-SendGrid Integrations](#server-sendgrid-integrations)
- [Client-Firebase Integrations (Direct)](#client-firebase-integrations-direct)
- [Functions-Firebase Integrations](#functions-firebase-integrations)
- [Functions-Google Cloud Vision Integrations](#functions-google-cloud-vision-integrations)

## Related Documentation
- [Backend API Specification](../../developer/specifications/specification-api.md)
- [Project Structure](../../core/project-structure.md)

This document maps the API integrations within the Receipt Scanner application, detailing interactions between different components and external services.

## Client-Server API Integrations

The client-side application interacts with the backend server through a centralized API service defined in `client/src/shared/services/api.js`. This service uses Axios and is configured with a base URL from `client/src/core/config/api.config.js`.

### Base URL Configuration

*   The API base URL is configured in `client/src/core/config/api.config.js` as `API_CONFIG.baseURL`, which defaults to `http://localhost:5000` if the `REACT_APP_API_URL` environment variable is not set.
*   A potential code quality issue exists with two separate Axios instances being created and configured in `client/src/shared/services/api.js` and `client/src/core/config/api.config.js`. The instance in `client/src/shared/services/api.js` appears to be the one actively used by the API service objects.

### API Service Objects and Endpoints

The `client/src/shared/services/api.js` file exports several API service objects, each responsible for interactions related to a specific functional area:

*   **`receiptApi`:**
    *   `uploadReceipt`: `POST /receipts`
    *   `getReceipts`: `GET /receipts`
    *   `getReceiptById`: `GET /receipts/:id`
    *   `createReceipt`: `POST /receipts`
    *   `updateReceipt`: `PUT /receipts/:id`
    *   `deleteReceipt`: `DELETE /receipts/:id`
    *   `correctReceipt`: `PUT /receipts/:id/correct`

*   **`categoryApi`:**
    *   `getCategories`: `GET /categories`
    *   `createCategory`: `POST /categories`
    *   `updateCategory`: `PUT /categories/:id`
    *   `deleteCategory`: `DELETE /categories/:id`

*   **`inventoryApi`:**
    *   `getInventory`: `GET /inventory`
    *   `addItem`: `POST /inventory`
    *   `updateItem`: `PUT /inventory/:id`
    *   `deleteItem`: `DELETE /inventory/:id`
    *   `updateStock`: `PUT /inventory/:id/stock`
    *   `getStockMovements`: `GET /inventory/movements`
    *   `getLowStockAlerts`: `GET /inventory/low-stock`

*   **`analyticsApi`:**
    *   `getSpendingAnalytics`: `GET /analytics/spending`
    *   `getInventoryAnalytics`: `GET /analytics/inventory`
    *   `getBudgetProgress`: `GET /analytics/budget`
    *   `getPriceAnalytics`: `GET /analytics/price/:productId`
    *   `getVendorAnalysis`: `GET /analytics/vendors`
    *   `getCategoryAnalysis`: `GET /analytics/categories/:categoryId`
    *   `getDashboardAnalytics`: `GET /analytics/dashboard`
    *   `getPriceComparisonReport`: `GET /analytics/reports/price-comparison`

*   **`exportApi`:**
    *   `generateExport`: `POST /exports`
    *   `downloadExport`: `GET /exports/:exportId`

### Authentication

*   The client uses a request interceptor in `client/src/shared/services/api.js` to automatically attach the Firebase Auth ID token to the `Authorization` header of outgoing requests in the format `Bearer <token>`.
*   A response interceptor handles 401 Unauthorized errors by attempting to refresh the Firebase Auth token and retrying the original request. If token refresh fails, it may trigger a logout.

## Server-Firebase Integrations

The backend server interacts with Firebase Admin SDK for various operations:

*   **Firestore:** Used in `server/src/services/export/exportService.js`, `server/src/scripts/seedCategories.js`, and `server/src/services/inventory/inventoryService.js` for database operations (reading, writing, seeding data).
*   **Storage:** Used in `server/src/services/export/exportService.js` and `server/src/services/document/documentService.js` for file storage operations (uploading, retrieving).
*   **Auth:** Used in `server/src/services/document/documentService.js` and `server/src/services/notification/NotificationService.js` for authentication-related tasks (e.g., verifying user tokens, sending notifications to users).

## Server-Google Cloud Vision Integrations

The backend server interacts with Google Cloud Vision in the following services:

*   **`server/src/services/receipts/ReceiptProcessingService.js`:** Likely uses Vision for OCR to extract text from receipt images for processing.
*   **`server/src/services/document/DocumentProcessingService.js`:** Uses Vision for text detection and potentially other image analysis features as part of the general document processing pipeline.

## Server-SendGrid Integrations

The backend server interacts with SendGrid for sending emails. This is handled in `server/src/services/notification/NotificationService.js`, likely for sending notifications to users (e.g., password reset emails, low stock alerts).

## Client-Firebase Integrations (Direct)

The client-side application interacts directly with the Firebase Client SDK for specific functionalities:

*   **Authentication (`firebase/auth`):** Used in authentication-related hooks and services (`client/src/features/auth/hooks/useAuth.js`, `client/src/features/auth/services/authService.js`, `client/src/core/contexts/AuthContext.js`) for user authentication, managing authentication state, and getting ID tokens.
*   **Firestore (`firebase/firestore`):** Used in some client-side services and hooks (`client/src/features/settings/hooks/useSettings.js`, `client/src/features/categories/services/categories.js`, `client/src/features/analytics/services/reports.js`) for direct data fetching related to user settings, categories, and reports. This suggests some data is accessed directly from the client, bypassing the backend API.
*   **Storage (`firebase/storage`):** Used in `client/src/shared/services/storage.js` for direct client-side file storage operations, likely for uploading or retrieving user files.
*   **Firebase App Initialization (`firebase/app`):** Used in `client/src/core/config/firebase.js` to initialize the Firebase application with the necessary configuration.

## Functions-Firebase Integrations

The Firebase Functions interact with Firebase Admin SDK:

*   **Storage:** Used in `functions/index.js` with the `onObjectFinalized` trigger, indicating that a function is triggered when an object (file) is finalized (uploaded) in Firebase Storage. This function likely processes the uploaded document.
*   **Other Firebase Services:** While not explicitly shown in the search results for `functions/index.js`, Firebase Functions typically have access to other Firebase services (Firestore, Auth, etc.) via the Admin SDK if needed for their logic.

## Functions-Google Cloud Vision Integrations

The Firebase Functions interact with Google Cloud Vision:

*   **`functions/index.js`:** Uses the `@google-cloud/vision` library, likely within the `onObjectFinalized` trigger function, to perform OCR and extract text from documents uploaded to Firebase Storage.
