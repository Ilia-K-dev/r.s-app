# Code Changes Report: Refactoring Direct Firebase Access

**Date:** 2025-04-29
**Author:** Cline (AI Engineer)
**Objective:** Address critical security issue by removing direct Firebase (Firestore/Storage) access from client-side hooks and services, migrating logic to backend API calls.

## Summary Table

| File Path                                                        | Direct Firebase Access Found? | Action Taken                                                                                                                               | Status      |
| :--------------------------------------------------------------- | :-------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------- | :---------- |
| `client/.../receipts/hooks/useReceipts.js`                       | No                          | Verified hook uses `receiptApi` service. No changes needed.                                                                                | Verified    |
| `client/.../inventory/hooks/useInventory.js`                     | No                          | Verified hook uses `inventoryService`. No changes needed.                                                                                  | Verified    |
| `client/.../analytics/hooks/useAnalytics.js`                     | No                          | Verified hook uses `analyticsService`. No changes needed.                                                                                  | Verified    |
| `client/.../documents/hooks/useDocumentScanner.js`               | No (in hook)                | Verified hook uses `documentProcessingService`. No changes needed *in the hook*.                                                           | Verified    |
| **`client/.../documents/services/documentProcessingService.js`** | **Yes (Storage SDK)**       | **Refactored `uploadDocument` function to call backend API (`/api/documents/upload`). Removed direct `firebase/storage` SDK usage.** | **Refactored** |

## Detailed Changes

### 1. `client/src/features/documents/services/documentProcessingService.js`

*   **Issue:** Direct use of Firebase Client Storage SDK for uploads.
    ```javascript
    // BEFORE: Direct SDK Usage
    import { storage } from '../../../core/config/firebase'; 
    // ...
    const uploadDocument = async (file, userId, documentType) => {
      const storageRef = storage.ref(`receipts/${userId}/${Date.now()}_${file.name}`); // Client SDK ref
      await storageRef.put(file); // Client SDK put
      const imageUrl = await storageRef.getDownloadURL(); // Client SDK getDownloadURL
      return { imageUrl };
    };
    ```
*   **Backend API Endpoint Created:**
    *   Route: `POST /api/documents/upload` (in `server/src/routes/documentRoutes.js`) - Handles multipart/form-data, uses auth middleware.
    *   Controller: `documentController.uploadDocument` (in `server/src/controllers/documentController.js`) - Extracts file and user info, calls service.
    *   Service: `documentService.handleUpload` (in `server/src/services/document/documentService.js`) - Uses Firebase **Admin SDK** `getStorage().bucket().file().createWriteStream()` for secure upload, generates a signed URL for access.
*   **Refactoring:**
    ```javascript
    // AFTER: Using Backend API
    import { api } from '../../../shared/services/api'; // Use shared API helper
    // Removed import { storage } ...

    const uploadDocument = async (file, userId, documentType) => {
      const formData = new FormData();
      formData.append('document', file); 
      formData.append('documentType', documentType);

      try {
        const response = await api.post('/documents/upload', formData, { // API call
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (response.data && response.data.imageUrl) {
          return { imageUrl: response.data.imageUrl }; // Return URL from backend
        } else {
          throw new Error('Backend did not return the image URL after upload.');
        }
      } catch (error) {
        console.error('Error uploading document via API:', error);
        throw new Error(error.response?.data?.message || 'Failed to upload document.');
      }
    };
    ```
*   **Rationale:** Migrating file uploads to the backend enforces security rules server-side, prevents exposure of storage structure, allows for server-side processing/validation, and centralizes logic. Using signed URLs (generated server-side) instead of public URLs enhances security.

### 2. `client/src/features/receipts/hooks/useReceipts.js`

*   **Issue:** Identified in `technical-debt.md` as potentially having direct Firestore access.
*   **Analysis:** Code review confirmed the hook exclusively uses `receiptApi` imported from `../services/receipts.js` for all CRUD operations.
*   **Action:** No changes required. Verified correct implementation.

### 3. `client/src/features/inventory/hooks/useInventory.js`

*   **Issue:** Identified in `technical-debt.md` as potentially having direct Firestore access.
*   **Analysis:** Code review confirmed the hook exclusively uses `inventoryService` imported from `../services/inventoryService.js` for all CRUD operations.
*   **Action:** No changes required. Verified correct implementation.

### 4. `client/src/features/analytics/hooks/useAnalytics.js`

*   **Issue:** Identified in `technical-debt.md` as potentially having direct Firestore access.
*   **Analysis:** Code review confirmed the hook exclusively uses `getSpendingAnalytics` and `getInventoryAnalytics` imported from `../services/analyticsService.js`.
*   **Action:** No changes required. Verified correct implementation.

### 5. `client/src/features/documents/hooks/useDocumentScanner.js`

*   **Issue:** Identified in `technical-debt.md` as potentially having direct Storage access (via its dependency `documentProcessingService`).
*   **Analysis:** The hook itself does not directly use Firebase SDKs. It correctly calls `documentProcessingService.uploadDocument`. Since `documentProcessingService` has now been refactored to use the backend API, `useDocumentScanner` indirectly benefits from this change without needing modification itself.
*   **Action:** No changes required *in this file*.

## Recommendations for Further Improvement

1.  **Verify Backend Services:** Ensure the corresponding backend services (`receiptService`, `inventoryService`, `analyticsService`) correctly implement server-side data fetching/manipulation using the Firebase Admin SDK and enforce user ownership checks (e.g., ensuring a user can only fetch/modify their own data).
2.  **Implement Missing Backend Logic:** Create the necessary backend routes, controllers, and services for inventory and analytics if they don't fully exist yet, mirroring the structure used for receipts and documents.
3.  **Centralized API Client:** The use of the shared `api` utility (`client/src/shared/services/api.js`) is good. Ensure it handles base URL configuration, authentication token injection (interceptors), and potentially centralized error handling consistently.
4.  **Security Rules:** Prioritize completing and testing the Firestore and Storage security rules (`firestore.rules`, `storage.rules`) as outlined in `technical-debt.md`. This is crucial even with backend API calls.
5.  **Error Handling:** Standardize error handling between the client and server. The backend should return consistent error formats, and the client-side services/hooks should handle these gracefully (e.g., showing user-friendly messages via `useToast`).
