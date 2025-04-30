import React from 'react';

/**
 * @desc Component displayed for routes that do not match any defined paths.
 * Shows a "404 Not Found" message.
 * @returns {JSX.Element} - The rendered NotFoundPage component.
 */
const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl">Page Not Found</p>
      {/* Optionally add a link back to the homepage */}
      {/* <a href="/" className="mt-4 text-primary-600 hover:underline">Go to Homepage</a> */}
    </div>
  );
};

export default NotFoundPage;
