import React, { useEffect } from 'react';//correct
import { Outlet, useNavigate } from 'react-router-dom';//correct
import { Navbar } from './Navbar';//correct
import { Sidebar } from './Sidebar';//correct
import { Footer } from './Footer';//correct
import { useAuth } from '../../../features/auth/hooks/useAuth';//correct
import { Loading } from '../ui/Loading';//correct

export const Layout = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};