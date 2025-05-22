import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  // Define UI state shape here
}

const initialState: UiState = {
  // Set initial UI state here
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Add UI reducers here
  },
});

export const { actions, reducer } = uiSlice;
export default reducer;
