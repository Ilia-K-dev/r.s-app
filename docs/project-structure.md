---
title: "Receipt Scanner Application Project Structure"
creation_date: 2025-05-15
update_history:
  - date: 2025-05-15
    description: Initial creation of comprehensive project structure documentation.
  - date: 2025-05-16
    description: Added YAML front matter and navigation headers.
status: In Progress
owner: Cline EDI Assistant
related_files:
  - /docs/core/architecture.md
  - /docs/firebase/integration-architecture.md
---

# Receipt Scanner Application Project Structure

[Home](/docs) > [Core Documentation](/docs/core) > Receipt Scanner Application Project Structure

## In This Document
- [Overall Architecture](#overall-architecture)
- [Directory Structure](#directory-structure)
- [Key Files and Directories](#key-files-and-directories)
  - [Root Directory](#root-directory)
  - [analysis/](#analysis)
  - [client/](#client)
  - [client/public/](#clientpublic)
  - [client/scripts/](#clientscripts)
  - [client/src/](#clientsrc)
  - [client/src/components/](#clientsrccomponents)
  - [client/src/contexts/](#clientsrccontexts)
  - [client/src/core/](#clientsrccore)
  - [client/src/design-system/](#clientsrcdesign-system)
  - [client/src/features/](#clientsrcfeatures)
  - [client/src/hooks/](#clientsrchooks)
  - [client/src/locales/](#clientsrclocales)
  - [client/src/shared/](#clientsrcshared)
  - [client/src/store/](#clientsrcstore)
  - [client/src/styles/](#clientsrcstyles)
  - [client/src/utils/](#clientsrcutils)
  - [docs/](#docs)
  - [emulator-data/](#emulator-data)
  - [extra/](#extra)
  - [functions/](#functions)
  - [migration_docs/](#migration_docs)
  - [receipt-scanner-next/](#receipt-scanner-next)
  - [rules-test/](#rules-test)
  - [scripts/](#scripts)
  - [server/](#server)
  - [server/config/](#serverconfig)
  - [server/middleware/](#servermiddleware)
  - [server/routes/](#serverroutes)
  - [server/src/](#serversrc)
  - [server/services/](#serverservices)
  - [server/tests/](#servertests)
- [Key Integration Points](#key-integration-points)
- [Areas Requiring Special Attention](#areas-requiring-special-attention)

## Related Documentation
- [Architecture Overview](../core/architecture.md)
- [Firebase Integration Architecture](../firebase/integration-architecture.md)

## Overall Architecture

The application has transitioned from a client-server architecture heavily reliant on an Express.js backend to one where the client interacts directly with Firebase as a backend-as-a-service (BaaS) for core data operations (authentication, database, and storage). The Express.js backend's role is now reduced, primarily handling tasks not yet migrated or those requiring trusted server-side execution (e.g., document processing orchestration, reporting).

*   **Frontend (client/):** A React application, responsible for the user interface, user interactions, and direct communication with Firebase Authentication, Firestore, and Storage services using the Firebase SDK. It also communicates with the reduced backend API for specific tasks.
*   **Backend (server/):** An Express.js server with a reduced scope. It handles API requests for tasks not migrated to direct Firebase client integration (e.g., document processing orchestration, reporting, potentially other legacy endpoints). It may still interact with Firebase Admin SDK for privileged operations or external services.
*   **Firebase:** Provides core services directly consumed by the frontend:
    *   **Authentication:** Manages user accounts and authentication state via client-side SDK.
    *   **Firestore:** A NoSQL cloud database for storing structured data (receipts, users, etc.), accessed directly by the client, with access controlled by security rules.
    *   **Storage:** Stores user-uploaded files (receipt images, profile pictures), accessed directly by the client, with access controlled by security rules.
    *   **Functions (functions/):** Serverless functions for triggering backend code in response to Firebase events or HTTP requests (currently minimal implementation).
*   **Security Rules (firestore.rules, storage.rules):** Crucial for enforcing data access control and validation directly within Firebase, as the client has direct access.
*   **Testing (rules-test/, server/tests/, client/tests/):** Includes unit tests for Firebase security rules, backend logic, and client-side integration tests.

## Directory Structure

```
.
├── .firebaserc
├── .github/
├── .gitignore
├── analysis/
├── client/
│   ├── .env.development
│   ├── .env.production
│   ├── .env.template
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── assets/
│   ├── babel.config.js
│   ├── build/
│   ├── extra/
│   ├── jest.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   ├── scripts/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── core/
│   │   ├── design-system/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── locales/
│   │   ├── shared/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   ├── tailwind.config.js
│   ├── tests/
│   ├── tsconfig.json
│   └── webpack.config.js
├── CONTRIBUTING.md
├── docs/
│   ├── analysis/
│   ├── archive/
│   ├── developer/
│   ├── firebase-integration-checklist.md
│   ├── firebase-testing-guide.md
│   ├── firebase-testing.md
│   ├── known-issues.md
│   ├── maintenance/
│   ├── manual-security-rules-testing.md
│   ├── migration/
│   ├── project-structure.md
│   ├── README.md
│   ├── testing/
│   └── user/
├── emulator-data/
├── extra/
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── functions/
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
├── LICENSE
├── migration_docs/
│   └── migration_log.md
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── receipt-scanner-next/
│   ├── .env.local
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── migration_docs/
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public/
│   ├── README.md
│   ├── receipt-scanner-next-minimal/
│   ├── src/
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── utils/
├── rules-test/
│   ├── firestore-debug.log
│   ├── package-lock.json
│   ├── package.json
│   └── test-rules.js
├── scripts/
│   ├── a11y-test.js
│   ├── code-example-validator.js
│   ├── cross-reference-validator.js
│   ├── final-validation.js
│   ├── generate-doc-health-metrics.js
│   ├── generate-doc-status-report.js
│   ├── generate-doc-template.js
│   ├── link-validator.js
│   ├── migrate-button-imports.js
│   ├── migrate-charts.js
│   ├── performance-benchmark.js
│   ├── template-conformance-checker.js
│   ├── test-security-rules.js
│   └── verify-env.js
├── server/
│   ├── .env
│   ├── .env.production
│   ├── .env.template
│   ├── admin-sdk-test.js
│   ├── combined.log
│   ├── config/
│   ├── dist/
│   ├── error.log
│   ├── esm-security-test.js
│   ├── extra/
│   ├── firestore-debug.log
│   ├── firestore.rules
│   ├── jest.config.js
│   ├── jest.setup.js
│   ├── manual-security-rules-testing.js
│   ├── minimal-test.js
│   ├── nodemon.json
│   ├── package-lock.json
│   ├── package.json
│   ├── run-security-tests.js
│   ├── run-simplified-test.js
│   ├── run-tests.js
│   ├── seed-all.js
│   ├── seed-auth.cjs
│   ├── seed-firestore.cjs
│   ├── simple-connection-test.cjs
│   ├── simple-security-test.cjs
│   ├── src/
│   ├── test-emulator-connection.js
│   ├── tests/
│   ├── tsconfig.json
│   └── verify-seeding.js
└── TESTING.md
```

## Key Integration Points

The primary integration points are where the frontend interacts with Firebase services and the reduced backend API.

*   **Frontend to Firebase:** Direct SDK calls for Authentication, Firestore (CRUD operations on documents and collections), and Storage (uploading and retrieving files).
*   **Frontend to Backend API:** HTTP requests to the Express.js server for specific endpoints (e.g., `/api/process-document`, `/api/reports`).
*   **Backend to Firebase Admin SDK:** Server-side interactions for privileged operations (e.g., user management, data seeding, complex queries not suitable for client-side).
*   **Firebase Functions:** Triggered by Firebase events (e.g., new document in Firestore) or HTTP requests, interacting with Firebase services or external APIs.
*   **Security Rules:** Act as a crucial layer of access control and validation for all direct client-to-Firebase interactions.

## Areas Requiring Special Attention

*   **Firebase Security Rules:** Due to direct client access to Firestore and Storage, robust and comprehensive security rules are paramount to prevent unauthorized data access or modification.
*   **Error Handling:** Implementing consistent and informative error handling across the frontend and backend, especially for Firebase interactions and API calls.
*   **Performance Optimization:** Monitoring and optimizing performance for both client-side operations (especially data fetching from Firestore) and backend API calls.
*   **Migration Status:** Clearly documenting which functionalities have been migrated to direct Firebase client integration and which still rely on the backend API.
*   **Testing Coverage:** Ensuring adequate test coverage for Firebase security rules, client-side logic interacting with Firebase, and remaining backend API endpoints.
*   **Documentation Accuracy:** Keeping the project structure and architecture documentation updated with the evolving codebase.
