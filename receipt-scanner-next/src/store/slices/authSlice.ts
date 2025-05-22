import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  // Define auth state shape here
}

const initialState: AuthState = {
  // Set initial auth state here
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Add auth reducers here
  },
});

export const { actions, reducer } = authSlice;
export default reducer;
