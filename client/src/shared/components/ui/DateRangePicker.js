import { Calendar } from 'lucide-react';
import React from 'react';

export const DateRangePicker = ({ startDate, endDate, onChange }) => (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
        onClick={() =>
          onChange({
            startDate: null,
            endDate: null,
          })
        }
      >
        <Calendar className="w-5 h-5 mr-2" />
        Clear Dates
      </button>
      <div className="flex gap-2">
        {startDate && (
          <div className="flex items-center gap-1">
            <span className="text-gray-600">From:</span>
            <span className="border px-2 py-1 rounded">{startDate}</span>
          </div>
        )}
        {endDate && (
          <div className="flex items-center gap-1">
            <span className="text-gray-600">To:</span>
            <span className="border px-2 py-1 rounded">{endDate}</span>
          </div>
        )}
      </div>
    </div>
  );

export default DateRangePicker;
