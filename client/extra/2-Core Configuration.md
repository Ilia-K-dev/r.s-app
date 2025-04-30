# Core Configuration Analysis

This document analyzes the core configuration files for the Receipt Scanner application, covering both client and server setups.

## Client-Side Configuration

### 1. `client/src/core/config/api.config.js`

*   **Purpose & Role:** Configures the Axios instance used for making API calls from the client to the server. Defines base URL, timeout, default headers, and specific API endpoints. Implements request and response interceptors.
*   **Key Patterns:**
    *   Centralized API configuration object (`API_CONFIG`).
    *   Environment variables (`process.env.REACT_APP_API_URL`, `process.env.REACT_APP_API_TIMEOUT`) for base URL and timeout, with local defaults.
    *   Structured endpoint definitions.
    *   Axios interceptors for common tasks:
        *   **Request Interceptor:** Attaches the Firebase Auth ID token (`Bearer ${token}`) to outgoing requests if a user is logged in.
        *   **Response Interceptor:** Handles common HTTP error statuses (401, 403, 404, 422, 429, 500), attempts token refresh on 401, and throws standardized errors. It also extracts `response.data` on success.
*   **Environment Settings:** `REACT_APP_API_URL` (Server base URL), `REACT_APP_API_TIMEOUT` (Request timeout). Defaults to `http://localhost:5000` and `30000ms`.
*   **Security:**
    *   Automatically attaches JWT tokens for authenticated requests.
    *   Handles 401 errors by attempting token refresh and redirecting to login on failure.
    *   Uses environment variables for sensitive URLs (though the default is localhost).
*   **Dependencies & Init:** Depends on `axios` and the client-side Firebase auth instance (`./firebase`). Initializes a single Axios instance (`api`) for reuse.
*   **Potential Improvements/Issues:**
    *   Consider abstracting the token refresh logic further, perhaps into the `AuthContext`.
    *   Error messages thrown in the response interceptor are generic; could potentially pass through more specific messages from the server if available and safe.
    *   The import `import { auth } from './firebase';` suggests the Firebase config might be better placed directly in the `config` directory (e.g., `client/src/core/config/firebase.js`), which it seems to be based on later file reads.

### 2. `client/src/core/config/constants.js`

*   **Purpose & Role:** Defines application-wide constants for various features and UI elements, promoting consistency and maintainability.
*   **Key Patterns:** Exports multiple constant objects grouped by domain (`APP_CONFIG`, `AUTH_CONFIG`, `RECEIPT_CONFIG`, `REPORT_CONFIG`, `CATEGORIES`, `DATE_RANGES`, `ERROR_MESSAGES`, `ROUTES`, `UI_CONFIG`).
*   **Environment Settings:** None directly, but values might influence behavior based on environment (e.g., file size limits).
*   **Security:** Defines `minPasswordLength` and `maxLoginAttempts`, which are relevant to security policy enforcement (likely validated server-side too).
*   **Dependencies & Init:** No external dependencies. Simply exports constant values.
*   **Potential Improvements/Issues:**
    *   `CATEGORIES` are hardcoded; might be better fetched from the server if they need to be dynamic or user-configurable.
    *   Ensure constants like `maxFileSize` are consistently enforced on both client and server.

### 3. `client/src/index.js`

*   **Purpose & Role:** The main entry point for the client application, specifically configured for Expo (React Native).
*   **Key Patterns:** Uses `expo`'s `registerRootComponent` to bootstrap the React application (`App`).
*   **Environment Settings:** Implicitly handles Expo environment setup (Expo Go vs. native build).
*   **Security:** No direct security configurations here.
*   **Dependencies & Init:** Depends on `expo` and the root `App` component (`./App`).
*   **Potential Improvements/Issues:** This setup is specific to Expo. If deploying as a standard web app without Expo, the entry point would typically use `ReactDOM.createRoot`.

### 4. `client/src/App.js`

