import React, { memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../../shared/utils/currency';

export const CategoryBreakdown = memo(({ data = [] }) => {

  // Helper to get a consistent color for each category
  function getCategoryColor(category) {
    const colors = {
      'Groceries': '#22C55E',
      'Dining': '#F59E0B',
      'Transportation': '#3B82F6',
      'Utilities': '#8B5CF6',
      'Entertainment': '#EC4899',
      'Shopping': '#06B6D4',
      'Health': '#EF4444',
      'Uncategorized': '#6B7280'
      // Add more colors as needed
    };

    return colors[category] || '#6B7280';
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data} // Use the data prop directly
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        >
          {data.map((entry, index) => ( // Map over data prop
            <Cell key={`cell-${index}`} fill={entry.color || getCategoryColor(entry.name)} /> // Use color from data or helper
          ))}
        </Pie>
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
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
});

export default CategoryBreakdown;
