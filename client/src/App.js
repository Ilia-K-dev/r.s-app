import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { AuthProvider } from './core/contexts/AuthContext';
import { ToastProvider } from './core/contexts/ToastContext';

// Import Firebase to ensure it's initialized
import './core/config/firebase';
import './shared/styles/index.css';

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="relative min-h-screen">
          <RouterProvider router={router} />
          {/* Add version indicator for preview testing */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            Version: 1.0.0 (Preview Test) - {new Date().toLocaleDateString()}
          </div>
        </div>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
