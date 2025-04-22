import React from 'react';//correct
import { Link } from 'react-router-dom';//correct
import { useAuth } from '../../../features/auth/hooks/useAuth';//correct
import { Bell, Settings, User } from 'lucide-react';//correct
import { Button } from '../../../shared/components/forms/Button';//correct

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-600">
              Receipt Scanner
            </Link>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <Link 
                to="/notifications" 
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <Bell className="w-6 h-6" />
              </Link>
              
              <Link 
                to="/settings" 
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <Settings className="w-6 h-6" />
              </Link>

              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={logout}
                  icon={User}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};