import React from 'react';//correct
import { RouterProvider } from 'react-router-dom';//correct
import { router } from './routes';//correct
import { AuthProvider } from './core/contexts/AuthContext';//correct
import { ToastProvider } from './core/contexts/ToastContext';//correct
import { initializeApp } from 'firebase/app';//correct
import { firebaseConfig } from './core/config/firebase';//correct
import '../../client/src/shared/styles/index.css';

// Initialize Firebase
initializeApp(firebaseConfig);

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
