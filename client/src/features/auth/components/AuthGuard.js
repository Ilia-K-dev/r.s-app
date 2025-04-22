import React from 'react';//correct
import { Navigate, useLocation } from 'react-router-dom';//correct
import { useAuth } from '../../auth/hooks/useAuth';//correct
import { Loading } from '../../../shared/components/ui/Loading';//correct

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default Protected;
