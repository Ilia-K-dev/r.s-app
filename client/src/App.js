import { initializeApp } from 'firebase/app';
import React from 'react';
import { RouterProvider } from 'react-router-dom';

import firebaseConfig from './core/config/firebase';
import { AuthProvider } from './core/contexts/AuthContext';
import { ToastProvider } from './core/contexts/ToastContext';
import { router } from './routes';
import '../src/shared/styles/index.css'; // ✅ cleaner import

// Initialize Firebase
initializeApp(firebaseConfig);

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <RouterProvider router={router} />
    </ToastProvider>
  </AuthProvider>
);

export default App;