*   **Purpose & Role:** The root component of the React application. Sets up global context providers and the main router. Initializes the Firebase client SDK.
*   **Key Patterns:**
    *   Wraps the application in `AuthProvider` and `ToastProvider` to make auth state/functions and toast notifications available globally.
    *   Uses `react-router-dom`'s `RouterProvider` to handle client-side routing.
    *   Initializes Firebase using `initializeApp` from `firebase/app` and configuration from `./core/config/firebase`.
*   **Environment Settings:** Relies on Firebase configuration, which uses environment variables.
*   **Security:** Relies on `AuthProvider` for managing authentication state.
*   **Dependencies & Init:** Depends on `React`, `react-router-dom`, `firebase/app`, context providers (`AuthContext`, `ToastContext`), the router configuration (`./routes`), and Firebase config (`./core/config/firebase`). Firebase is initialized here at the app's root.
*   **Potential Improvements/Issues:** Initialization order seems correct (Firebase init before providers that might use it).

### 5. `client/src/core/config/firebase.js`

*   **Purpose & Role:** Initializes the Firebase client-side SDK and exports instances of Firebase services (Auth, Firestore, Storage).
*   **Key Patterns:**
    *   Reads Firebase configuration keys from environment variables (`REACT_APP_FIREBASE_*`).
    *   Uses `initializeApp` to configure the Firebase app instance.
    *   Uses `getAuth`, `getFirestore`, `getStorage` to get service instances linked to the initialized app.
    *   Exports individual services (`auth`, `db`, `storage`) and the main `app` instance.
*   **Environment Settings:** Heavily relies on `REACT_APP_FIREBASE_*` environment variables for configuration. **Crucially, these must be set correctly in the client's build environment.**
*   **Security:** API keys for client-side Firebase are generally considered public, but security relies on Firebase Security Rules (Firestore, Storage) and server-side validation for Auth. **It's vital that `.env` files containing these keys are not committed to version control.**
*   **Dependencies & Init:** Depends on `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage`. Initializes Firebase services upon module load.
*   **Potential Improvements/Issues:** Ensure `.env` files are properly managed and excluded from Git. Consider adding basic checks to ensure environment variables are present during initialization, logging a warning if not.

## Server-Side Configuration

### 1. `server/src/app.js`

*   **Purpose & Role:** The main entry point and configuration hub for the Express.js backend server. Sets up middleware, defines routes, configures logging, initializes Firebase Admin SDK (via import), and starts the server.
*   **Key Patterns:**
    *   Loads environment variables using `dotenv`.
    *   Uses common Express middleware: `cors`, `helmet` (security), `morgan` (request logging), `express.json`, `express.urlencoded` (body parsing), `express-rate-limit` (basic DDOS protection).
    *   Configures Winston for logging to console (dev) and files (`error.log`, `combined.log`) with rotation.
    *   Imports and mounts modular route handlers (`authRoutes`, `receiptRoutes`, etc.).
    *   Includes basic (`/`) and enhanced (`/health`) health check endpoints. The enhanced check verifies Firebase connectivity.
    *   Implements centralized error handling middleware, including specific handling for `MulterError` and a final catch-all handler.
    *   Includes graceful shutdown logic (`SIGTERM`) and handlers for `unhandledRejection` and `uncaughtException`.
    *   Uses `module-alias` for cleaner import paths.
    *   Includes a script (`checkEnv`) to validate environment variables on startup.
    *   Validates route modules before mounting them.
    *   Conditionally applies authentication middleware (`authenticateUser`) based on route configuration and environment (`NODE_ENV !== 'test'`).
*   **Environment Settings:** `NODE_ENV`, `PORT`, `LOG_LEVEL`, `FRONTEND_URL`, `FIREBASE_PROJECT_ID`. Uses `dotenv` to load others.
*   **Security:**
    *   `helmet` applies various security headers.
    *   `cors` is configured to allow requests only from the specified `FRONTEND_URL`.
    *   `express-rate-limit` provides basic protection against brute-force/DoS attacks.
    *   Authentication middleware (`authenticateUser`) protects specific routes.
    *   Environment variables store sensitive information (Firebase credentials, potentially API keys).
    *   Error handling avoids leaking stack traces in production.
    *   Input validation likely occurs within route handlers/services (not directly visible here).
