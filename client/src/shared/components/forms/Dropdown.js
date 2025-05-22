import { ChevronDown } from 'lucide-react';
import React from 'react';

export const Dropdown = ({ options, value, onChange, placeholder, icon, ...rest }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-600"
      {...rest}
    >
      <option disabled className="text-gray-400">
        {icon && <span className="mr-2">{icon}</span>}
        {placeholder || 'Select an option'}
      </option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

export default Dropdown;
