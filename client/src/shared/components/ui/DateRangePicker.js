import React, { useState } from 'react';//correct
import { Calendar } from 'lucide-react';//correct
import { format } from 'date-fns';//correct

export const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onChange,
  maxDate = new Date(),
  minDate = new Date(2020, 0, 1)
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date) => {
    return date ? format(date, 'MMM dd, yyyy') : '';
  };

  return (
    <div className="relative">
      <button
        className="w-full flex items-center px-4 py-2 border rounded-lg hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
        <span className="text-gray-700">
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : 'Select date range'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg border p-4">
          {/* Calendar implementation */}
        </div>
      )}
    </div>
  );
};
