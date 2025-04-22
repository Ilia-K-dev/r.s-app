import React from 'react';//correct

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`card bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
