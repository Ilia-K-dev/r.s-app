import React from 'react';//correct
import { Card } from '../../../../shared/components/ui/Card';//correct
import { formatCurrency } from '../../../../shared/utils/currency';//correct
import { Trend, ArrowUp, ArrowDown, Receipt, CreditCard, PieChart } from 'lucide-react';//correct

const StatCard = ({ title, value, icon: Icon, trend = null, loading = false }) => {
  const getTrendColor = (trend) => {
    if (!trend) return 'text-gray-500';
    return trend > 0 ? 'text-green-500' : 'text-red-500';
  };

  const TrendIcon = trend > 0 ? ArrowUp : ArrowDown;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-primary-100">
          <Icon className="w-6 h-6 text-primary-600" />
        </div>
        {trend !== null && (
          <div className={`flex items-center ${getTrendColor(trend)}`}>
            <TrendIcon className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {loading ? (
          <div className="h-8 mt-1 bg-gray-200 animate-pulse rounded" />
        ) : (
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {typeof value === 'number' && value.toString().includes('.') 
              ? formatCurrency(value) 
              : value}
          </p>
        )}
      </div>
    </Card>
  );
};

const DashboardStats = ({ stats, loading = false }) => {
  if (!stats && !loading) return null;

  const defaultStats = {
    totalSpent: 0,
    receiptCount: 0,
    avgPerReceipt: 0,
    spendingTrend: 0,
    categoryCount: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Spent"
        value={currentStats.totalSpent}
        icon={CreditCard}
        trend={currentStats.spendingTrend}
        loading={loading}
      />
      <StatCard
        title="Total Receipts"
        value={currentStats.receiptCount}
        icon={Receipt}
        loading={loading}
      />
      <StatCard
        title="Average per Receipt"
        value={currentStats.avgPerReceipt}
        icon={PieChart}
        loading={loading}
      />
      <StatCard
        title="Categories Used"
        value={currentStats.categoryCount}
        icon={Trend}
        loading={loading}
      />
    </div>
  );
};

export default DashboardStats;
