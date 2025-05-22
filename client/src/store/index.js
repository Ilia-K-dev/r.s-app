// Modified as part of build error fix task on 2025-05-08, 2:40:07 AM
// Corrected import path for receiptApi from './services/receiptApi' to '../shared/services/receiptApi'.
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { receiptApi } from '../shared/services/receiptApi';
import { analyticsApi } from '@/features/analytics/services/analyticsApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    [receiptApi.reducerPath]: receiptApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(receiptApi.middleware, analyticsApi.middleware),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
export const setupStoreListeners = (store) => setupListeners(store.dispatch);
