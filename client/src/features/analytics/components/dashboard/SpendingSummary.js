import React, { useMemo } from 'react';//correct
import { Card } from '../../../../shared/components/ui/Card';//correct
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';//correct
import { formatCurrency } from '../../../../shared/utils/currency';//correct
import { formatDate } from '../../../../shared/utils/date';//correct
import { SpendingBreakdown } from '../reports/SpendingBreakdown';//correct

export const SpendingSummary = ({ data = [], loading = false }) => {
  const chartData = useMemo(() => {
    const dailySpending = data.reduce((acc, receipt) => {
      const date = formatDate(receipt.date, 'MMM dd');
      if (!acc[date]) {
        acc[date] = {
          date,
          amount: 0,
          count: 0
        };
      }
      acc[date].amount += receipt.total;
      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(dailySpending).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          Total: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-sm text-gray-600">
          Receipts: {payload[0].payload.count}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 w-1/4 bg-gray-200 rounded mb-4" />
            <div className="h-[300px] bg-gray-100 rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Overview</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={value => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke="#0EA5E9" strokeWidth={2} dot={{ fill: '#0EA5E9', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border-t px-4 py-3 bg-gray-50">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Spending</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.amount, 0))}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg. per Day</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(chartData.reduce((sum, item) => sum + item.amount, 0) / chartData.length)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Receipts</p>
            <p className="text-lg font-semibold text-gray-900">
              {chartData.reduce((sum, item) => sum + item.count, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        {/* Adding the Spending Breakdown Component for category-wise data */}
        <SpendingBreakdown data={data} loading={loading} />
      </div>
    </Card>
  );
};
