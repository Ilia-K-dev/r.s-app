import React from 'react';//correct
import { Link } from 'react-router-dom';//correct
import { Button } from '../../shared/components/forms/Button';//correct
import { Home } from 'lucide-react';//correct

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-2 text-lg text-gray-600">Page not found</p>
        <p className="mt-1 text-gray-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button icon={Home}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};