import React, { memo } from 'react'; // Import memo
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../../shared/utils/currency';
// Assuming formatDate is still needed for XAxis tick formatting if dates are not in a standard format
import { formatDate } from '../../../shared/utils/date';


export const SpendingChart = ({ data = [] }) => {

  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date" // Assuming the backend provides 'date' field in the aggregated data
          stroke="#6B7280"
          fontSize={12}
          // Add tickFormatter if the date format from backend needs adjustment for display
        />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(value), 'Amount']}
          labelStyle={{ color: '#111827' }}
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '0.375rem',
            padding: '0.5rem'
          }}
        />
        <Line
          type="monotone"
          dataKey="amount" // Assuming the backend provides 'amount' field in the aggregated data
          stroke="#0EA5E9"
          strokeWidth={2}
          dot={{ fill: '#0EA5E9', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default memo(SpendingChart); // Wrap with memo
