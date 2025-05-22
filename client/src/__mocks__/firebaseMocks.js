// Firebase App mock
const firebaseApp = {
  name: 'mock-app',
  options: {},
  automaticDataCollectionEnabled: false
};

// Firebase Auth mocks
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  updateProfile: jest.fn(),
};

const mockAuthState = {
  currentUser: mockUser
};

const auth = {
  currentUser: mockUser,
  onAuthStateChanged: jest.fn(callback => {
    callback(mockUser);
    return jest.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),
};

// Firestore mocks
const mockDocSnapshot = {
  exists: jest.fn(() => true),
  data: jest.fn(() => ({ id: 'test-doc', userId: 'test-user-id' })),
  id: 'test-doc'
};

const mockQuerySnapshot = {
  docs: [mockDocSnapshot],
  empty: false,
  size: 1,
  forEach: jest.fn(callback => callback(mockDocSnapshot))
};

const mockDocRef = {
  get: jest.fn(() => Promise.resolve(mockDocSnapshot)),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
  collection: jest.fn(() => mockCollectionRef),
  onSnapshot: jest.fn(callback => {
    callback(mockDocSnapshot);
    return jest.fn(); // unsubscribe function
  })
};

const mockCollectionRef = {
  doc: jest.fn(() => mockDocRef),
  where: jest.fn(() => mockCollectionRef),
  orderBy: jest.fn(() => mockCollectionRef),
  limit: jest.fn(() => mockCollectionRef),
  startAfter: jest.fn(() => mockCollectionRef),
  get: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
  add: jest.fn(() => Promise.resolve(mockDocRef)),
  onSnapshot: jest.fn(callback => {
    callback(mockQuerySnapshot);
    return jest.fn(); // unsubscribe function
  })
};

const firestore = {
  collection: jest.fn(() => mockCollectionRef),
  doc: jest.fn(() => mockDocRef),
  batch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve())
  })),
  runTransaction: jest.fn(() => Promise.resolve()),
  enableIndexedDbPersistence: jest.fn(() => Promise.resolve())
};

// Storage mocks
const mockStorageRef = {
  put: jest.fn(() => Promise.resolve({
    ref: {
      getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/test-image.jpg'))
    }
  })),
  child: jest.fn(() => mockStorageRef),
  delete: jest.fn(() => Promise.resolve())
};

const storage = {
  ref: jest.fn(() => mockStorageRef)
};

// Export the mocks
const firebaseMocks = {
  // Firebase app
  initializeApp: jest.fn(() => firebaseApp),

  // Auth exports
  getAuth: jest.fn(() => auth),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
  createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: mockUser })),
  signOut: jest.fn(() => Promise.resolve()),
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()),
  updateProfile: jest.fn(() => Promise.resolve()),

  // Firestore exports
  getFirestore: jest.fn(() => firestore),
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
  startAfter: jest.fn(() => mockCollectionRef),
  onSnapshot: jest.fn(callback => {
    callback(mockQuerySnapshot);
    return jest.fn(); // unsubscribe function
  }),
  enableIndexedDbPersistence: jest.fn(() => Promise.resolve()),

  // Storage exports
  getStorage: jest.fn(() => storage),
  ref: jest.fn(() => mockStorageRef),
  uploadBytes: jest.fn(() => Promise.resolve({
    ref: mockStorageRef,
    metadata: {}
  })),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/test-image.jpg')),
  deleteObject: jest.fn(() => Promise.resolve()),

  // Error types
  FirebaseError: class FirebaseError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
      this.name = 'FirebaseError';
    }
  },

  // Direct object exports (for cases where the objects themselves are imported)
  auth,
  firestore,
  storage,
};

// Add properties to module.exports for CommonJS compatibility
Object.assign(module.exports, firebaseMocks);

// Also support named exports for ES modules
if (typeof module.exports === 'object') {
  module.exports.__esModule = true;

  // Explicitly add named exports for each function/object
  for (let key in firebaseMocks) {
    module.exports[key] = firebaseMocks[key];
  }
}
