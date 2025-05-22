# Known Issues and Resolutions

## Firebase Security Rules Testing Issues

### Issue: File Path Resolution for Rules Files

**Problem:** Tests fail with error: `ENOENT: no such file or directory, open '...\server\tests\firestore.rules'`

**Cause:** The security rules tests were looking for the rules files in the wrong location.

**Resolution:**
- Updated `server/tests/security/helpers/setup.js` to use relative paths that correctly point to the rule files in the project root
- Added null check for testEnv before calling cleanup()
- Fixed the test script to use `npm --prefix` instead of `cd server; npm run...` when running in the Firebase emulator exec context

**Verification:**
Run the following command from the project root to verify the fix:
```bash
node scripts/test-security-rules.js
```

### Issue: Command Execution in Firebase Emulators

**Problem:** When running `firebase emulators:exec`, commands with semicolons (`cd server; npm run test`) fail on Windows

**Cause:** Command chaining works differently across operating systems, and the Firebase emulator exec runs in a new shell context

**Resolution:**

- Updated `scripts/test-security-rules.js` to use `npm --prefix server run test:firestore` instead of changing directories
- This approach works consistently across platforms

**Verification:**
The automated test command should now work on both Windows and Unix-based systems:
```bash
npm run test:security:automated
```

### Issue: Helper Functions Undefined

**Problem:** Error: `ReferenceError: createDummyCategoryItem is not defined`

**Cause:** Missing helper functions in one of the helper files

**Resolution:**

- Added the missing helper functions to `server/tests/security/helpers/data.js`
- Updated `server/tests/security/helpers/setup.js` to include the function implementations
- Corrected imports in test files

**Verification:**
Run the simplified test to verify the fix:
```bash
cd server
npm test -- tests/security/simplified-firestore.test.js
```

## Client-Side Testing Environment Issues

This section details the issues encountered and addressed while attempting to fix the client-side testing environment for the Receipt Scanner application, specifically to unblock testing of the Firebase direct integration in Task FE-1.

### Issue: Browser API Mocking

**Problem:** Tests failed with `ReferenceError: indexedDB is not defined` and similar errors because Jest's default environment (`jsdom`) does not include all browser APIs.

**Actions Taken:**
- Created the `client/src/__mocks__` directory to house mock files.
- Created `client/src/__mocks__/browserMocks.js` with mock implementations for `indexedDB`, `localStorage`, `sessionStorage`, `fetch`, `URL`, and `FileReader`.
- Updated `client/src/setupTests.js` to import `browserMocks.js`.

**Current Status:** Mocking for basic browser APIs seems to be resolving the initial `ReferenceError` issues.

### Issue: Firebase SDK Mocking

**Problem:** Tests failed with `TypeError: (0 , _firestore.getFirestore) is not a function` and similar errors, indicating the Firebase SDK was not properly mocked or its functions were not accessible in the test environment.

**Actions Taken:**
- Created `client/src/__mocks__/firebaseMocks.js` with comprehensive mocks for Firebase Auth, Firestore, and Storage functions and chained methods.
- Updated `client/src/setupTests.js` to mock the `firebase/app`, `firebase/auth`, `firebase/firestore`, and `firebase/storage` modules using the `firebaseMocks.js` file.
- Updated `firebaseMocks.js` to include a mock for `enableIndexedDbPersistence` and to ensure Auth methods are mocked within the object returned by `getAuth()`.
- Updated test files (`authService.test.js`, `inventoryService.test.js`, `receipts.test.js`, `receiptManagement.integration.test.js`) to directly import necessary Firebase functions from the mocked module or the mock file itself and clear their mocks in `beforeEach`.

**Current Status:** While some Firebase-related errors have changed, issues persist in several test files (`authService.test.js`, `inventoryService.test.js`, `receipts.test.js`, `receiptManagement.integration.test.js`) related to accessing Firebase functions or clearing their mocks. This suggests potential issues with how Jest applies the mocks or how the functions are imported/used in the service files.

### Issue: Feature Flag System Testing

**Problem:** Tests failed with `TypeError: (0 , _featureFlags.startPerformanceTimer) is not a function` and `TypeError: Cannot read properties of undefined (reading 'mockClear')` on feature flag related functions.

