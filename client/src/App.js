import React from 'react'; // correct
import { RouterProvider } from 'react-router-dom'; // correct
import { router } from './routes'; // correct
import { AuthProvider } from './core/contexts/AuthContext'; // correct
import { ToastProvider } from './core/contexts/ToastContext'; // correct
import { initializeApp } from 'firebase/app'; // correct
import { firebaseConfig } from './core/config/firebase'; // correct
import '../../client/src/shared/styles/index.css';

// Initialize Firebase
initializeApp(firebaseConfig);

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="relative min-h-screen">
          <RouterProvider router={router} />
          <div className="text-xs text-gray-500 absolute bottom-2 right-2">
            Version: 1.0.0 (Preview Test) - {new Date().toLocaleDateString()}
          </div>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
