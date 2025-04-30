import React, { createContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

export const ToastContext = createContext({
  showToast: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-center justify-between p-4 rounded-lg shadow-lg 
              ${toast.type === 'success' && 'bg-green-500 text-white'}
              ${toast.type === 'error' && 'bg-red-500 text-white'}
              ${toast.type === 'info' && 'bg-blue-500 text-white'}
              ${toast.type === 'warning' && 'bg-yellow-500 text-white'}
            `}
          >
            <p>{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 hover:opacity-75"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
