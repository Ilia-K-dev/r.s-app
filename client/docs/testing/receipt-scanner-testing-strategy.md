Receipt Scanner Testing Strategy

This document outlines the testing strategy for the Receipt Scanner application, focusing on the Firebase integration in the main client implementation.

## Current Testing Status

The testing environment has encountered several issues that need to be resolved:

-   **Environment Setup Issues**: There appear to be configuration and dependency issues preventing tests from running properly
-   **Module Resolution Problems**: Issues with module imports and Babel configuration
-   **Firebase Emulator Connectivity**: Challenges connecting to Firebase emulators during testing
-   **Security Rules Testing**: Specific issues with testing Firebase security rules

## Testing Objectives

The testing strategy should address the following objectives:

-   **Validate Firebase Integration**: Ensure the direct Firebase SDK integration functions correctly
-   **Feature Toggle Testing**: Verify the feature toggle system works as expected
-   **Offline Capability**: Test the application's behavior in offline scenarios
-   **Security Rule Verification**: Confirm Firebase security rules protect data appropriately
-   **Integration Test Coverage**: Test key user flows that span multiple features

## Testing Levels

### Unit Testing

Unit tests should focus on individual services, hooks, and utilities:

1.  **Firebase Service Tests**

| Service             | Test File                                                | Test Focus                 |
| :------------------ | :------------------------------------------------------- | :------------------------- |
| Authentication      | `client/src/features/auth/__tests__/authService.test.js` | Firebase Auth operations   |
| Receipt Management  | `client/src/features/receipts/__tests__/receipts.test.js` | Firestore/Storage operations |
| Document Processing | `client/src/features/documents/__tests__/documentProcessingService.test.js` | Document handling operations |
| Inventory Management| `client/src/features/inventory/__tests__/inventoryService.test.js` | Inventory CRUD operations  |
| Analytics           | `client/src/features/analytics/__tests__/analyticsService.test.js` | Analytics data operations  |

2.  **Hook Tests**

These should test the React hooks that encapsulate Firebase service operations:

-   `useAuth.js`
-   `useReceipts.js`
-   `useDocumentProcessing.js`
-   `useInventory.js`
-   `useAnalytics.js`

3.  **Utility Tests**

Focus on utilities that support Firebase integration:

-   `featureFlags.js` - Feature toggle system
-   `errorHandler.js` - Firebase error handling
-   `indexedDbCache.js` - Offline caching
-   Calculation utilities (`calculators.js`, etc.)

### Integration Testing

Integration tests should focus on key user flows that involve multiple features:

| User Flow           | Test File                                                | Test Focus                                   |
| :------------------ | :------------------------------------------------------- | :------------------------------------------- |
| Authentication Flow | `client/tests/integration/authFlows.test.js`             | Login, registration, password recovery       |
| Receipt Management  | `client/tests/integration/receiptManagement.test.js`     | Creating, viewing, editing receipts          |
| Document Processing | `client/tests/integration/documentProcessingFlow.test.js`| Scanning, processing, extracting data        |
| Inventory Management| `client/tests/integration/inventoryManagement.test.js`   | Managing inventory items and stock           |
| Analytics Reporting | `client/tests/integration/analyticsReporting.test.js`    | Generating and viewing reports               |
| Feature Toggles     | `client/tests/integration/featureToggleFlows.test.js`    | Toggling features and fallback behavior      |

### Security Rules Testing

Tests for Firebase security rules should verify access control:

| Rule Set        | Test File                                            | Test Focus             |
| :-------------- | :--------------------------------------------------- | :--------------------- |
| Firestore Rules | `server/tests/security/firestore.test.js`            | Document access control|
| Storage Rules   | `server/tests/security/storage.test.js`              | File access control    |

## Testing Environment Setup

### Firebase Emulator Setup

1.  **Install Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Start Emulators**:
    ```bash
    firebase emulators:start
    ```
3.  **Seed Test Data**:
    ```bash
    npm run seed-data
    ```
4.  **Connect Tests to Emulators**:
    ```javascript
    // In test setup
    import { connectFirestoreEmulator } from 'firebase/firestore';
    import { connectAuthEmulator } from 'firebase/auth';
    import { connectStorageEmulator } from 'firebase/storage';

    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectStorageEmulator(storage, 'localhost', 9199);
    ```

### Jest Configuration

Update Jest configuration to handle module resolution issues:

