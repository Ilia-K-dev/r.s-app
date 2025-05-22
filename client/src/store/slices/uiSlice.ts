/**
 * client/src/store/slices/uiSlice.ts
 * Last Modified: 2025-05-22 04:18:00
 * Modified By: Cline
 *
 * Purpose: Redux Toolkit slice for managing UI state.
 * Changes Made: Created a placeholder file to resolve build error.
 * Reasoning: The build was failing because this file was missing, causing a "Module not found" error. Creating a placeholder allows the build to proceed.
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Define your initial UI state here
  isLoading: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Define your UI reducers here
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, clearError } = uiSlice.actions;

export default uiSlice.reducer;