**Actions Taken:**
- Created `client/src/__mocks__/featureFlagsMocks.js` to mock the feature flag utilities.
- Updated `client/src/setupTests.js` to mock the `@/core/config/featureFlags` module.
- Updated `featureFlagsMocks.js` to include mocks for `loadFeatureFlags`, `saveFeatureFlags`, and `stopPerformanceTimer`.
- Updated `client/src/core/config/__tests__/featureFlags.test.js` and other test files to directly import feature flag functions and clear their mocks.

**Current Status:** The specific `mockClear` errors related to feature flags in `featureFlags.test.js` seem resolved. However, potential issues might still exist in other files if the feature flag module is used differently or if there are underlying module resolution problems.

### Issue: Utility Function Mocking/Availability

**Problem:** Tests failed with `ReferenceError: preprocessImage is not defined`.

**Actions Taken:**
- Added a global mock for `preprocessImage` in `client/src/features/documents/__tests__/documentProcessingService.test.js` as a temporary measure based on the original task's suggestion.

**Current Status:** This specific `ReferenceError` might be resolved by the temporary mock, but a more robust solution might involve properly mocking the module where `preprocessImage` is defined if it's a shared utility.

### Issue: Module Resolution Issues

**Problem:** Tests failed with `TypeError: Cannot find module '../Button.tsx'` and `Could not locate module @/components/Button.tsx` for the Button component, and `Could not locate module @/services/api/receipts` for API services.

**Actions Taken:**
- Updated `client/jest.config.js` with `moduleNameMapper` entries for path aliases (`^@/(.*)$`) and attempted specific mappings for `.tsx` files and API services.
- Updated `client/src/components/__tests__/Button.test.js` to use both the `@/` alias and later a relative path (`../Button.tsx`) for the Button component import, and explicitly mocked the component.
- Added a specific mapping for `@/services/api/(.*)` in `client/jest.config.js`.

**Current Status:** Module resolution issues persist for the Button component and API services, indicating that the current `jest.config.js` configuration or the interaction between path mapping and mocking is not correctly set up for these modules.

### Issue: General Test Environment Configuration

**Problem:** Persistent errors across multiple test files related to accessing mocked functions or clearing mocks, suggesting a broader configuration or compatibility issue with Jest, the test environment (`jsdom`), or the mocking setup in `setupTests.js`.

**Actions Taken:**
- Implemented iterative debugging, analyzing error messages after each test run to guide subsequent changes.
- Adjusted mock definitions and import styles in various test files and mock files based on observed errors.
- Explicitly imported mocks in some test files as a troubleshooting step.
- Updated the `jest.mock` call for `indexedDbCache` in `analyticsService.test.js` to define the mock inline.
- Provided an explicit factory function for the `inventoryService` mock.

**Current Status:** While some specific errors have been addressed, fundamental issues with mock application and clearing, as well as module resolution, remain. The test environment is not yet stable, and many tests are still failing.

**Summary of Learnings:**

The process of fixing the client-side testing environment has highlighted the complexity of Jest configuration and mocking in this project. Key learnings include:
- The importance of adapting commands to the specific shell environment (PowerShell vs. Bash).
- The need for careful analysis of Jest error messages to diagnose underlying issues.
- The challenges of correctly mocking modules with various export patterns (default, named exports) and instances with methods.
- The potential for conflicts or unexpected behavior when combining different Jest features like `setupFilesAfterEnv`, `moduleNameMapper`, and `jest.mock`.
- The difficulty in resolving module paths, especially for non-`.js` files like `.tsx` and potentially nested service directories, within the Jest configuration.

**Unresolved Issues Requiring Further Investigation:**

- Persistent module resolution errors for specific modules (`Button.tsx`, `@/services/api/receipts`).
- Errors related to accessing or clearing mocks in several test files (`authService.test.js`, `inventoryService.test.js`, `receipts.test.js`, `receiptManagement.integration.test.js`), suggesting issues with mock application or test file structure.
- The `ReferenceError: axios is not defined` in `analyticsService.test.js`.

The testing environment is not yet fully functional, and further focused effort is needed to resolve the remaining configuration and mocking issues before testing of Task FE-1 can be fully completed.
