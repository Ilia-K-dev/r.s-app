import React, { useEffect, useState } from 'react'; // Added useEffect and useState
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './core/contexts/AuthContext';
import { ToastProvider } from './core/contexts/ToastContext';
import router from './routes';
import { ThemeProvider } from './contexts/ThemeContext'; // Import ThemeProvider
import { I18nextProvider } from 'react-i18next'; // Import I18nextProvider
import i18n from './locales'; // Import i18n configuration
import { env } from './core/config/environment'; // Import env
import { testApiConnection } from './shared/utils/apiConnectionTest'; // Import testApiConnection
import { useToast } from './shared/hooks/useToast'; // Import useToast
import DebugPanel from './components/debug/DebugPanel'; // Import DebugPanel

// Import Firebase to ensure it's initialized once, but don't re-initialize
import './core/config/firebase';
import '../src/shared/styles/index.css';

const App = () => { // Changed to a functional component to use hooks
  const { showToast } = useToast(); // Use useToast hook
  const [apiConnected, setApiConnected] = useState(true); // Add apiConnected state

  useEffect(() => {
    // Test API connection on app startup
    testApiConnection(
      (url) => {
        // Only show success in development
        if (process.env.NODE_ENV !== 'production') {
          showToast(`Connected to API: ${url}`, 'success');
        }
        setApiConnected(true);
      },
      (errorMsg) => {
        showToast(`API connection issue: ${errorMsg}`, 'warning');
        setApiConnected(false);
      }
    );
  }, [showToast]); // Added showToast to dependencies

  // Optional: Show a banner if API is not connected (in development only)
  const renderApiWarning = () => {
    if (!apiConnected && process.env.NODE_ENV !== 'production') {
      return (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>API connection issues detected. Some features may not work.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ThemeProvider> {/* Wrap with ThemeProvider */}
      <I18nextProvider i18n={i18n}> {/* Wrap with I18nextProvider */}
        <AuthProvider>
          <ToastProvider>
            {!env.IS_PRODUCTION && ( // Conditional environment indicator
              <div className="fixed top-0 right-0 bg-yellow-500 text-black px-2 py-1 text-xs font-bold z-50">
                {process.env.NODE_ENV}
              </div>
            )}
            {renderApiWarning()} {/* Render API warning */}
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </I18nextProvider>
    </ThemeProvider>
  );
};

// Include debug panel in development mode
{process.env.NODE_ENV === 'development' && (
  <DebugPanel position="bottom-right" />
)}

export default App;
