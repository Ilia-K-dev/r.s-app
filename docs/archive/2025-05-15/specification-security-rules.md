---
title: Updated Security Rules Documentation
created: 2025-04-29
last_updated: 2025-05-06
update_history:
  - 2025-04-29: Initial documentation of updated rules.
  - 2025-05-06: Updated to standardized metadata header.
status: Complete
owner: Cline (AI Engineer)
related_files: []
---

# Updated Security Rules Documentation

## Table of Contents

* [Summary of Security Rule Gaps Addressed](#summary-of-security-rule-gaps-addressed)
* [Updated Firestore Rules (`firestore.rules`)](#updated-firestore-rules-firestorerules)
* [Updated Storage Rules (`storage.rules`)](#updated-storage-rules-storagerules)
* [Test Scenarios (Conceptual)](#test-scenarios-conceptual)
* [Recommendations for Further Security Enhancements](#recommendations-for-further-security-enhancements)

### 1. Summary of Security Rule Gaps Addressed

Based on the [`technical-debt.md`](../../../maintenance/technical-debt.md) document and review of the previous rules:

*   **Firestore:**
    *   **Redundancy:** Removed duplicated rule definitions.
    *   **Inconsistent/Incomplete Validation:** Replaced basic `isValid...` functions and inconsistent inline checks with more comprehensive, type-specific validation helper functions (`isValidString`, `isValidNumber`, `isValidTimestamp`, `isValidUserDoc`, `isValidReceipt`, etc.). Applied these validation functions consistently during `create` and `update` operations for all relevant collections.
    *   **Missing Rules:** Ensured all required collections (`products`, `inventory`, `stockMovements`, `alerts`, `vendors`, `documents`, `notifications`, `notificationPreferences`) have explicit `match` blocks with appropriate read/write/validation rules.
    *   **Immutability:** Confirmed `stockMovements` rules prevent updates/deletes.
    *   **Server-Only Creation:** Confirmed `notifications` rules prevent client creation.
*   **Storage:**
    *   **Missing Paths:** Added explicit `match` blocks for `/profiles/{userId}/{fileName}`, `/documents/{userId}/{fileName}`, and `/exports/{userId}/{fileName}`.
    *   **Redundancy:** Consolidated profile picture storage under `/profiles/` and removed the old `/users/{userId}/profile_image` path.
    *   **Validation:** Refined file size and `contentType` validation using `request.resource.size` and `request.resource.contentType.matches()`. Made content type checks more specific (e.g., `image/(jpeg|png|gif|webp)`).
    *   **Write Access:** Restricted write access for `/exports/` to backend/functions only (`allow write: if false;`).

### 2. Updated Firestore Rules ([`firestore.rules`](../../../firestore.rules))

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- Helper Functions ---
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if the requesting user is the owner based on path userId.
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Checks if the user ID matches the document's userId field during read/update/delete.
    function isResourceOwner(resource) {
        return isAuthenticated() && request.auth.uid == resource.data.userId;
    }
    
    // Checks if the incoming data has the correct owner ID during create.
    function isDataOwner(data) {
        return isAuthenticated() && request.auth.uid == data.userId;
    }

    // --- Data Validation Functions ---
    function isValidString(str, minLen, maxLen) {
      return str is string && str.size() >= minLen && str.size() <= maxLen;
    }

    function isValidNumber(num, minVal, maxVal) {
      // Allow integers and floats within the specified range
      return (num is number || num is float) && num >= minVal && num <= maxVal;
    }
    
    function isValidTimestamp(ts) {
        // Allow server timestamp or a valid request timestamp (not in the future)
        return ts == request.time || (ts is timestamp && ts <= request.time);
    }

    // Validate required fields for a user document
    function isValidUserDoc(data) {
      return isValidString(data.email, 1, 100) // Assuming email is stored and required
          && data.createdAt is timestamp; // Ensure createdAt is a timestamp
          // Add checks for other required fields like displayName if necessary
    }

    // Validate required fields for a receipt document
    function isValidReceipt(data) {
      return isDataOwner(data) // Ensure userId matches authenticated user
          && isValidString(data.merchant, 1, 100)
          && data.date is timestamp // Ensure date is a timestamp
          && isValidNumber(data.total, 0.01, 10000000) // Example range for total
          && data.createdAt is timestamp; // Ensure createdAt is a timestamp
          // Optionally add validation for 'items' array structure if stored directly
    }
    
    // Validate required fields for a category document
    function isValidCategory(data) {
        return isDataOwner(data)
            && isValidString(data.name, 1, 50)
            // Optional fields validation: check only if the field exists
            && (!('budget' in data) || isValidNumber(data.budget, 0, 10000000)) 
            && (!('color' in data) || (data.color is string && data.color.matches('^#[0-9A-Fa-f]{6}$'))); 
    }

    // Validate required fields for a product document
    function isValidProduct(data) {
      return isDataOwner(data)
          && isValidString(data.name, 1, 100)
          && isValidNumber(data.unitPrice, 0, 10000000) // Allow 0 price?
          && (!('description' in data) || isValidString(data.description, 0, 500)); 
    }

    // Validate required fields for an inventory document
    function isValidInventory(data) {
      return isDataOwner(data)
          && isValidString(data.productId, 1, 100) // Reference to a product
          && isValidNumber(data.quantity, 0, 1000000) // Allow 0 quantity
          && (!('location' in data) || isValidString(data.location, 0, 100)); 
    }

    // Validate required fields for a stock movement document
    function isValidStockMovement(data) {
      return isDataOwner(data)
          && isValidString(data.itemId, 1, 100) // Reference to inventory item
          && data.quantity is number // Allow positive/negative for adjustments
          && isValidString(data.movementType, 1, 50) 
          && data.timestamp is timestamp; // Should be set by server
    }

    // Validate required fields for an alert document
    function isValidAlert(data) {
      return isDataOwner(data)
          && isValidString(data.itemId, 1, 100) // Reference to inventory item
          && isValidString(data.message, 1, 200)
          && data.isRead is bool
          && data.createdAt is timestamp;
    }

    // Validate required fields for a vendor document
    function isValidVendor(data) {
      return isDataOwner(data)
          && isValidString(data.name, 1, 100)
          && (!('contactEmail' in data) || isValidString(data.contactEmail, 0, 100)) 
          && (!('phone' in data) || isValidString(data.phone, 0, 30));
    }

    // Validate required fields for a processed document metadata document
    function isValidDocument(data) {
      return isDataOwner(data)
          && isValidString(data.imageUrl, 1, 1024) // Check URL length
          && isValidString(data.gcsUri, 1, 1024)   // Check GCS URI length
          && data.classification is map           // Ensure classification is an object
          && data.createdAt is timestamp;
          // Add more checks: e.g., classification.type is string, classification.confidence is number
    }

    // Validate required fields for a notification document (read/update only)
    function isValidNotification(data) {
      return isDataOwner(data) // Check ownership on read/update
          && isValidString(data.message, 1, 500)
          && data.isRead is bool
          && data.createdAt is timestamp;
    }
    
    // Validate required fields for notification preferences document
    function isValidNotificationPreferences(data) {
      return isDataOwner(data)
          && data.preferences is map; // Ensure preferences field exists and is a map
    }

    // --- Collection Rules ---

    // Users: Only the user themselves can read/write their own document.
    match /users/{userId} {
      allow read, update, delete: if isOwner(userId);
      // Creation usually handled by Auth triggers or backend upon signup.
      // Allow direct create only if necessary and validated.
      allow create: if isOwner(userId) && isValidUserDoc(request.resource.data); 
    }

    // Receipts: Owned data, validated on write.
    match /receipts/{receiptId} {
      allow read: if isResourceOwner(resource);
      allow create: if isDataOwner(request.resource.data) && isValidReceipt(request.resource.data);
      allow update: if isResourceOwner(resource) && isValidReceipt(request.resource.data); 
      allow delete: if isResourceOwner(resource);
    }

    // Categories: Owned data, validated on write.
    match /categories/{categoryId} {
      allow read: if isResourceOwner(resource);
      allow create: if isDataOwner(request.resource.data) && isValidCategory(request.resource.data);
      allow update: if isResourceOwner(resource) && isValidCategory(request.resource.data);
      allow delete: if isResourceOwner(resource);
    }

    // Products: Owned data, validated on write.
    match /products/{productId} {
      allow read: if isResourceOwner(resource);
      allow create: if isDataOwner(request.resource.data) && isValidProduct(request.resource.data);
      allow update: if isResourceOwner(resource) && isValidProduct(request.resource.data);
      allow delete: if isResourceOwner(resource);
    }

    // Inventory: Owned data, validated on write.
    match /inventory/{inventoryId} {
      allow read: if isResourceOwner(resource);
      allow create: if isDataOwner(request.resource.data) && isValidInventory(request.resource.data);
      allow update: if isResourceOwner(resource) && isValidInventory(request.resource.data);
      allow delete: if isResourceOwner(resource);
    }

    // StockMovements: Owned data, immutable after creation (for audit).
    match /stockMovements/{stockMovementId} {
      allow read: if isResourceOwner(resource);
      // Creation should ideally be restricted to backend/functions.
      allow create: if isDataOwner(request.resource.data) && isValidStockMovement(request.resource.data); 
      allow update: if false; // Immutable
      allow delete: if false; // Keep for audit trail
    }

    // Alerts: Owned data, validated on write.
    match /alerts/{alertId} {
      allow read: if isResourceOwner(resource);
      // Creation should ideally be restricted to backend/functions.
      allow create: if isDataOwner(request.resource.data) && isValidAlert(request.resource.data);
      allow update: if isResourceOwner(resource) && isValidAlert(request.resource.data); // Allow updating 'isRead'
      allow delete: if isResourceOwner(resource); 
    }

    // Vendors: Owned data, validated on write.
    match /vendors/{vendorId} {
      allow read: if isResourceOwner(resource);
      allow create: if isDataOwner(request.resource.data) && isValidVendor(request.resource.data);
      allow update: if isResourceOwner(resource) && isValidVendor(request.resource.data);
      allow delete: if isResourceOwner(resource);
    }

    // Documents: Owned data, validated on write. Creation via backend preferred.
    match /documents/{documentId} {
      allow read: if isResourceOwner(resource);
      // Creation is handled by the backend upload process. Direct client creation disallowed.
      allow create: if false; 
      // Allow updates if manual correction is needed, ensure validation.
      allow update: if isResourceOwner(resource) && isValidDocument(request.resource.data); 
      allow delete: if isResourceOwner(resource);
    }

    // Notifications: Owned data, server-created, client can update read status or delete.
     match /notifications/{notificationId} {
      allow read: if isResourceOwner(resource);
      allow create: if false; // Only server/functions create notifications
      // Only allow updating the 'isRead' field by the owner.
      allow update: if isResourceOwner(resource) 
                      && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isRead'])
                      && request.resource.data.isRead is bool; 
      allow delete: if isResourceOwner(resource);
    }
    
    // NotificationPreferences: Owned data, requires valid fields. Assumes doc ID is userId.
    match /notificationPreferences/{userId} { 
        allow read: if isOwner(userId);
        // Allow create/update only if the document ID matches the user ID and data is valid.
        allow create: if isOwner(userId) && isValidNotificationPreferences(request.resource.data);
        allow update: if isOwner(userId) && isValidNotificationPreferences(request.resource.data);
        allow delete: if isOwner(userId); 
    }
  }
}
```

## 3. Updated Storage Rules ([`storage.rules`](../../../storage.rules))

```storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if the requesting user matches the userId in the path
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // --- User-Specific Paths ---

    // Profile Images: Allow users to read/write their own profile images (max 2MB, specific image types).
    // Path: /profiles/{userId}/{fileName}
    match /profiles/{userId}/{fileName} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId)
                   && request.resource.size < 2 * 1024 * 1024 // Max 2MB
                   && request.resource.contentType.matches('image/(jpeg|png|gif|webp)');
      // Implicit delete allowed if write is allowed.
    }

    // General Documents (including Receipts): Allow users to read their own documents.
    // Write access is handled by the backend API via documentService.js.
    // Path: /documents/{userId}/{fileName}
    match /documents/{userId}/{fileName} {
      allow read: if isOwner(userId);
      // Write should only be allowed via the backend service using Admin SDK.
      allow write: if false; 
      allow delete: if isOwner(userId); // Allow owner to delete their documents.
    }
    
    // Receipt Images (Legacy or if kept separate): Allow users to read their own receipts.
    // Write access handled by backend API.
    // Path: /receipts/{userId}/{fileName} 
    // RECOMMENDATION: Merge into /documents/ path for simplicity.
    match /receipts/{userId}/{fileName} {
      allow read: if isOwner(userId);
      // Write should only be allowed via the backend service using Admin SDK.
      allow write: if false; 
      allow delete: if isOwner(userId); // Allow owner to delete their receipts.
    }

    // Inventory Item Images: Allow users to read/write images for their inventory items.
    // Path: /inventory/{userId}/{productId}/images/{imageId}
    match /inventory/{userId}/{productId}/images/{imageId} {
       // TODO: Implement Firestore check for ownership if needed for extra security:
       // function isInventoryOwner(userId, productId) { ... }
       // allow read, write: if isAuthenticated() && isInventoryOwner(userId, productId)
       
       // Simplified rule (relies on path userId):
       allow read: if isOwner(userId); 
       allow write: if isOwner(userId)
                    && request.resource.size < 3 * 1024 * 1024 // Max 3MB
                    && request.resource.contentType.matches('image/(jpeg|png|gif|webp)');
       allow delete: if isOwner(userId); // Allow owner to delete inventory images.
    }

    // Data Exports: Allow users to read their own exports. Write/Delete controlled by backend.
    // Path: /exports/{userId}/{fileName}
    match /exports/{userId}/{fileName} {
      allow read: if isOwner(userId);
      // Write/Delete access should be restricted to backend/functions only.
      allow write: if false; 
      allow delete: if false; // Prevent accidental client deletion.
    }
  }
}
```

## 4. Test Scenarios (Conceptual)

These scenarios describe tests that should be performed (ideally using the Firebase Emulator Suite) to verify the rules:

*   **Firestore - Read Own Data:** Authenticated User A attempts to read `/receipts/receipt123` where `receipt123.userId == A.uid`. **Expected:** Success.
*   **Firestore - Read Other's Data:** Authenticated User A attempts to read `/receipts/receiptXYZ` where `receiptXYZ.userId == B.uid`. **Expected:** Fail (Permission Denied).
*   **Firestore - Create Valid Data:** Authenticated User A attempts to create a document in `/inventory/` with `userId: A.uid` and valid fields according to `isValidInventory`. **Expected:** Success.
*   **Firestore - Create Invalid Data:** Authenticated User A attempts to create a document in `/products/` with `userId: A.uid` but missing the required `name` field. **Expected:** Fail (Permission Denied due to `isValidProduct` check).
*   **Firestore - Create Data for Other User:** Authenticated User A attempts to create a document in `/categories/` with `userId: B.uid`. **Expected:** Fail (Permission Denied due to `isDataOwner` check).
*   **Firestore - Update Immutable Data:** Authenticated User A attempts to update `/stockMovements/move123`. **Expected:** Fail (Permission Denied due to `allow update: if false;`).
*   **Firestore - Client Create Notification:** Authenticated User A attempts to create a document in `/notifications/`. **Expected:** Fail (Permission Denied due to `allow create: if false;`).
*   **Storage - Read Own Profile Pic:** Authenticated User A attempts to read `/profiles/A.uid/pic.jpg`. **Expected:** Success.
*   **Storage - Read Other's Profile Pic:** Authenticated User A attempts to read `/profiles/B.uid/pic.jpg`. **Expected:** Fail (Permission Denied).
*   **Storage - Upload Large Profile Pic:** Authenticated User A attempts to write a 3MB file to `/profiles/A.uid/large.jpg`. **Expected:** Fail (Permission Denied due to size limit).
*   **Storage - Upload Invalid Type Profile Pic:** Authenticated User A attempts to write a `.txt` file to `/profiles/A.uid/text.txt`. **Expected:** Fail (Permission Denied due to content type).
*   **Storage - Client Write Document:** Authenticated User A attempts to write to `/documents/A.uid/mydoc.pdf`. **Expected:** Fail (Permission Denied due to `allow write: if false;`).
*   **Storage - Delete Own Document:** Authenticated User A attempts to delete `/documents/A.uid/mydoc.pdf`. **Expected:** Success.
*   **Storage - Delete Other's Document:** Authenticated User A attempts to delete `/documents/B.uid/otherdoc.pdf`. **Expected:** Fail (Permission Denied).
*   **Storage - Client Write Export:** Authenticated User A attempts to write to `/exports/A.uid/report.csv`. **Expected:** Fail (Permission Denied due to `allow write: if false;`).

## 5. Recommendations for Further Security Enhancements

1.  **Firestore Validation Granularity:** The `isValid...` functions can be made even more specific, validating data formats (e.g., dates, emails), allowed values for specific fields (e.g., `movementType`), and relationships (e.g., ensuring `itemId` in `stockMovements` exists in `inventory`).
2.  **Storage - Cross-Service Rules:** For paths like `/inventory/{userId}/{productId}/images/{imageId}`, implement the commented-out Firestore check (`isInventoryOwner`) to ensure the user actually owns the corresponding inventory item document before allowing image uploads/reads. This prevents users from potentially accessing/writing images for inventory items they don't own, even if the `userId` in the path matches.
3.  **Input Sanitization (Backend):** While security rules provide access control, always sanitize and validate all data received from the client on the backend (in controllers/services) before interacting with the database or other services. Do not rely solely on client-side validation or security rules for data integrity.
4.  **Rate Limiting (Backend):** The existing rate limiting in `app.js` is good. Ensure critical or expensive endpoints have appropriate limits.
5.  **Function Security:** If using Cloud Functions triggered by Firestore/Storage events, ensure the functions themselves have appropriate error handling and don't perform actions beyond their intended scope.
6.  **Regular Audits:** Periodically review security rules and backend code for potential vulnerabilities as the application evolves.
7.  **Emulator Testing:** Integrate security rule testing into the CI/CD pipeline using the Firebase Emulator Suite to catch regressions automatically.

</file_content>

Now that you have the latest state of the file, try the operation again with fewer, more precise SEARCH blocks. For large files especially, it may be prudent to try to limit yourself to <5 SEARCH/REPLACE blocks at a time, then wait for the user to respond with the result of the operation before following up with another replace_in_file call to make additional edits.
(If you run into this error 3 times in a row, you may use the write_to_file tool as a fallback.)
</error><environment_details>
# VSCode Visible Files
docs/developer/specifications/security-rules.md

# VSCode Open Tabs
client/.env.development
client/public/manifest.json
analysis/comprehensive-checklist.md
documentation/templates/feature_spec.md
documentation/templates/api_doc.md
documentation/templates/technical_doc.md
docs/analysis/code-structure/file-inventory.md
docs/analysis/configuration/firebase-config.md
docs/user/user-guide.md
docs/developer/specifications/api-documentation-setup.md
docs/developer/guides/error-handling-standards.md
docs/developer/guides/testing-guide.md
docs/developer/guides/ui-component-usage.md
docs/developer/guides/deployment-guide.md
docs/archive/old-checklists/master-checklist.md
docs/archive/old-checklists/checklist-creation-verification.md
docs/archive/old-checklists/inventory-api-checklist.md
docs/archive/old-checklists/document-processing-checklist.md
docs/archive/old-checklists/receipt-list-page-checklist.md
docs/archive/old-checklists/analytics-api-checklist.md
docs/archive/old-checklists/export-api-checklist.md
docs/archive/old-checklists/security-tests-checklist.md
docs/archive/old-checklists/error-handling-checklist.md
docs/archive/old-checklists/performance-optimization-checklist.md
docs/archive/old-checklists/centralize-api-client-checklist.md
docs/archive/old-checklists/implementation-master-checklist.md
docs/archive/old-checklists/testing-commands.md
docs/archive/old-checklists/analysis-task-checklist.md
docs/archive/old-checklists/task-continuation-summary.md
docs/archive/work-plans/analysis-work-plan.md
docs/archive/reports/code-changes-report.md
docs/archive/reports/file-movement-report.md
docs/archive/reports/config-security-report.md
docs/archive/reports/core-features-analysis.md
docs/maintenance/technical-debt.md
docs/maintenance/development-summary.md
docs/maintenance/changelog.md
docs/developer/security/configuration-security.md
docs/developer/implementation/error-handling.md
docs/developer/implementation/performance-optimization.md
docs/developer/implementation/centralize-api-client.md
docs/developer/implementation/documentation-update.md
docs/maintenance/workplan-checklist.md
docs/maintenance/deployment-readiness-report.md
docs/maintenance/recommendations.md
docs/maintenance/technical-documentation.md
docs/developer/implementation/inventory-api.md
docs/developer/implementation/document-processing.md
docs/developer/implementation/receipt-list-page.md
docs/developer/implementation/analytics-api.md
docs/developer/implementation/export-api.md
docs/developer/implementation/security-tests.md
docs/developer/architecture/overview.md
docs/developer/architecture/application-structure.md
docs/developer/architecture/api-integration-map.md
docs/developer/architecture/auth-flow-analysis.md
docs/developer/architecture/database-schema-analysis.md
docs/developer/architecture/state-management-analysis.md
docs/developer/specifications/api.md
docs/developer/specifications/environment-config.md
docs/developer/specifications/security-rules.md
cline work and md/5.5/cline work plan and tasks.txt

# Current Time
5/6/2025, 2:19:07 AM (Asia/Jerusalem, UTC+3:00)

# Context Window Usage
592,784 / 1,048.576K tokens used (57%)

# Current Mode
ACT MODE
</environment_details>
