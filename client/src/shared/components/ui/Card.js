import React from 'react';

/**
 * @typedef {object} CardProps
 * @property {React.ReactNode} children - The content to be displayed within the card.
 * @property {string} [className=''] - Additional CSS classes to apply to the card container.
 * @property {object} [props] - Additional props to pass to the card container div.
 */

/**
 * @desc A simple reusable Card UI component.
 * Displays content within a styled container with rounded corners and a shadow.
 * @param {CardProps} props - The component props.
 * @returns {JSX.Element} - The rendered Card component.
 */
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