*   **Dependencies & Init:** Depends on `express`, `cors`, `helmet`, `morgan`, `express-rate-limit`, `winston`, `dotenv`, `module-alias`, `multer`, Firebase Admin SDK (`../config/firebase`), route modules, and middleware modules. Initializes the Express app, configures middleware, mounts routes, and starts the listener.
*   **Potential Improvements/Issues:**
    *   The `checkEnv` script is crucial but its content isn't visible here; ensure it covers all necessary variables.
    *   Rate limiting is basic; more sophisticated strategies might be needed for production.
    *   CORS origin could be more dynamic if multiple frontends are expected.
    *   Consider more structured logging (e.g., JSON format for file transports) for easier parsing. (Update: It *is* using JSON format for file transports, which is good).
    *   The route validation logic is good practice.

### 2. `server/config/firebase.js`

*   **Purpose & Role:** Initializes the Firebase Admin SDK for server-side use, providing access to backend Firebase services (Firestore, Auth, Storage). Includes robust error handling and diagnostics.
*   **Key Patterns:**
    *   Loads environment variables via `dotenv`.
    *   Strict validation check for required Firebase environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`).
    *   Correctly formats the `FIREBASE_PRIVATE_KEY` by replacing escaped newlines (`\\n`).
    *   Uses `admin.credential.cert` with environment variables to authenticate.
    *   Prevents multiple initializations (`admin.apps.length > 0`).
    *   Centralized service creation (`createFirebaseServices`) returning `admin`, `db`, `auth`, `storage`.
    *   Includes detailed error logging (`logDetailedError`) and diagnostic information on failure.
    *   Exports the initialized services within an immediately invoked function expression (IIFE) to handle potential initialization errors gracefully (returning a mock object on failure).
*   **Environment Settings:** `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_DATABASE_URL` (optional). **These are highly sensitive and must be securely managed.**
*   **Security:**
    *   Uses service account credentials (via environment variables) for privileged backend access. **Protecting these variables is paramount.** Do not commit them to Git. Use a secure secret management solution for production.
    *   The code explicitly checks for the presence of required variables.
*   **Dependencies & Init:** Depends on `firebase-admin`, `path`, `dotenv`, `fs`. Initializes the Admin SDK when the module is loaded.
*   **Potential Improvements/Issues:**
    *   The use of environment variables directly for credentials is common but consider loading from a file path specified by an environment variable (`GOOGLE_APPLICATION_CREDENTIALS`) for better compatibility with Google Cloud environments, although the current method works.
    *   The fallback mock object on initialization failure is a decent strategy to prevent crashing the entire app import process, but downstream services need to handle the `error: true` state.

### 3. `server/src/middleware/upload.js` (Multer Config)

*   **Purpose & Role:** Configures Multer middleware for handling file uploads, specifically images in this case. Defines storage strategy, file filtering, and size limits.
*   **Key Patterns:**
    *   Uses `multer.memoryStorage()` to store uploaded files temporarily in memory as Buffers (suitable if files are immediately processed/uploaded elsewhere, e.g., to Firebase Storage).
    *   `fileFilter` restricts uploads to image MIME types (`image/*`).
    *   Sets a `fileSize` limit (5MB).
    *   Exports the configured `upload` middleware instance and a dedicated error handler (`handleMulterError`) for Multer-specific errors (like `LIMIT_FILE_SIZE`).
*   **Environment Settings:** File size limit is hardcoded but could be made configurable via environment variables if needed.
*   **Security:**
    *   File type filtering prevents uploading potentially malicious non-image files.
    *   Size limit prevents DoS attacks via excessively large uploads.
    *   Using memory storage avoids saving potentially harmful files directly to the server's disk before validation/processing.
*   **Dependencies & Init:** Depends on `multer` and a custom `AppError` utility. Exports configured middleware.
*   **Potential Improvements/Issues:**
    *   Memory storage can consume significant RAM under heavy load with large files. If processing/uploading to final storage is slow, consider `diskStorage` with careful cleanup or streaming directly to the destination (e.g., Firebase Storage).

### 4. `server/config/vision.js`

*   **Purpose & Role:** Initializes the Google Cloud Vision API client (`@google-cloud/vision`).
*   **Key Patterns:** Creates an `ImageAnnotatorClient` instance, authenticating using credentials specified by the `GOOGLE_APPLICATION_CREDENTIALS` environment variable (which should point to a service account key file).
*   **Environment Settings:** `GOOGLE_APPLICATION_CREDENTIALS` (path to the service account key JSON file).
*   **Security:** Relies on Google Cloud IAM and service account credentials for secure API access. The service account key file is highly sensitive and must be protected.
*   **Dependencies & Init:** Depends on `@google-cloud/vision`, `path`, `dotenv`, and `AppError`. Initializes the client upon module load.
*   **Potential Improvements/Issues:** Ensure the service account has the necessary permissions for the Vision API. Error handling for client initialization failure could be added, similar to the Firebase Admin setup.

### 5. `server/config/multer-config.js` (Duplicate Server Setup?)

*   **Purpose & Role:** This file appears to be a **duplicate or alternative/old version** of the main server setup (`server/src/app.js`). It imports routes, sets up middleware (Helmet, CORS, Morgan, body-parser), defines a root route, mounts API routes, and includes error handling. It incorrectly imports itself (`handleMulterError`) and seems to be missing significant parts of the main `app.js` configuration (like Firebase init, logging, rate limiting, proper error handling structure).
*   **Key Patterns:** Basic Express setup.
*   **Environment Settings:** Reads `PORT` and `NODE_ENV`.
*   **Security:** Basic middleware (`helmet`, `cors`).
*   **Dependencies & Init:** Imports `express`, `cors`, `helmet`, `morgan`, some routes, and itself (incorrectly).
*   **Potential Improvements/Issues:** **This file should likely be removed or refactored.** It causes confusion and duplicates server setup logic found in `server/src/app.js`. It doesn't actually configure Multer as its name suggests. The actual Multer config is in `server/src/middleware/upload.js`.

## Root Firebase Configuration

### 1. `.firebaserc`

*   **Purpose & Role:** Configures the Firebase CLI, linking the local project directory to a specific Firebase project on the cloud.
*   **Key Patterns:** Simple JSON mapping a local alias (`default`) to the Firebase project ID (`project-reciept-reader-id`).
*   **Environment Settings:** Specifies the target Firebase project.
*   **Security:** Not directly sensitive, but ensures CLI commands target the correct project.
*   **Dependencies & Init:** Used by the Firebase CLI tool.
*   **Potential Improvements/Issues:** Standard configuration file.

### 2. `firebase.json`

*   **Purpose & Role:** The main configuration file for Firebase services deployment using the Firebase CLI. Defines settings for Firestore, Functions, Hosting, and Storage. Also configures local emulators.
*   **Key Patterns:** JSON structure defining deployment targets and rules:
    *   `firestore`: Points to rule (`firestore.rules`) and index (`firestore.indexes.json`) files.
    *   `functions`: Specifies the source directory (`functions`) for Cloud Functions.
    *   `hosting`: Configures the public directory (`build` - likely for the client app build output), files to ignore during deployment, and rewrites (directing all paths to `index.html` for SPA routing).
    *   `storage`: Points to the storage security rules file (`storage.rules`).
    *   `emulators`: Configures ports for local emulation of Auth, Functions, Firestore, Hosting, and Storage, enabling the Emulator UI.
*   **Environment Settings:** Defines deployment behavior and local emulator ports.
*   **Security:** Points to security rule files (`firestore.rules`, `storage.rules`) which are critical for securing data access. Hosting rewrites are important for SPAs but need careful consideration if certain paths should *not* be rewritten.
*   **Dependencies & Init:** Used by the Firebase CLI for deployment and the Emulator Suite.
*   **Potential Improvements/Issues:** The hosting `public` directory is set to `build`. This assumes the client build output goes there; ensure the client build process aligns with this. Emulator configuration is good for local development.

---

This analysis covers the core configuration files identified. It highlights their roles, patterns, security aspects, and potential areas for attention.
