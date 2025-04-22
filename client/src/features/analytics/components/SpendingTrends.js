import React, { useMemo } from 'react'; //correct
import { Card } from '../../../shared/components/ui/Card'; //correct
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';//correct
import { formatCurrency } from '../../../shared/utils/currency';//correct
import { formatDate } from '../../../shared/utils/date';//correct
import { Loading } from '../../../shared/components/ui/Loading';//correct
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';//correct

const SpendingTrends = ({
  data = [],
  loading = false,
  error = null,
  period = 'daily'
}) => {
  const chartData = useMemo(() => {
    if (!data.length) return [];

    // Group data by period
    const groupedData = data.reduce((acc, item) => {
      const date = new Date(item.date);
      let key;

      switch (period) {
        case 'weekly':
          // Get the Monday of the week
          const day = date.getDay();
          const diff = date.getDate() - day + (day === 0 ? -6 : 1);
          key = formatDate(new Date(date.setDate(diff)), 'MMM dd');
          break;
        case 'monthly':
          key = formatDate(date, 'MMM yyyy');
          break;
        case 'daily':
        default:
          key = formatDate(date, 'MMM dd');
      }

      if (!acc[key]) {
        acc[key] = {
          date: key,
          amount: 0,
          transactions: 0
        };
      }

      acc[key].amount += item.total;
      acc[key].transactions += 1;
      return acc;
    }, {});

    return Object.values(groupedData);
  }, [data, period]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return 0;
    const firstValue = chartData[0].amount;
    const lastValue = chartData[chartData.length - 1].amount;
    return ((lastValue - firstValue) / firstValue) * 100;
  }, [chartData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!chartData.length) return null;

    const amounts = chartData.map(d => d.amount);
    return {
      average: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      max: Math.max(...amounts),
      min: Math.min(...amounts)
    };
  }, [chartData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          Total: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-sm text-gray-600">
          Transactions: {payload[0].payload.transactions}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-96">
          <Loading size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-4 text-red-600">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Spending Trends
            </h3>
            <p className="text-sm text-gray-500">
              Analysis of your spending patterns
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {trend !== 0 && (
              <>
                {trend > 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </>
            )}
          </div>
        </div>

        <div className="h-72">
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
                tickFormatter={value => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
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
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-gray-500">Average Spending</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {formatCurrency(stats.average)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Highest Spending</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {formatCurrency(stats.max)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lowest Spending</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {formatCurrency(stats.min)}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SpendingTrends;