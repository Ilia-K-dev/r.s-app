---
title: Checklist: Firebase Security Rules Testing Script (Archived)
created: [YYYY-MM-DD - Original Creation Date]
last_updated: 2025-05-06
update_history:
  - 2025-05-06: Added standardized metadata header and moved to archive.
status: Deprecated
owner: [Primary Maintainer]
related_files: []
---

**Archival Note:** This document is an outdated checklist and has been moved to the archive. Refer to the main documentation for current information.

# Checklist: Firebase Security Rules Testing Script (Prompt 6)

This checklist tracks the completion of tasks for creating Firebase security rules testing scripts.

*   [x] Create a testing directory (`server/tests/security`) for security rule tests.
    *   Created directory using `mkdir`.
*   [x] Implement test scripts for Firestore security rules that verify:
    *   [x] Users can only read their own data across all collections.
    *   [x] Users cannot create documents with incorrect ownership (`userId`).
    *   [x] Document validation works for all collections.
    *   [x] Immutable collections (`stockMovements`) cannot be modified/deleted.
    *   [x] Server-only creation works for notifications (Tested client-side denial).
    *   Created `server/tests/security/firestore.test.js` with relevant tests.
*   [x] Implement test scripts for Storage security rules that verify:
    *   [x] Users can only access their own files.
    *   [x] File size limits are enforced.
    *   [x] Content type restrictions are enforced.
    *   [x] Write restrictions are properly applied to server-only paths.
    *   Created `server/tests/security/storage.test.js` with relevant tests.
*   [x] Create a `README.md` in the testing directory with:
    *   [x] Instructions for setting up the Firebase Emulator Suite.
    *   [x] Commands for running the tests.
    *   [x] Explanation of the test scenarios.
    *   Created `server/tests/security/README.md`.
*   [x] Use the test scenarios outlined in the `docs/developer/specifications/specification-security-rules.md` document as a guide.
    *   Test cases in `firestore.test.js` and `storage.test.js` are based on these scenarios.

**Completion Status:** All explicitly defined subtasks for Prompt 6 have been completed within the scope of this prompt. Note that testing server-only writes comprehensively might require additional setup beyond basic client-side denial tests.
