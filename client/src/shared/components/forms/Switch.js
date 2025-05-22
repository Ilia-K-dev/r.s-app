import React from 'react';

/**
 * @typedef {object} SwitchProps
 * @property {string} label - The label text for the switch.
 * @property {string} [description] - An optional description text for the switch.
 * @property {boolean} checked - The current checked state of the switch.
 * @property {function(boolean): void} onChange - Callback function to be called when the switch state changes. Receives the new checked state as an argument.
 * @property {boolean} [disabled=false] - Whether the switch is disabled.
 * @property {string} [className=''] - Additional CSS classes to apply to the switch container div.
 */

/**
 * @desc A reusable Switch (toggle) UI component.
 * Displays a toggle switch with optional label and description.
 * @param {SwitchProps} props - The component props.
 * @returns {JSX.Element} - The rendered Switch component.
 */
export const Switch = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          className={`
            relative inline-flex flex-shrink-0 h-6 w-11 rounded-full
            ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            transition-colors ease-in-out duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
            ${checked ? 'bg-primary-600' : 'bg-gray-200'}
          `}
          onClick={() => onChange(!checked)}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow
              transform ring-0 transition ease-in-out duration-200
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>

      <div className="ml-3 text-sm">
        <label className="font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-gray-500">{description}</p>
        )}
      </div>
    </div>
  );
};

export default Switch;