```javascript
// In jest.config.js
module.exports = {
  preset: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|react-navigation|@react-navigation|firebase)'
  ],
  moduleNameMapper: {
    '^'(.*)$'': '<rootDir>/src/$1'
  },
  setupFiles: [
    '<rootDir>/tests/setup.js'
  ]
};
```

### Mock Setup

Create necessary mocks for Firebase services:

```javascript
// In tests/mocks/firebase.js
export const mockAuth = {
  currentUser: { uid: 'test-user-id' },
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn()
};

export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn()
};

export const mockStorage = {
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
  deleteObject: jest.fn()
};
```

## Testing Priorities

1.  **Fix Environment Issues**: Resolve configuration and dependency issues first
2.  **Unit Test Core Services**: Focus on the Firebase services that have been migrated
3.  **Security Rules Tests**: Validate data access security
4.  **Integration Test Key Flows**: Test end-to-end user flows
5.  **Offline Capability Tests**: Verify offline behavior and synchronization

## Test Data Management

Create consistent test data for use across tests:

```javascript
// In tests/fixtures/testData.js
export const testUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User'
};

export const testReceipt = {
  id: 'test-receipt-id',
  title: 'Grocery Receipt',
  merchant: 'Supermarket',
  date: new Date('2025-05-01'),
  total: 42.99,
  userId: 'test-user-id',
  items: [
    { name: 'Apples', price: 5.99 },
    { name: 'Bread', price: 3.50 }
  ]
};

// Add more test data for other features...
```

## Test Patterns for Firebase Integration

### Testing Firebase Authentication

```javascript
// Example test for authentication service
import { signIn } from '../services/authService';
import { mockAuth } from '../../tests/mocks/firebase';

jest.mock('firebase/auth', () => ({
  getAuth: () => mockAuth,
  signInWithEmailAndPassword: mockAuth.signInWithEmailAndPassword
}));

describe('Auth Service', () => {
  test('signIn - successful login', async () => {
    mockAuth.signInWithEmailAndPassword.mockResolvedValueOnce({
      user: { uid: 'test-user-id', email: 'test@example.com' }
    });

    const result = await signIn('test@example.com', 'password');

    expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth, 'test@example.com', 'password'
    );
    expect(result).toEqual({ uid: 'test-user-id', email: 'test@example.com' });
  });

  test('signIn - failed login', async () => {
    const error = { code: 'auth/wrong-password' };
    mockAuth.signInWithEmailAndPassword.mockRejectedValueOnce(error);

    await expect(signIn('test@example.com', 'wrong-password')).rejects.toThrow();
  });
});
```

### Testing Firestore Operations

```javascript
// Example test for receipt service
import { getReceipts } from '../services/receipts';
import { mockFirestore } from '../../tests/mocks/firebase';

jest.mock('firebase/firestore', () => ({
  collection: mockFirestore.collection,
  query: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  getDocs: mockFirestore.getDocs
}));

describe('Receipt Service', () => {
  test('getReceipts - returns user receipts', async () => {
    const mockQuerySnapshot = {
      docs: [
        {
          id: 'receipt1',
          data: () => ({ title: 'Receipt 1', total: 10.99, userId: 'test-user-id' })
        },
        {
          id: 'receipt2',
          data: () => ({ title: 'Receipt 2', total: 24.99, userId: 'test-user-id' })
        }
      ]
    };

    mockFirestore.collection.mockReturnValueOnce({ path: 'receipts' });
    mockFirestore.getDocs.mockResolvedValueOnce(mockQuerySnapshot);

    const result = await getReceipts();

    expect(result.receipts).toHaveLength(2);
    expect(result.receipts[0].id).toBe('receipt1');
    expect(result.receipts[1].title).toBe('Receipt 2');
  });
});
```

### Testing Feature Toggle System

```javascript
// Example test for feature toggle system
import { isFeatureEnabled, enableFeature, disableFeature } from '../config/featureFlags';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Feature Flags', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('isFeatureEnabled - returns false for disabled feature', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
      firebaseDirectIntegration: false
    }));

    expect(isFeatureEnabled('firebaseDirectIntegration')).toBe(false);
  });

  test('enableFeature - enables a feature', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
      firebaseDirectIntegration: false
    }));

    enableFeature('firebaseDirectIntegration');

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'featureFlags',
      JSON.stringify({ firebaseDirectIntegration: true })
    );
  });
});
```

### Integration Test Example

