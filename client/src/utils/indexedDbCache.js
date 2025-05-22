// client/src/utils/indexedDbCache.js

const DB_NAME = 'analyticsCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'analyticsCache';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache duration

let db = null;

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = (event) => {
      reject('Error opening IndexedDB: ' + event.target.errorCode);
    };
  });
};

export const setCache = async (key, data) => {
  if (!db) {
    db = await openDatabase();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const timestamp = Date.now();
    const putRequest = store.put({ key, data, timestamp });

    putRequest.onsuccess = () => {
      resolve();
    };

    putRequest.onerror = (event) => {
      reject('Error setting cache in IndexedDB: ' + event.target.errorCode);
    };
  });
};

export const getCache = async (key) => {
  if (!db) {
    db = await openDatabase();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(key);

    getRequest.onsuccess = (event) => {
      const item = event.target.result;
      if (item && Date.now() - item.timestamp < CACHE_DURATION_MS) {
        resolve(item.data);
      } else {
        // Item not found or expired
        resolve(null);
      }
    };

    getRequest.onerror = (event) => {
      reject('Error getting cache from IndexedDB: ' + event.target.errorCode);
    };
  });
};

export const clearCache = async (key) => {
  if (!db) {
    db = await openDatabase();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const deleteRequest = store.delete(key);

    deleteRequest.onsuccess = () => {
      resolve();
    };

    deleteRequest.onerror = (event) => {
      reject('Error clearing cache from IndexedDB: ' + event.target.errorCode);
    };
  });
};

// Optional: Function to clear all expired cache entries
export const clearExpiredCache = async () => {
  if (!db) {
    db = await openDatabase();
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const now = Date.now();

    store.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (now - cursor.value.timestamp >= CACHE_DURATION_MS) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };

    transaction.onerror = (event) => {
      reject('Error clearing expired cache from IndexedDB: ' + event.target.errorCode);
    };
  });
};
