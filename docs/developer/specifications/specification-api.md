---
title: Receipt Scanner Application API Documentation
created: 2025-05-06
last_updated: 2025-05-08
update_history:
  - 2025-05-08: Documented implemented security measures.
  - 2025-05-06: Added standardized metadata header.
  - date: 2025-05-16
    description: Updated YAML front matter, In This Document, and Related Documentation.
status: Complete
owner: Cline EDI Assistant
related_files:
  - docs/developer/architecture/architecture-api-integration-map.md
  - docs/core/data-model.md
---

# Receipt Scanner Application API Documentation

[Home](/docs) > [Developer Documentation](/docs/developer) > [Specifications](/docs/developer/specifications) > Backend API Specification

## In This Document
- [Overview](#overview)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Document API (`/api/documents`)](#document-api-apidocuments)
    - [`POST /api/documents/upload`](#post-apidocumentsupload)
    - [`PUT /api/documents/correct/:id`](#put-apidocumentscorrectid)
    - [`GET /api/documents`](#get-apidocuments)
  - [Inventory API (`/api/inventory`)](#inventory-api-apiinventory)
    - [`GET /api/inventory`](#get-apiinventory)
    - [`GET /api/inventory/:id`](#get-apiinventoryid)
    - [`POST /api/inventory`](#post-apiinventory)
    - [`PUT /api/inventory/:id`](#put-apiinventoryid)
    - [`DELETE /api/inventory/:id`](#delete-apiinventoryid)
    - [`PUT /api/inventory/:id/stock`](#put-apiinventoryidstock)
    - [`POST /api/inventory/movements`](#post-apiinventorymovements)
    - [`GET /api/inventory/low-stock`](#get-apiinventorylow-stock)
  - [Analytics API (`/api/analytics`)](#analytics-api-apianalytics)
    - [`GET /api/analytics/spending`](#get-apianalyticsspending)
    - [`GET /api/analytics/inventory`](#get-apianalyticsinventory)
    - [`GET /api/analytics/budget`](#get-apianalyticsbudget)
  - [Export API (`/api/exports`)](#export-api-apiexports)
    - [`POST /api/exports`](#post-apiexports)
    - [`GET /api/exports/:id`](#get-apiexportsid)
- [Security Measures](#security-measures)
- [Other APIs (Assumed/Partial Implementation)](#other-apis-assumedpartial-implementation)

## Related Documentation
- [API Integration Map](../architecture/architecture-api-integration-map.md)
- [Data Model](../../core/data-model.md)

## Overview

This document provides detailed documentation for the backend API endpoints of the Receipt Scanner Application. The API is built using Node.js and Express, and interacts with Firebase services (Firestore, Storage) and Google Cloud Vision API.

## Authentication

All protected API endpoints require authentication. The API uses Firebase Authentication tokens for this purpose.

-   **Authentication Method:** Bearer Token in the `Authorization` header.
-   **Token Acquisition:** Clients should obtain a Firebase Authentication ID token after user login or registration using the Firebase Client SDK (`firebase.auth().currentUser.getIdToken()`).
-   **Header Format:** `Authorization: Bearer <firebase_id_token>`
-   **Middleware:** The [`server/src/middleware/auth/auth.js`](../../../../server/src/middleware/auth/auth.js) middleware verifies the token and attaches the authenticated user's information (`req.user`) to the request object.

## Error Handling

The API follows a standardized error handling approach.

-   **Operational Errors (e.g., Validation, Not Found):** The API returns a JSON response with a `status` of `"fail"` and a user-friendly `message`. The HTTP status code will be in the 4xx range.
    ```json
    {
      "status": "fail",
      "message": "User-friendly error description."
    }
    ```
-   **Programming/Unexpected Errors:** The API returns a JSON response with a `status` of `"error"` and a generic error `message` (detailed error information is logged server-side). The HTTP status code will be 500.
    ```json
    {
      "status": "error",
      "message": "An unexpected server error occurred."
    }
    ```
-   **Centralized Handler:** Error handling is managed by a centralized middleware in [`server/src/app.js`](../../../../server/src/app.js).

## API Endpoints

### Document API (`/api/documents`)

Handles document upload, processing, and correction.

#### `POST /api/documents/upload`

-   **Description:** Uploads a document (e.g., receipt image) for processing.
-   **Authentication:** Required.
    -   **Request:** `multipart/form-data`
        -   `document`: The file to upload.
        -   `documentType`: Type of document (e.g., 'receipt').
    -   **Response (Success - 201 Created):**
        ```json
        {
          "status": "success",
          "data": {
            "documentId": "string", // ID of the created document in Firestore
            "imageUrl": "string" // Signed URL for accessing the uploaded image
          }
        }
        ```
    -   **Response (Error - 400 Bad Request):**
        ```json
        {
          "status": "fail",
          "message": "No document file provided."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/documentRoutes.js`](../../../../server/src/routes/documentRoutes.js), [`server/src/controllers/documentController.js`](../../../../server/src/controllers/documentController.js), and [`server/src/services/document/documentService.js`](../../../../server/src/services/document/documentService.js). Uses Multer middleware for file handling.

#### `PUT /api/documents/correct/:id`

-   **Description:** Submits corrected data for a previously processed document.
-   **Authentication:** Required.
    -   **Parameters:**
        -   `id`: The ID of the document to correct.
    -   **Request (Body)::** JSON object containing the corrected data.
        ```json
        {
          "correctedData": {
            "merchant": "string",
            "date": "string (ISO 8601)",
            "total": "number",
            "items": [ /* ... array of item objects ... */ ]
            // ... other fields to correct
          }
        }
        ```
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "documentId": "string" // ID of the updated document
          }
        }
        ```
    -   **Response (Error - 404 Not Found):**
        ```json
        {
          "status": "fail",
          "message": "Document not found."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/documentRoutes.js`](../../../../server/src/routes/documentRoutes.js) and [`server/src/controllers/documentController.js`](../../../../server/src/controllers/documentController.js), and [`server/src/services/document/documentService.js`](../../../../server/src/services/document/documentService.js).

#### `GET /api/documents`

-   **Description:** Fetches a list of documents/receipts for the authenticated user with pagination and filtering.
-   **Authentication:** Required.
    -   **Query Parameters:**
        -   `userId`: (Required) The ID of the user (handled by middleware).
        -   `limit`: (Optional) Maximum number of documents to return (default: 20).
        -   `startAfter`: (Optional) Document ID to start fetching after (for cursor-based pagination).
        -   `filterBy`: (Optional) Field to filter by (e.g., 'category', 'merchant').
        -   `filterValue`: (Optional) Value to filter by.
        -   `sortBy`: (Optional) Field to sort by (default: 'createdAt').
        -   `sortOrder`: (Optional) Sort order ('asc' or 'desc', default: 'desc').
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "documents": [
              {
                "id": "string",
                "userId": "string",
                "imageUrl": "string",
                "gcsUri": "string",
                "classification": { /* ... classification data ... */ },
                "createdAt": "timestamp",
                "updatedAt": "timestamp",
                "originalOcrResult": { /* ... original OCR data ... */ }, // Included after correction
                "correctedData": { /* ... corrected data ... */ } // Included after correction
                // ... other document fields
              }
              // ... more documents
            ],
            "nextPageToken": "string | null" // Token for fetching the next page
          }
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/documentRoutes.js`](../../../../server/src/routes/documentRoutes.js), [`server/src/controllers/documentController.js`](../../../../server/src/controllers/documentController.js), and [`server/src/services/document/documentService.js`](../../../../server/src/services/document/documentService.js). Implements server-side pagination and filtering using Firestore queries.

### Inventory API (`/api/inventory`)

Handles inventory item management, stock updates, and movements.

#### `GET /api/inventory`

-   **Description:** Fetches a list of inventory items for the authenticated user with pagination and filtering.
-   **Authentication:** Required.
    -   **Query Parameters:**
        -   `userId`: (Required) The ID of the user (handled by middleware).
        -   `limit`: (Optional) Maximum number of items to return (default: 20).
        -   `startAfter`: (Optional) Item ID to start fetching after (for cursor-based pagination).
        -   `filterBy`: (Optional) Field to filter by (e.g., 'category', 'name').
        -   `filterValue`: (Optional) Value to filter by.
        -   `sortBy`: (Optional) Field to sort by (default: 'createdAt').
        -   `sortOrder`: (Optional) Sort order ('asc' or 'desc', default: 'desc').
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "items": [
              {
                "id": "string",
                "userId": "string",
                "name": "string",
                "unitPrice": "number",
                "currentStock": "number",
                "category": "string", // Category ID or name
                "description": "string", // Optional
                "location": "string", // Optional
                "createdAt": "timestamp",
                "updatedAt": "timestamp"
                // ... other item fields
              }
              // ... more items
            ],
            "nextPageToken": "string | null" // Token for fetching the next page
          }
        }
        ```
    -   **Response (Error - 400 Bad Request):**
        ```json
        {
          "status": "fail",
          "message": "Invalid input data."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/inventoryRoutes.js`](../../../../server/src/routes/inventoryRoutes.js), [`server/src/controllers/inventoryController.js`](../../../../server/src/controllers/inventoryController.js), and [`server/src/models/Product.js`](../../../../server/src/models/Product.js). Implements server-side pagination and filtering.

#### `GET /api/inventory/:id`

-   **Description:** Fetches a single inventory item by its ID.
-   **Authentication:** Required.
    -   **Parameters:**
        -   `id`: The ID of the inventory item.
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "item": {
              "id": "string",
              "userId": "string",
              "name": "string",
              "unitPrice": "number",
              "currentStock": "number",
              "category": "string",
              "description": "string",
              "location": "string",
              "createdAt": "timestamp",
            "updatedAt": "timestamp"
            }
          }
        }
        ```
    -   **Response (Success - 201 Created):**
        ```json
        {
          "status": "success",
          "data": {
            "movement": {
              "id": "string",
              "userId": "string",
              "itemId": "string",
              "quantity": "number",
              "movementType": "string",
              "timestamp": "timestamp",
              "createdAt": "timestamp"
            }
          }
        }
        ```
    -   **Response (Error - 400 Bad Request)::**
        ```json
        {
          "status": "fail",
          "message": "Invalid stock movement data."
        }
        ```
    -   **Response (Success - 201 Created):**
        ```json
        {
          "status": "success",
          "data": {
            "item": {
              "id": "string",
              "userId": "string",
              "name": "string",
              "unitPrice": "number",
              "currentStock": "number",
              "category": "string",
              "description": "string",
              "location": "string",
              "createdAt": "timestamp",
              "updatedAt": "timestamp"
            }
          }
        }
        ```
    -   **Response (Error - 400 Bad Request)::**
        ```json
        {
          "status": "fail",
          "message": "Invalid input data."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/inventoryRoutes.js`](../../../../server/src/routes/inventoryRoutes.js) and [`server/src/controllers/inventoryController.js`](../../../../server/src/controllers/inventoryController.js). Includes data validation.

#### `POST /api/inventory`

-   **Description:** Creates a new inventory item.
-   **Authentication:** Required.
    -   **Request (Body)::** JSON object for the new item.
        ```json
        {
          "name": "string", // Required
          "unitPrice": "number", // Required
          "category": "string", // Optional (Category ID or name)
          "description": "string", // Optional
          "location": "string", // Optional
          "initialStock": "number" // Optional, default 0
        }
        ```
    -   **Response (Success - 201 Created):**
        ```json
        {
          "status": "success",
          "data": {
            "item": {
              "id": "string",
              "userId": "string",
              "name": "string",
              "unitPrice": "number",
              "currentStock": "number",
              "category": "string",
              "description": "string",
              "location": "string",
              "createdAt": "timestamp",
              "updatedAt": "timestamp"
            }
          }
        }
        ```
    -   **Response (Error - 400 Bad Request)::**
        ```json
        {
          "status": "fail",
          "message": "Invalid input data."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/inventoryRoutes.js`](../../../../server/src/routes/inventoryRoutes.js) and [`server/src/controllers/inventoryController.js`](../../../../server/src/controllers/inventoryController.js). Includes data validation.

#### `PUT /api/inventory/:id`

-   **Description:** Updates an existing inventory item.
-   **Authentication:** Required.
    -   **Parameters:**
        -   `id`: The ID of the inventory item to update.
    -   **Request (Body)::** JSON object with updated fields.
        ```json
        {
          "name": "string", // Optional
          "unitPrice": "number", // Optional
          "category": "string", // Optional
          "description": "string", // Optional
          "location": "string" // Optional
        }
        ```
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "item": {
              "id": "string",
              "userId": "string",
              "name": "string",
              "unitPrice": "number",
              "currentStock": "number",
              "category": "string",
              "description": "string",
              "location": "string",
              "createdAt": "timestamp",
              "updatedAt": "timestamp"
            }
          }
        }
        ```
    -   **Response (Error - 404 Not Found)::**
        ```json
        {
          "status": "fail",
          "message": "Inventory item not found."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/inventoryRoutes.js`](../../../../server/src/routes/inventoryRoutes.js) and [`server/src/controllers/inventoryController.js`](../../../../server/src/controllers/inventoryController.js). Includes data validation.

#### `DELETE /api/inventory/:id`

-   **Description:** Deletes an inventory item.
-   **Authentication:** Required.
    -   **Parameters:**
        -   `id`: The ID of the inventory item to delete.
    -   **Response (Success - 204 No Content):** Empty response body.
    -   **Response (Error - 404 Not Found):**
        ```json
        {
          "status": "fail",
          "message": "Inventory item not found."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/inventoryRoutes.js`](../../../../server/src/routes/inventoryRoutes.js) and [`server/src/controllers/inventoryController.js`](../../../../server/src/controllers/inventoryController.js).

#### `PUT /api/inventory/:id/stock`

-   **Description:** Updates the stock level for a specific inventory item.
-   **Authentication:** Required.
    -   **Request (Body)::** JSON object with the stock change.
        ```json
        {
          "change": "number" // Positive for addition, negative for removal
        }
        ```
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "item": {
              "id": "string",
              "userId": "string",
              "name": "string",
              "unitPrice": "number",
              "currentStock": "number", // Updated stock level
              "category": "string",
              "description": "string",
              "location": "string",
              "createdAt": "timestamp",
              "updatedAt": "timestamp"
            }
          }
        }
        ```
    -   **Response (Error - 400 Bad Request)::**
        ```json
        {
          "status": "fail",
          "message": "Invalid stock change value."
        }
        ```
    -   **Response (Error - 404 Not Found)::**
        ```json
        {
          "status": "fail",
          "message": "Inventory item not found."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/inventoryRoutes.js`](../../../../server/src/routes/inventoryRoutes.js) and [`server/src/controllers/inventoryController.js`](../../../../server/src/controllers/inventoryController.js).

#### `POST /api/inventory/movements`

-   **Description:** Records a stock movement (e.g., purchase, sale, adjustment).
-   **Authentication:** Required.
    -   **Request (Body)::** JSON object for the stock movement.
        ```json
        {
          "itemId": "string", // ID of the inventory item
          "quantity": "number", // Positive or negative change
          "movementType": "string", // e.g., 'purchase', 'sale', 'adjustment'
          "timestamp": "timestamp" // Optional, defaults to server time
        }
        ```
    -   **Response (Success - 201 Created):**
        ```json
        {
          "status": "success",
          "data": {
            "movement": {
              "id": "string",
              "userId": "string",
              "itemId": "string",
              "quantity": "number",
              "movementType": "string",
              "timestamp": "timestamp",
              "createdAt": "timestamp"
            }
          }
        }
        ```
    -   **Response (Error - 400 Bad Request)::**
        ```json
        {
          "status": "fail",
          "message": "Invalid stock movement data."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/inventoryRoutes.js`](../../../../server/src/routes/inventoryRoutes.js) and [`server/src/controllers/inventoryController.js`](../../../../server/src/controllers/inventoryController.js).

#### `GET /api/inventory/low-stock`

-   **Description:** Fetches a list of inventory items that are below their defined low stock threshold.
-   **Authentication:** Required.
    -   **Query Parameters:**
        -   `userId`: (Required) The ID of the user (handled by middleware).
        -   `threshold`: (Optional) Custom stock threshold to check against (defaults to item's defined threshold).
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "lowStockItems": [
              {
                "id": "string",
                "userId": "string",
                "name": "string",
                "currentStock": "number",
                "lowStockThreshold": "number" // Item's defined threshold
                // ... other relevant item fields
              }
              // ... more low stock items
            ]
          }
        }
        ```
    -   **Implementation:** Handled by [`server/src/routes/inventoryRoutes.js`](../../../../server/src/routes/inventoryRoutes.js) and [`server/src/controllers/inventoryController.js`](../../../../server/src/controllers/inventoryController.js).

### Analytics API (`/api/analytics`)

Provides aggregated data for analytics and reporting.

#### `GET /api/analytics/spending`

-   **Description:** Fetches spending analytics data, including total spending, spending by category, and spending trends over time.
-   **Authentication:** Required.
    -   **Query Parameters:**
        -   `userId`: (Required) The ID of the user (handled by middleware).
        -   `startDate`: (Optional) Start date for the analysis (ISO 8601).
        -   `endDate`: (Optional) End date for the analysis (ISO 8601).
        -   `interval`: (Optional) Time interval for trends ('day', 'week', 'month', 'year').
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "totalSpending": "number",
            "spendingByCategory": [
              {
                "category": "string", // Category name or ID
                "amount": "number"
              }
              // ... more categories
            ],
            "spendingTrends": [
              {
                "period": "string", // e.g., "2023-01", "2023-W01"
                "amount": "number"
              }
              // ... more periods
            ],
            "inventoryValue": "number" // Total estimated value of current inventory
          }
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/analyticsRoutes.js`](../../../../server/src/routes/analyticsRoutes.js) and [`server/src/controllers/analyticsController.js`](../../../../server/src/controllers/analyticsController.js). Performs server-side data aggregation.

#### `GET /api/analytics/inventory`

-   **Description:** Fetches inventory analytics data, such as total inventory value.
-   **Authentication:** Required.
    -   **Query Parameters:**
        -   `userId`: (Required) The ID of the user (handled by middleware).
        -   (Optional filters for inventory data)
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "totalInventoryValue": "number",
            "itemCount": "number"
            // ... other inventory analytics
          }
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/analyticsRoutes.js`](../../../../server/src/routes/analyticsRoutes.js) and [`server/src/controllers/analyticsController.js`](../../../../server/src/controllers/analyticsController.js).

#### `GET /api/analytics/budget`

-   **Description:** Fetches budget progress data for the authenticated user.
-   **Authentication:** Required.
    -   **Query Parameters:**
        -   `userId`: (Required) The ID of the user (handled by middleware).
        -   `budgetId`: (Optional) ID of a specific budget to track.
        -   `period`: (Optional) Budget period ('month', 'year', etc.).
    -   **Response (Success - 200 OK):**
        ```json
        {
          "status": "success",
          "data": {
            "budgetId": "string",
            "budgetAmount": "number",
            "spentAmount": "number",
            "remainingAmount": "number",
            "progressPercentage": "number" // 0-100
          }
        }
        ```
    -   **Response (Error - 404 Not Found)::**
        ```json
        {
          "status": "fail",
          "message": "Budget data not found for the specified period/ID."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/analyticsRoutes.js`](../../../../server/src/routes/analyticsRoutes.js) and [`server/src/controllers/analyticsController.js`](../../../../server/src/controllers/analyticsController.js).

### Export API (`/api/exports`)

Handles the generation and download of data exports.

#### `POST /api/exports`

-   **Description:** Initiates the generation of a data export file (receipts or inventory) based on provided filters and format. The file is generated asynchronously and stored in Firebase Storage.
-   **Authentication:** Required.
    -   **Request (Body)::** JSON object specifying export options.
        ```json
        {
          "reportType": "string", // 'receipts' or 'inventory'
          "format": "string", // 'csv', 'pdf', or 'json'
          "startDate": "string (ISO 8601)", // Optional filter
          "endDate": "string (ISO 8601)", // Optional filter
          "category": "string" // Optional filter (Category ID or name)
          // ... other relevant filters
        }
        ```
    -   **Response (Success - 202 Accepted):** Indicates that the export generation has started.
        ```json
        {
          "status": "success",
          "data": {
            "exportId": "string", // ID to track the export status and download
            "message": "Export generation initiated."
          }
        }
        ```
    -   **Response (Error - 400 Bad Request)::**
        ```json
        {
          "status": "fail",
          "message": "Invalid export request parameters."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/exportRoutes.js`](../../../../server/src/routes/exportRoutes.js), [`server/src/controllers/exportController.js`](../../../../server/src/controllers/exportController.js), and [`server/src/services/export/exportService.js`](../../../../server/src/services/export/exportService.js). Stores export metadata in Firestore.

#### `GET /api/exports/:id`

-   **Description:** Downloads a previously generated export file.
-   **Authentication:** Required.
    -   **Parameters:**
        -   `id`: The ID of the export record in Firestore.
    -   **Response (Success - 200 OK):** The export file content is returned with appropriate `Content-Type` and `Content-Disposition` headers.
    -   **Response (Error - 404 Not Found)::**
        ```json
        {
          "status": "fail",
          "message": "Export file not found or not ready."
        }
        ```
    -   **Response (Error - 403 Forbidden)::**
        ```json
        {
          "status": "fail",
          "message": "You do not have permission to access this export."
        }
        ```
    -   **Error Responses:**
        [Describe specific error responses for this endpoint, referencing common error handling patterns.]

    -   **Usage Examples:**
        [Provide code examples or curl commands demonstrating how to use this endpoint.]

    -   **Implementation:** Handled by [`server/src/routes/exportRoutes.js`](../../../../server/src/routes/exportRoutes.js) and [`server/src/controllers/exportController.js`](../../../../server/src/controllers/exportController.js). Verifies user ownership and retrieves the file from Firebase Storage using a signed URL.

## Security Measures

The API incorporates several security measures to protect against common web vulnerabilities:

*   **Rate Limiting:** Implemented using `express-rate-limit` to prevent brute-force attacks and abuse by limiting the number of requests from a single IP address within a specified time window.
*   **HTTP Headers:** Configured using `helmet` to set various HTTP headers that enhance security, such as `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, and others.
*   **Input Sanitization:** Utilizes libraries like `express-mongo-sanitize` and `xss-clean` to sanitize incoming request data, preventing NoSQL injection and Cross-Site Scripting (XSS) attacks.

## Other APIs (Assumed/Partial Implementation)

Based on the project structure and other documentation, the following API areas are also expected, although detailed endpoints are not fully documented here:

-   **Auth API (`/api/auth`)**: Endpoints for user login, registration, password reset, etc.
-   **Category API (`/api/categories`)**: Endpoints for managing expense/product categories (CRUD).
-   **Alert API (`/api/alerts`)**: Endpoints for fetching and managing user alerts (e.g., low stock).
-   **Report API (`/api/reports`)**: Potentially overlaps with Analytics API, may include endpoints for specific report types or configurations.
-   **Diagnostic API (`/api/diagnostics`)**: Endpoints for server health checks or debugging information (likely restricted access).