```javascript
// Example integration test for receipt management flow
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthContext } from '../../src/core/contexts/AuthContext';
import ReceiptListScreen from '../../src/features/receipts/pages/ReceiptListPage';
import { getReceipts } from '../../src/features/receipts/services/receipts';

// Mock the receipts service
jest.mock('../../src/features/receipts/services/receipts');

describe('Receipt Management Flow', () => {
  test('displays user receipts and allows filtering', async () => {
    // Mock authentication context
    const authValue = {
      user: { uid: 'test-user-id' },
      isAuthenticated: true
    };

    // Mock receipt service response
    getReceipts.mockResolvedValueOnce({
      receipts: [
        { id: 'r1', title: 'Grocery Shopping', total: 45.99, date: new Date('2025-05-01') },
        { id: 'r2', title: 'Restaurant', total: 85.00, date: new Date('2025-05-10') }
      ]
    });

    // Render component with authentication context
    const { getByText, getByPlaceholderText, queryByText } = render(
      <AuthContext.Provider value={authValue}>
        <ReceiptListScreen />
      </AuthContext.Provider>
    );

    // Verify receipts are displayed
    await waitFor(() => {
      expect(getByText('Grocery Shopping')).toBeTruthy();
      expect(getByText('$45.99')).toBeTruthy();
      expect(getByText('Restaurant')).toBeTruthy();
    });

    // Filter receipts
    const searchInput = getByPlaceholderText('Search receipts');
    fireEvent.changeText(searchInput, 'grocery');

    // Verify filtering works
    await waitFor(() => {
      expect(getByText('Grocery Shopping')).toBeTruthy();
      expect(queryByText('Restaurant')).toBeNull();
    });
  });
});
```

### Security Rules Testing Example

```javascript
// Example security rules test for Firestore
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-project-id',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Receipt security rules', () => {
  test('authenticated users can read their own receipts', async () => {
    const userId = 'user1';
    const db = testEnv.authenticatedContext(userId).firestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore()
        .collection('receipts')
        .doc('receipt1')
        .set({ title: 'My Receipt', userId });
    });

    const receiptRef = db.collection('receipts').doc('receipt1');
    await assertSucceeds(receiptRef.get());
  });

  test('users cannot read other users receipts', async () => {
    const userId = 'user1';
    const otherUserId = 'user2';
    const db = testEnv.authenticatedContext(otherUserId).firestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore()
        .collection('receipts')
        .doc('receipt1')
        .set({ title: 'My Receipt', userId });
    });

    const receiptRef = db.collection('receipts').doc('receipt1');
    await assertFails(receiptRef.get());
  });
});
```

## Test Automation Setup

### CI/CD Integration

Configure CI/CD pipelines to run tests automatically:

```yaml
# .github/workflows/test.yml example
name: Run Tests

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16.x'
      - name: Install dependencies
        run: npm ci
      - name: Start Firebase Emulators
        run: npx firebase emulators:start --project demo-project-id &
      - name: Wait for emulators
        run: sleep 10
      - name: Seed test data
        run: npm run seed-data
      - name: Run unit tests
        run: npm run test:unit
      - name: Run integration tests
        run: npm run test:integration
      - name: Run security rules tests
        run: npm run test:rules
```

### Test Scripts

Add these scripts to package.json:

```json
{
  "scripts": {
    "test": "jest --config=jest.config.js",
    "test:unit": "jest --config=jest.config.js --testPathIgnorePatterns=tests/integration",
    "test:integration": "jest --config=jest.config.js tests/integration",
    "test:rules": "firebase emulators:exec --only firestore,storage \"jest --config=jest.config.js server/tests/security\"",
    "seed-data": "node server/seed-all.js"
  }
}
```

## Conclusion

This testing strategy focuses on validating the Firebase integration in the main client implementation of the Receipt Scanner application. By addressing the current environment issues and implementing the recommended test patterns, we can ensure the application functions correctly with the direct Firebase SDK integration.
The prioritized approach allows for immediate focus on fixing environment issues and testing core services, followed by comprehensive integration testing and security validation. The strategy includes specific test patterns and examples for different aspects of Firebase integration, providing a clear roadmap for testing implementation.
Moving forward, tests should be implemented in parallel with feature development, following the principles of test-driven development where appropriate. By focusing on the main client implementation and addressing testing environment issues first, we can ensure a stable foundation for continued development of the Firebase integration.
