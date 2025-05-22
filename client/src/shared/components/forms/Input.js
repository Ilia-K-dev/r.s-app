import React from 'react';

/**
 * @typedef {object} InputProps
 * @property {React.ElementType} [icon] - An optional icon component to display inside the input.
 * @property {string} [error] - An optional error message to display below the input.
 * @property {string} [label] - An optional label for the input field.
 * @property {string} [className=''] - Additional CSS classes to apply to the input element.
 * @property {object} [props] - Additional standard HTML input attributes (e.g., type, name, value, onChange, placeholder, disabled, etc.).
 */

/**
 * @desc A reusable Input UI component for form input fields.
 * Supports optional icon, label, error display, and custom styling.
 * @param {InputProps} props - The component props.
 * @returns {JSX.Element} - The rendered Input component.
 */
export const Input = ({
  icon: Icon,
  error,
  label,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-300 outline-none transition-all duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
