import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
