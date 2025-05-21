"use client";

// Created: 5/9/2025, 10:48:37 PM
// Note: Basic Redux slice for managing receipts state.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Receipt {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface ReceiptState {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
}

const initialState: ReceiptState = {
  receipts: [],
  loading: false,
  error: null,
};

const receiptsSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    setReceipts(state, action: PayloadAction<Receipt[]>) {
      state.receipts = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setReceipts, setLoading, setError } = receiptsSlice.actions;
export default receiptsSlice.reducer;
