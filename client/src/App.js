import React from 'react';//correct
import { RouterProvider } from 'react-router-dom';//correct
import { router } from './routes';//correct
import { AuthProvider } from './core/contexts/AuthContext';//correct
import { ToastProvider } from './core/contexts/ToastContext';//correct
import { initializeApp } from 'firebase/app';//correct
import { firebaseConfig } from './core/config/firebase';//correct
import '../../client/src/shared/styles/index.css';

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
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
};

// Include debug panel in development mode
{process.env.NODE_ENV === 'development' && (
  <DebugPanel position="bottom-right" />
)}

export default App;
