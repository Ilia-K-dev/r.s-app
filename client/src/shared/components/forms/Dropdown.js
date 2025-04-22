import React, { useState } from 'react';//correct
import { ChevronDown } from 'lucide-react';//correct

export const Dropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option',
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selected = options.find(option => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        className={`
          w-full px-4 py-2 text-left bg-white border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-primary-300
          ${error ? 'border-red-500' : 'border-gray-200'}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span className={!selected ? 'text-gray-500' : ''}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`
                w-full px-4 py-2 text-left hover:bg-gray-50
                ${option.value === value ? 'bg-primary-50 text-primary-600' : ''}
              `}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string
};

Dropdown.defaultProps = {
  placeholder: 'Select an option'
};