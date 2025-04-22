import { useContext } from 'react';//correct
import { ToastContext } from '../../core/contexts/ToastContext';//correct

export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
