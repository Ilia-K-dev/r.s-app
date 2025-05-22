"use client";

// Last Modified: 5/9/2025, 10:49:59 PM
// Note: Removed unused AnyAction import.

import { configureStore } from '@reduxjs/toolkit';
import receiptsReducer from './receiptsSlice';

export const store = configureStore({
  reducer: {
    // Add reducers here
    receipts: receiptsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
