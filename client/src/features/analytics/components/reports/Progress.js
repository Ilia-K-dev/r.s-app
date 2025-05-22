import PropTypes from 'prop-types';
import React from 'react';

const Progress = ({
  value = 0,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  striped = false,
  animated = false,
  className = '',
}) => {
  // Normalize value between 0 and max
  const normalizedValue = Math.min(Math.max(0, value), max);
  const percentage = (normalizedValue / max) * 100;

  // Color variants
  const colors = {
    primary: 'bg-primary-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-500',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
  };

  // Size variants
  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-5',
  };

  // Base classes
  const baseClasses = 'relative bg-gray-200 rounded-full overflow-hidden';
  const sizeClass = sizes[size] || sizes.md;

  // Background colors for different states
  const getBgColor = () => {
    if (percentage >= 100) return colors.success;
    if (percentage >= 80) return colors.warning;
    if (percentage >= 60) return colors.primary;
    return colors[color] || colors.primary;
  };

  return (
    <div className="w-full">
      <div className={`${baseClasses} ${sizeClass} ${className}`}>
        <div
          className={`
            absolute left-0 top-0 bottom-0 
            ${getBgColor()} 
            transition-all duration-300 ease-out 
            ${striped ? 'progress-striped' : ''} 
            ${animated ? 'progress-animated' : ''}
          `}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={max}
        />
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`
              text-xs font-medium 
              ${percentage > 50 ? 'text-white' : 'text-gray-700'}
            `}
            >
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          <span>{normalizedValue}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

Progress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  showLabel: PropTypes.bool,
  striped: PropTypes.bool,
  animated: PropTypes.bool,
  className: PropTypes.string,
};

export default Progress;
