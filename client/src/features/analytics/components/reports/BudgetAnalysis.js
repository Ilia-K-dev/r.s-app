import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { Alert } from '../common/Alert';
import { Loading } from '../common/Loading';
import { Progress } from '../common/Progress';
import { formatCurrency } from '../../utils/currency';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const BudgetAnalysis = ({
  categories = [],
  spending = {},
  loading = false,
  error = null
}) => {
  const budgetAnalysis = useMemo(() => {
    return categories
      .filter(category => category.budget > 0)
      .map(category => {
        const spent = spending[category.id] || 0;
        const remaining = category.budget - spent;
        const percentage = (spent / category.budget) * 100;
        const status = percentage >= 100 ? 'exceeded' 
          : percentage >= 80 ? 'warning' 
          : 'normal';

        return {
          ...category,
          spent,
          remaining,
          percentage,
          status
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [categories, spending]);

  const summary = useMemo(() => {
    const total = budgetAnalysis.reduce((acc, curr) => {
      acc.totalBudget += curr.budget;
      acc.totalSpent += curr.spent;
      return acc;
    }, { totalBudget: 0, totalSpent: 0 });

    return {
      ...total,
      remaining: total.totalBudget - total.totalSpent,
      percentage: (total.totalSpent / total.totalBudget) * 100
    };
  }, [budgetAnalysis]);

  if (loading) {
    return (
      <Card>
        <div className="p-6">
          <Loading />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="p-6">
          <Alert type="error" message={error} />
        </div>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-green-600';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'red';
    if (percentage >= 80) return 'yellow';
    return 'green';
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Budget Analysis
        </h3>

        {/* Overall Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {formatCurrency(summary.totalBudget)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {formatCurrency(summary.totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remaining</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {formatCurrency(summary.remaining)}
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Budget Usage
            </span>
            <span className="text-sm font-medium text-gray-700">
              {summary.percentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={summary.percentage} 
            color={getProgressColor(summary.percentage)} 
          />
        </div>

        {/* Category Breakdown */}
        <div className="space-y-6">
          {budgetAnalysis.map(category => (
            <div key={category.id}>
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {category.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(category.spent)} of {formatCurrency(category.budget)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getStatusColor(category.status)}`}>
                    {category.percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.remaining > 0 
                      ? `${formatCurrency(category.remaining)} remaining`
                      : `${formatCurrency(Math.abs(category.remaining))} over`}
                  </p>
                </div>
              </div>
              <Progress 
                value={category.percentage} 
                color={getProgressColor(category.percentage)}
              />
            </div>
          ))}
        </div>

        {/* Alerts */}
        {budgetAnalysis.some(cat => cat.status === 'exceeded' || cat.status === 'warning') && (
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Alerts</h4>
            <div className="space-y-4">
              {budgetAnalysis
                .filter(cat => cat.status === 'exceeded' || cat.status === 'warning')
                .map(category => (
                  <Alert
                    key={category.id}
                    type={category.status === 'exceeded' ? 'error' : 'warning'}
                    icon={AlertTriangle}
                    message={
                      category.status === 'exceeded'
                        ? `${category.name} budget exceeded by ${formatCurrency(Math.abs(category.remaining))}`
                        : `${category.name} budget at ${category.percentage.toFixed(1)}% usage`
                    }
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BudgetAnalysis;