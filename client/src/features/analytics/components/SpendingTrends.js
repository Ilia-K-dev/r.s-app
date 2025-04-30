import React, { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../../shared/utils/currency';
// Assuming date formatting is handled by the backend or Recharts can handle the date format provided

export const SpendingTrends = memo(({ data = [] }) => {

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
        <Bar
          dataKey="amount" // Assuming the backend provides 'amount' field in the aggregated data
          fill="#8884d8"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

export default SpendingTrends;
