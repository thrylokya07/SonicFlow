const MAX_CACHE_ITEMS = 50;

const cache = new Map();

function get(key) {
  if (!cache.has(key)) {
    return null;
  }

  const value = cache.get(key);

  // Move recently used item to the end.
  cache.delete(key);
  cache.set(key, value);

  return value;
}

function set(key, value) {
  if (cache.has(key)) {
    cache.delete(key);
  }

  cache.set(key, value);

  if (cache.size > MAX_CACHE_ITEMS) {
    const firstKey = cache.keys().next().value;

    if (firstKey) {
      cache.delete(firstKey);
    }
  }
}

function clear() {
  cache.clear();
}

function size() {
  return cache.size;
}

module.exports = {
  get,
  set,
  clear,
  size
};