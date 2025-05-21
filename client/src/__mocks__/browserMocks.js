class MockStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }
}

// Mock localStorage and sessionStorage
global.localStorage = new MockStorage();
global.sessionStorage = new MockStorage();

// Mock indexedDB
const indexedDB = {
  open: jest.fn().mockReturnValue({
    onupgradeneeded: jest.fn(),
    onsuccess: jest.fn(),
    onerror: jest.fn(),
    result: {
      transaction: jest.fn().mockReturnValue({
        objectStore: jest.fn().mockReturnValue({
          put: jest.fn(),
          get: jest.fn(),
          getAll: jest.fn(),
          delete: jest.fn(),
          clear: jest.fn()
        })
      }),
      createObjectStore: jest.fn(),
      deleteObjectStore: jest.fn(),
      close: jest.fn()
    }
  })
};

global.indexedDB = indexedDB;

// Mock other browser APIs as needed
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true
  })
);

global.URL = {
  createObjectURL: jest.fn(),
  revokeObjectURL: jest.fn()
};

global.FileReader = class {
  constructor() {
    this.onload = jest.fn();
    this.onerror = jest.fn();
  }

  readAsDataURL() {
    setTimeout(() => this.onload({ target: { result: 'data:image/png;base64,mockImageData' } }), 0);
  }

  readAsText() {
    setTimeout(() => this.onload({ target: { result: 'mock text content' } }), 0);
  }
};
