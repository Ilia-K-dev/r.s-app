---
title: "Database Schema Analysis (Firestore)"
created: 2025-05-06
last_updated: 2025-05-08
update_history:
  - 2025-05-08: Documented Firestore indexes for receipts.
  - 2025-05-06: Added standardized metadata header.
  - date: 2025-05-16
    description: Added YAML front matter and navigation headers.
status: Complete
owner: Cline EDI Assistant
related_files:
  - firestore.rules
  - docs/core/data-model.md
---

# Database Schema Analysis (Firestore)

[Home](/docs) > [Developer Documentation](/docs/developer) > [Architecture Documentation](/docs/developer/architecture) > Database Schema Analysis (Firestore)

## In This Document
- [Collections and Document Structure](#collections-and-document-structure)
  - [`/users/{userId}`](#usersuserid)
  - [`/receipts/{receiptId}`](#receiptsreceiptid)
  - [`/categories/{categoryId}`](#categoriescategoryid)
  - [`/products/{productId}`](#productsproductid)
  - [`/inventory/{inventoryId}`](#inventoryinventoryid)
  - [`/stockMovements/{stockMovementId}`](#stockmovementsstockmovementid)
  - [`/alerts/{alertId}`](#alertsalertid)
  - [`/vendors/{vendorId}`](#vendorsvendorid)
  - [`/documents/{documentId}`](#documentsdocumentid)
  - [`/notifications/{notificationId}`](#notificationsnotificationid)
  - [`/notificationPreferences/{prefsId}`](#notificationpreferencesprefsid)
  - [`/exports/{exportId}`](#exportsexportid)
- [Firestore Indexes](#firestore-indexes)
- [Data Modeling Observations and Potential Considerations](#data-modeling-observations-and-potential-considerations)

## Related Documentation
- [firestore.rules](firestore.rules)
- [Data Model](../../core/data-model.md)

This document analyzes the structure and relationships of data within the Firestore database used by the Receipt Scanner application, based on the `firestore.rules` file and code analysis.

## Collections and Document Structure

The Firestore database utilizes the following top-level collections, with document IDs typically being automatically generated unless otherwise specified (e.g., `users`, `notificationPreferences`):

### `/users/{userId}`

*   **Purpose:** Stores individual user profiles.
    *   **Document ID:** Matches the Firebase Authentication User ID (`userId`).
    *   **Fields:**
        *   `email`: string (1-100 chars) - User's email address.
        *   `createdAt`: timestamp - Timestamp of user creation.
        *   *(Other user-specific fields may exist but are not explicitly validated in rules)*
    *   **Relationships:** Implicitly linked to Firebase Auth users.

### `/receipts/{receiptId}`

*   **Purpose:** Stores individual receipt records.
    *   **Document ID:** Auto-generated (`receiptId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user who owns the receipt.
        *   `merchant`: string (1-100 chars) - Name of the merchant.
        *   `date`: timestamp - Date of the receipt.
        *   `total`: number/float (0.01-1,000,000) - Total amount of the receipt.
        *   `items`: array - Array of items on the receipt. *(Structure of items array not explicitly validated in rules)*
        *   `createdAt`: timestamp - Timestamp of receipt creation.
        *   `updatedAt`: timestamp - Timestamp of last update.
        *   `imageUrl`: string (1-1024 chars) - URL of the associated receipt image.
        *   `gcsUri`: string (1-1024 chars) - Google Cloud Storage URI of the image.
        *   `classification`: map - Document classification data.
        *   `confidence`: number - Confidence score of the classification.
        *   `originalText`: string - Raw text extracted from the image.
    *   **Relationships:** Owned by a user via the `userId` field.

### `/categories/{categoryId}`

*   **Purpose:** Stores user-defined categories for organizing expenses/items.
    *   **Document ID:** Auto-generated (`categoryId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user who owns the category.
        *   `name`: string (1-50 chars) - Category name.
        *   `budget`: number (0-1,000,000) - Optional budget for the category.
        *   `color`: string (hex color format) - Optional color for the category.
    *   **Relationships:** Owned by a user via the `userId` field.

### `/products/{productId}`

*   **Purpose:** Stores product information, likely linked to inventory items.
    *   **Document ID:** Auto-generated (`productId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user who owns the product.
        *   `name`: string (1-100 chars) - Product name.
        *   `unitPrice`: number (0-1,000,000) - Unit price of the product.
        *   `description`: string (0-500 chars) - Optional product description.
    *   **Relationships:** Owned by a user via the `userId` field.

### `/inventory/{inventoryId}`

*   **Purpose:** Stores inventory item records.
    *   **Document ID:** Auto-generated (`inventoryId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user who owns the inventory item.
        *   `productId`: string (1-100 chars) - ID of the associated product.
        *   `quantity`: number (0-1,000,000) - Current stock quantity.
        *   `location`: string (0-100 chars) - Optional storage location.
        *   `createdAt`: timestamp - Timestamp of creation.
        *   `updatedAt`: timestamp - Timestamp of last update.
    *   **Relationships:** Owned by a user via the `userId` field. Links to a product via the `productId` field.

### `/stockMovements/{stockMovementId}`

*   **Purpose:** Records changes in stock levels for inventory items.
    *   **Document ID:** Auto-generated (`stockMovementId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user.
        *   `itemId`: string (1-100 chars) - ID of the affected inventory item/product.
        *   `quantity`: number - Change in quantity (can be positive or negative).
        *   `movementType`: string (1-50 chars) - Type of movement (e.g., 'purchase', 'sale').
        *   `timestamp`: timestamp - Timestamp of the movement.
        *   `createdAt`: timestamp - Timestamp of creation.
    *   **Relationships:** Owned by a user via the `userId` field. Links to an inventory item/product via the `itemId` field. Documents are immutable after creation.

### `/alerts/{alertId}`

*   **Purpose:** Stores user alerts (e.g., low stock alerts).
    *   **Document ID:** Auto-generated (`alertId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user.
        *   `itemId`: string (1-100 chars) - ID of the related inventory item/product.
        *   `message`: string (1-200 chars) - Alert message.
        *   `isRead`: boolean - Status of the alert.
        *   `createdAt`: timestamp - Timestamp of creation.
    *   **Relationships:** Owned by a user via the `userId` field. Links to an inventory item/product via the `itemId` field.

### `/vendors/{vendorId}`

*   **Purpose:** Stores vendor information.
    *   **Document ID:** Auto-generated (`vendorId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user who owns the vendor record.
        *   `name`: string (1-100 chars) - Vendor name.
        *   `contactEmail`: string (0-100 chars) - Optional contact email.
        *   `phone`: string (0-30 chars) - Optional phone number.
    *   **Relationships:** Owned by a user via the `userId` field.

### `/documents/{documentId}`

*   **Purpose:** Stores metadata about uploaded documents.
    *   **Document ID:** Auto-generated (`documentId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user who owns the document record.
        *   `imageUrl`: string (1-1024 chars) - URL of the stored image.
        *   `gcsUri`: string (1-1024 chars) - Google Cloud Storage URI.
        *   `classification`: map - Document classification data.
        *   `createdAt`: timestamp - Timestamp of creation.
        *   *(Other fields related to processing results may exist)*
    *   **Relationships:** Owned by a user via the `userId` field.

### `/notifications/{notificationId}`

*   **Purpose:** Stores user notifications.
    *   **Document ID:** Auto-generated (`notificationId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user.
        *   `message`: string (1-500 chars) - Notification message.
        *   `isRead`: boolean - Read status.
        *   `createdAt`: timestamp - Timestamp of creation.
    *   **Relationships:** Owned by a user via the `userId` field. Primarily created by server/functions.

### `/notificationPreferences/{prefsId}`

*   **Purpose:** Stores user notification preferences.
    *   **Document ID:** Matches the Firebase Authentication User ID (`userId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user who owns the preferences.
        *   `preferences`: map - Object containing preference settings.
    *   **Relationships:** Owned by a user via the `userId` field. Document ID is the `userId`.

### `/exports/{exportId}`

*   **Purpose:** Stores metadata about generated data export files.
    *   **Document ID:** Generated using UUID (`exportId`).
    *   **Fields:**
        *   `userId`: string - The ID of the user who requested the export.
        *   `filename`: string - Name of the export file in Storage.
        *   `filePath`: string - Full path to the file in Storage.
        *   `format`: string - Export format ('csv', 'pdf', 'json').
        *   `reportType`: string - Type of data exported ('receipts', 'inventory').
        *   `createdAt`: timestamp - Timestamp of generation.
        *   `status`: string - Export status (e.g., 'completed').
    *   **Relationships:** Owned by a user via the `userId` field. Links to a file in Firebase Storage.

## Firestore Indexes

Firestore uses indexes to enable efficient querying. The following key indexes are configured for the application:

*   **Receipts by User and Creation Time:**
    *   **Collection Group:** `receipts`
    *   **Fields:** `userId` (Ascending), `createdAt` (Descending)
    *   **Purpose:** Supports fetching a user's receipts ordered by the most recent.

*   **Receipts by User and Hebrew Merchant Name:**
    *   **Collection Group:** `receipts`
    *   **Fields:** `userId` (Ascending), `merchantHe` (Ascending)
    *   **Purpose:** Supports searching for a user's receipts based on the normalized Hebrew merchant name.

## Data Modeling Observations and Potential Considerations

### Ownership Model

The consistent use of the `userId` field in most top-level collections effectively implements an ownership model, allowing users to access and manage their own data.
### Relationships

Relationships between documents are primarily modeled using document IDs (e.g., linking inventory items to products, stock movements to inventory/products). This is a common approach in NoSQL databases.
### Denormalization

There is some denormalization apparent, such as storing `merchant` and `total` directly in the `receipts` collection, even though a `vendors` collection exists. This can improve read performance for common queries but requires careful consistency management during writes.
### Arrays in Documents

The `items` array within the `receipts` document is mentioned. Storing arrays directly within documents is suitable for data that is typically accessed and updated together with the parent document and where the array size is expected to be reasonably limited. For very large or frequently updated arrays, a subcollection might be a more scalable approach.
### Lack of Subcollections

Based on the provided rules, there are no explicit subcollections defined. Depending on access patterns and data growth, using subcollections (e.g., `/receipts/{receiptId}/items/{itemId}`) could be beneficial for managing large lists of related data or implementing different access controls for sub-elements.
### Data Validation in Rules

The `firestore.rules` provide a good layer of data validation, enforcing expected field types and basic constraints. However, more complex business logic validation should be handled on the server or in functions.

### Firestore Indexes

Firestore uses indexes to enable efficient querying. The following key indexes are configured for the application:

*   **Receipts by User and Creation Time:**
    *   **Collection Group:** `receipts`
    *   **Fields:** `userId` (Ascending), `createdAt` (Descending)
    *   **Purpose:** Supports fetching a user's receipts ordered by the most recent.

*   **Receipts by User and Hebrew Merchant Name:**
    *   **Collection Group:** `receipts`
    *   **Fields:** `userId` (Ascending), `merchantHe` (Ascending)
    *   **Purpose:** Supports searching for a user's receipts based on the normalized Hebrew merchant name.

This analysis provides a detailed view of the Firestore database schema, highlighting the collection structure, key fields, relationships, and data modeling patterns.<environment_details>
# VSCode Visible Files
docs/developer/architecture/architecture-api-integration-map.md

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
seed-data.bat
server/test-emulator-connection.js
server/seed-all.js

# Current Time
5/16/2025, 10:45:37 PM (Asia/Jerusalem, UTC+3:00)

# Context Window Usage
906,900 / 1,048.576K tokens used (86%)

# Current Mode
ACT MODE
</environment_details>
