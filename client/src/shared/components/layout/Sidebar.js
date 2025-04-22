import React from 'react';//correct
import { Link, useLocation } from 'react-router-dom';//correct
import { 
  Home, 
  Receipt, 
  PieChart, 
  Settings,
  Upload
} from 'lucide-react';//correct

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/receipts', label: 'Receipts', icon: Receipt },
    { path: '/upload', label: 'Upload', icon: Upload },
    { path: '/reports', label: 'Reports', icon: PieChart },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen">
      <div className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-2 p-2 rounded-lg mb-1
                ${isActive 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};