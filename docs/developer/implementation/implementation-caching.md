---
title: Client-Side Caching Implementation
created: 2025-05-08
last_updated: 2025-05-08
update_history:
  - 2025-05-08: Initial creation.
status: Draft
owner: [Primary Maintainer]
related_files:
  - client/src/utils/performance/cache.js
---

# Client-Side Caching Implementation

This document describes the implementation of client-side caching in the Receipt Scanner application to improve performance and reduce unnecessary API calls.

## Table of Contents

*   [Introduction](#introduction)
*   [LRU Cache](#lru-cache)
*   [Caching API Calls](#caching-api-calls)
*   [Cache Invalidation](#cache-invalidation)

## Introduction

Client-side caching is used to store frequently accessed data in memory, allowing the application to retrieve it quickly without making a network request. This can significantly improve the perceived performance and responsiveness of the application.

## LRU Cache

The caching mechanism is implemented using the `lru-cache` library, which provides a simple in-memory Least Recently Used (LRU) cache.

*   **`runtimeCache`**: An instance of the LRU cache is created and exported as `runtimeCache` from `client/src/utils/performance/cache.js`. It is configured with a maximum number of items and a maximum age for cached entries.

## Caching API Calls

The `cachedApiCall` function is provided to wrap API calls and automatically handle caching.

*   **`cachedApiCall(key, apiCall)`**: This function takes a unique `key` for the cache entry and an `apiCall` function (which should return a Promise) as arguments. It checks if a valid entry exists in the cache for the given key. If it does, the cached data is returned. Otherwise, the `apiCall` function is executed, its result is stored in the cache with the specified key, and the result is returned.

## Cache Invalidation

Strategies are provided to invalidate cached data when it becomes stale or outdated.

*   **`invalidateCacheEntry(key)`**: This function removes a specific entry from the `runtimeCache` based on its key. This is useful when a mutation or update operation affects a specific data entry.
*   **`clearCache()`**: This function clears the entire `runtimeCache`, removing all cached entries. This can be used for broader invalidation scenarios, such as after a user logs out or performs an action that could affect a large amount of cached data.
