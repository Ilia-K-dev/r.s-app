"use client";

// Created: 5/9/2025, 10:49:00 PM
// Note: Redux store provider component to wrap the application.

import { Provider } from 'react-redux';
import { store } from './index';
import React from 'react';

interface StoreProviderProps {
  children: React.ReactNode;
}

const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
