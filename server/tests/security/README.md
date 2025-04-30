# Firebase Security Rules Tests

This directory contains test scripts for validating the Firestore and Firebase Storage security rules using the Firebase Emulator Suite.

## Prerequisites

*   Node.js (v16+)
*   npm or yarn
*   Firebase CLI (`npm install -g firebase-tools`)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ilia-K-dev/r.s-app.git
    cd receipt-scanner
    ```
2.  **Install dependencies:**
    ```bash
    cd server
    npm install
    ```
3.  **Ensure Firebase project is set up:** Make sure your local Firebase project is configured. You can link your project using `firebase use --add`.
4.  **Ensure `firestore.rules` and `storage.rules` are in the root of the `server` directory.**

## Running the Tests

1.  **Start the Firebase Emulators:**
    Open your terminal in the `server` directory and run:
    ```bash
    firebase emulators:start --only firestore,storage
    ```
    Keep this terminal window open while running the tests.

2.  **Run the Test Scripts:**
    Open a **new** terminal window in the `server` directory.

    *   **Run all security tests:**
        ```bash
        npm test security
        ```
        (This assumes you have a test script configured in `package.json` like `"test:security": "mocha tests/security/**/*.test.js"`)

    *   **Run only Firestore security tests:**
        ```bash
        npm test firestore-security
        ```
        (This assumes a script like `"test:firestore-security": "mocha tests/security/firestore.test.js"`)

    *   **Run only Storage security tests:**
        ```bash
        npm test storage-security
        ```
        (This assumes a script like `"test:storage-security": "mocha tests/security/storage.test.js"`)

## Test Scenarios

The test scripts cover the following scenarios based on the `updated-security-rules.md` document:

### Firestore Rules (`firestore.test.js`)

*   Authentication Tests:
    *   Deny read access to unauthenticated users for all user-specific collections.
    *   Deny write access (create, update, delete) to unauthenticated users for all user-specific collections.
*   Data Ownership Tests:
    *   Allow authenticated users to read their own data across various collections.
    *   Allow authenticated users to write (create, update, delete) their own data across various collections.
    *   Deny authenticated users from reading other users' data.
    *   Deny authenticated users from writing other users' data.
*   Validation Tests:
    *   Deny creating documents with missing required fields (e.g., in 'products').
    *   Deny updating documents with invalid data (e.g., negative stock).
*   Immutable Fields:
    *   Deny changing the `userId` field of a document after creation.
*   Server-Only Writes:
    *   Deny client write access to collections intended for server-only writes (e.g., 'alerts').

### Storage Rules (`storage.test.js`)

*   Authentication Tests:
    *   Deny read access to unauthenticated users for user file paths.
    *   Deny write access to unauthenticated users for user file paths.
*   Data Ownership Tests:
    *   Allow authenticated users to read their own files.
    *   Allow authenticated users to write their own files.
    *   Allow authenticated users to delete their own files.
    *   Deny authenticated users from reading other users' files.
    *   Deny authenticated users from writing other users' files.
    *   Deny authenticated users from deleting other users' files.
*   Validation Tests:
    *   Deny uploading files larger than the allowed size limit.
    *   Deny uploading files with disallowed content types.

Ensure the tests pass after any modifications to the `firestore.rules` or `storage.rules` files.
