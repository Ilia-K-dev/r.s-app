import React, { useMemo } from 'react';//correct
import { Card } from '../../../shared/components/ui/Card';//correct
import { format } from 'date-fns';//correct
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const SpendingChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data?.length) return [];

    const groupedData = data.reduce((acc, receipt) => {
      const date = format(new Date(receipt.date), 'MMM dd');
      acc[date] = (acc[date] || 0) + receipt.total;
      return acc;
    }, {});

    return Object.entries(groupedData).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [data]);

  return (
    <Card className="h-[400px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Spending Trend
        </h3>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            stroke="#6B7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            formatter={(value) => [`$${value}`, 'Amount']}
            labelStyle={{ color: '#111827' }}
            contentStyle={{
              background: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '0.375rem',
              padding: '0.5rem'
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#0EA5E9"
            strokeWidth={2}
            dot={{ fill: '#0EA5E9', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};