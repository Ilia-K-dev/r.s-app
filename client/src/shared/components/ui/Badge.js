import React from 'react';

/**
 * @typedef {object} BadgeProps
 * @property {React.ReactNode} children - The content to be displayed within the badge.
 * @property {'default'|'primary'|'success'|'warning'|'error'} [variant='default'] - The visual style variant of the badge.
 * @property {'sm'|'md'|'lg'} [size='md'] - The size of the badge.
 */

/**
 * @desc A reusable Badge UI component for displaying status indicators or small labels.
 * Supports different visual variants and sizes.
 * @param {BadgeProps} props - The component props.
 * @returns {JSX.Element} - The rendered Badge component.
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md'
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variants[variant]}
      ${sizes[size]}
    `}>
      {children}
    </span>
  );
};

export default Badge;
