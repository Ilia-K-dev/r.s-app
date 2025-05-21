---
title: "Routing Consistency Report"
creation_date: 2025-04-29
update_history:
  - date: 2025-04-29
    description: Initial creation of the report.
  - date: 2025-05-16
    description: Added YAML front matter and navigation headers.
status: Completed
owner: Cline EDI Assistant
related_files:
  - client/src/routes.js
---

# Routing Consistency Report

[Home](/docs) > [Analysis Documentation](/docs/analysis) > [Code Quality Analysis](/docs/analysis/code-quality) > Routing Consistency Report

## In This Document
- [1. Issue Diagnosis](#1-issue-diagnosis)
- [2. Resolution: Corrected Routing Configuration](#2-resolution-corrected-routing-configuration)
- [3. Component Location Documentation](#3-component-location-documentation)
- [4. Routing Consistency Check](#4-routing-consistency-check)
- [Conclusion](#conclusion)

## Related Documentation
- [client/src/routes.js](client/src/routes.js)

This document reports on the resolution of the routing import error and verifies the consistency of routing configuration after cleanup.

## 1. Issue Diagnosis

*   **Error:** `Module Import Error: "Can't resolve './core/pages/DashboardPage'"` reported during application build or runtime.
*   **Root Cause:** The `client/src/routes.js` file was importing `DashboardPage` and potentially other feature pages (`ReceiptsPage`, `ReportsPage`, `SettingsPage`) from the outdated `./core/pages/` directory.
*   **File Structure Analysis:** Post-cleanup, these pages reside within their respective feature directories under `client/src/features/`, specifically:
    *   `client/src/features/analytics/pages/DashboardPage.js`
    *   `client/src/features/analytics/pages/ReportsPage.js`
    *   `client/src/features/receipts/pages/ReceiptDetailPage.js` (Used for `/receipts` and `/receipts/:id`)
    *   `client/src/features/settings/pages/SettingsPage.js`
*   **Confirmation:** The file `client/src/core/pages/DashboardPage.js` was confirmed to exist only in `client/extra/DashboardPage.js`, indicating it was correctly moved during cleanup, but the import path in `routes.js` was not updated.

## 2. Resolution: Corrected Routing Configuration

*   **File Modified:** `client/src/routes.js`
*   **Changes:**
    1.  Updated the import statement for `DashboardPage` to point to the correct feature path:
        ```diff
        - import { DashboardPage } from './core/pages/DashboardPage';
        + import { DashboardPage } from './features/analytics/pages/DashboardPage';
        ```
    2.  Updated the import statement for `ReportsPage`:
        ```diff
        - import { ReportsPage } from './core/pages/ReportsPage';
        + import { ReportsPage } from './features/analytics/pages/ReportsPage';
        ```
    3.  Updated the import statement for `SettingsPage`:
        ```diff
        - import { SettingsPage } from './core/pages/SettingsPage';
        + import { SettingsPage } from './features/settings/pages/SettingsPage';
        ```
    4.  Updated the import for the main receipts view. Since a dedicated `ReceiptListPage` wasn't explicitly found, `ReceiptDetailPage` was used for both `/receipts` and `/receipts/:receiptId` as a placeholder. The original incorrect import was removed.
        ```diff
        - import { ReceiptsPage } from './core/pages/ReceiptsPage'; // Removed incorrect import
        + import { ReceiptDetailPage } from './features/receipts/pages/ReceiptDetailPage'; // Added correct import
        ```
    5.  Updated the route definitions to use the correctly imported components:
        ```javascript
        children: [
          { index: true, element: <DashboardPage /> }, // Uses corrected import
          { path: 'receipts', element: <ReceiptDetailPage /> }, // Uses corrected import (placeholder)
          { path: 'receipts/:receiptId', element: <ReceiptDetailPage /> }, // Uses corrected import
          { path: 'reports', element: <ReportsPage /> }, // Uses corrected import
          { path: 'settings', element: <SettingsPage /> }, // Uses corrected import
        ],
        ```

## 3. Component Location Documentation

*   **DashboardPage:** `client/src/features/analytics/pages/DashboardPage.js`
*   **ReportsPage:** `client/src/features/analytics/pages/ReportsPage.js`
*   **ReceiptDetailPage:** `client/src/features/receipts/pages/ReceiptDetailPage.js`
*   **SettingsPage:** `client/src/features/settings/pages/SettingsPage.js`
*   **NotFoundPage:** `client/src/core/pages/NotFoundPage.js`
*   **Auth Pages (Login, Register, ForgotPassword):** `client/src/features/auth/components/`

## 4. Routing Consistency Check

*   **Imports:** All page components referenced in the `router` configuration now use relative paths pointing to their correct locations within the `src/features/` or `src/core/` directories.
*   **Structure:** The routing structure uses `createBrowserRouter` with a main layout protected by `AuthGuard` and nested child routes for features. Auth routes are defined at the top level. This structure is consistent.
*   **Feature Alignment:** Routes generally align with the feature-based directory structure (e.g., `/reports` maps to a page in `features/analytics/pages`).
*   **Potential Improvement:** The `/receipts` path currently points to `ReceiptDetailPage`. A dedicated `ReceiptListPage` component should ideally be created in `client/src/features/receipts/pages/` and used for the `/receipts` route to display a list of receipts, while `/receipts/:receiptId` remains for the detail view.

## Conclusion

The "Can't resolve './core/pages/DashboardPage'" error was caused by outdated import paths in `client/src/routes.js`. The import paths for `DashboardPage`, `ReportsPage`, `SettingsPage`, and the receipts view have been corrected to point to their actual locations within the `features` directory structure. The routing configuration is now consistent with the project's feature-based organization, although a dedicated list page for receipts is recommended for the `/receipts` path.
