import React from 'react';

/**
 * @typedef {object} LoadingProps
 * @property {'sm'|'md'|'lg'} [size='md'] - The size of the loading spinner ('sm', 'md', or 'lg').
 */

/**
 * @desc A reusable Loading spinner component.
 * Displays a simple animated spinner to indicate loading state.
 * @param {LoadingProps} props - The component props.
 * @returns {JSX.Element} - The rendered Loading component.
 */
export const Loading = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-gray-300 border-t-primary-600`} />
    </div>
  );
};

export default Loading;
