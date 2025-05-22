/**
 * Test Helper Utility
 *
 * This file provides helper functions and common mocks for test files.
 * Import this directly in test files that need additional control over mocking.
 */

// -------- Helper Functions --------

/**
 * Mock a module with proper ESM compatibility
 */
const createMock = (mockExports) => {
  const mock = { ...mockExports };
  mock.__esModule = true;
  return mock;
};

/**
 * Create a mock service object with methods that return resolved promises
 */
const createMockService = (methodNames = []) => {
  const service = {};
  methodNames.forEach(methodName => {
    service[methodName] = jest.fn().mockResolvedValue({});
  });
  return service;
};

// -------- Common Mocks --------

// Auth mocks
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true
};

// Common Firestore mocks
const createFirestoreMocks = () => {
  const mockDocData = { id: 'test-doc', userId: 'test-user-id' };

  const mockDocSnapshot = {
    exists: jest.fn(() => true),
    data: jest.fn(() => mockDocData),
    id: 'test-doc'
  };

  const mockQuerySnapshot = {
    docs: [mockDocSnapshot],
    empty: false,
    size: 1,
    forEach: jest.fn(callback => callback(mockDocSnapshot))
  };

  const mockDocRef = {
    id: 'test-doc',
    get: jest.fn(() => Promise.resolve(mockDocSnapshot)),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve())
  };

  const mockCollectionRef = {
    doc: jest.fn(() => mockDocRef),
    where: jest.fn(() => mockCollectionRef),
    orderBy: jest.fn(() => mockCollectionRef),
    limit: jest.fn(() => mockCollectionRef),
    startAfter: jest.fn(() => mockCollectionRef),
    get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
    add: jest.fn(() => Promise.resolve(mockDocRef))
  };

  return {
    mockDocData,
    mockDocSnapshot,
    mockQuerySnapshot,
    mockDocRef,
    mockCollectionRef,
    // Common Firebase/Firestore functions
    collection: jest.fn(() => mockCollectionRef),
    doc: jest.fn(() => mockDocRef),
    getDoc: jest.fn(() => Promise.resolve(mockDocSnapshot)),
    getDocs: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
    addDoc: jest.fn(() => Promise.resolve(mockDocRef)),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => mockCollectionRef),
    where: jest.fn(() => mockCollectionRef),
    orderBy: jest.fn(() => mockCollectionRef),
    limit: jest.fn(() => mockCollectionRef),
    startAfter: jest.fn(() => mockCollectionRef)
  };
};

// Firebase storage mocks
const createStorageMocks = () => {
  const mockStorageRef = {
    put: jest.fn(() => Promise.resolve({
      ref: {
        getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/test-image.jpg'))
      }
    })),
    delete: jest.fn(() => Promise.resolve())
  };

  return {
    mockStorageRef,
    ref: jest.fn(() => mockStorageRef),
    uploadBytes: jest.fn(() => Promise.resolve({
      ref: mockStorageRef,
      metadata: {}
    })),
    getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/test-image.jpg')),
    deleteObject: jest.fn(() => Promise.resolve())
  };
};

// Feature flag mocks
const createFeatureFlagMocks = (enabledFlags = []) => {
  const isFeatureEnabled = jest.fn(flag => enabledFlags.includes(flag));
  const enableFeature = jest.fn();
  const disableFeature = jest.fn();
  const startPerformanceTimer = jest.fn();
  const stopPerformanceTimer = jest.fn();

  return {
    isFeatureEnabled,
    enableFeature,
    disableFeature,
    startPerformanceTimer,
    stopPerformanceTimer
  };
};

// Error handler mocks
const createErrorHandlerMocks = () => {
  return {
    handleError: jest.fn(error => error),
    handleFirebaseError: jest.fn((error, context) => error),
    handleGeneralError: jest.fn(error => error)
  };
};

// API mocks (axios-like)
const createApiMocks = () => {
  return {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    patch: jest.fn(() => Promise.resolve({ data: {} }))
  };
};

// -------- Export Utilities --------

module.exports = {
  createMock,
  createMockService,
  mockUser,
  createFirestoreMocks,
  createStorageMocks,
  createFeatureFlagMocks,
  createErrorHandlerMocks,
  createApiMocks
};
