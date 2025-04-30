const cache = new Map();

/**
 * @desc Sets data in the cache with an optional expiration time.
 * @param {string} key - The cache key.
 * @param {*} value - The data to cache.
 * @param {number} [ttl=0] - Time to live in milliseconds. 0 means no expiration.
 */
const setCache = (key, value, ttl = 0) => {
  const item = {
    value,
    expiry: ttl > 0 ? Date.now() + ttl : null,
  };
  cache.set(key, item);
};

/**
 * @desc Gets data from the cache. Returns undefined if the key is not found or has expired.
 * @param {string} key - The cache key.
 * @returns {*} The cached data or undefined.
 */
const getCache = (key) => {
  const item = cache.get(key);
  if (!item) {
    return undefined;
  }

  if (item.expiry && Date.now() > item.expiry) {
    cache.delete(key);
    return undefined;
  }

  return item.value;
};

/**
 * @desc Removes data from the cache for a given key.
 * @param {string} key - The cache key.
 */
const invalidateCache = (key) => {
  cache.delete(key);
};

/**
 * @desc Clears the entire cache.
 */
const clearCache = () => {
  cache.clear();
};

export { setCache, getCache, invalidateCache, clearCache };
