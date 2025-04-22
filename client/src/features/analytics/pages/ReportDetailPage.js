import React, { useState } from 'react';//correct 
import { useParams, useNavigate } from 'react-router-dom';//correct 
import { PageHeader } from '../../../shared/components/layout/PageHeader';//correct 
import { Card } from '../../../shared/components/ui/Card';//correct 
import { Button } from '../../../shared/components/forms/Button';//correct 
import { Alert } from '../../../shared/components/ui//Alert';//correct 
import { Loading } from '../../../shared/components/ui/Loading';//correct
import { ReportFilters } from '../../../features/analytics/components/reports/ReportFilters';//correct
import { SpendingChart } from '../../../features/analytics/components/SpendingChart';//correct
import { CategoryChart, DonutChart, LineChart } from '../../../shared/components/charts/ChartComponent';//correct
import { useReports } from '../../../features/analytics/hooks/useReports';//correct
import { useToast } from '../../../shared/hooks/useToast';//correct
import { formatCurrency } from '../../../shared/utils/currency';//correct
import { formatDate } from '../../../shared/utils/date';//correct
import { Download, Share, ChevronLeft, Filter } from 'lucide-react';//correct

const ReportDetailPage = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    loading,
    error,
    reports,
    filters,
    summaries,
    categoryAnalysis,
    trendAnalysis,
    updateFilters,
    exportReport
  } = useReports();

  // Report type configurations
  const reportTypes = {
    spending: {
      title: 'Spending Analysis',
      description: 'Detailed breakdown of your spending patterns',
      component: SpendingChart
    },
    category: {
      title: 'Category Analysis',
      description: 'Analysis of spending by category',
      component: CategoryChart
    }
  };

  const currentReport = reportTypes[type];

  if (!currentReport) {
    return (
      <div className="p-4">
        <Alert
          type="error"
          title="Invalid Report Type"
          message="The requested report type does not exist."
        />
        <Button
          variant="secondary"
          icon={ChevronLeft}
          onClick={() => navigate('/reports')}
          className="mt-4"
        >
          Back to Reports
        </Button>
      </div>
    );
  }

  const handleExport = async (format = 'csv') => {
    try {
      await exportReport(format);
      showToast(`Report exported successfully as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showToast('Failed to export report', 'error');
    }
  };

  const handleShare = async () => {
    try {
      // Only include essential, non-sensitive filters
      const shareParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        type: type
      });
      const shareUrl = `${window.location.origin}/reports/${type}?${shareParams}`;
      
      await navigator.clipboard.writeText(shareUrl);
      showToast('Report link copied to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy report link', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title={currentReport.title}
        subtitle={currentReport.description}
        showBack
        action={
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
            <Button
              variant="secondary"
              icon={Share}
              onClick={handleShare}
            >
              Share
            </Button>
            <Button
              variant="primary"
              icon={Download}
              onClick={() => handleExport('csv')}
            >
              Export
            </Button>
          </div>
        }
      />

      {error && (
        <Alert
          type="error"
          title="Error loading report"
          message={error}
        />
      )}

      {showFilters && (
        <Card className="mb-6">
          <ReportFilters
            filters={filters}
            onChange={updateFilters}
            onClose={() => setShowFilters(false)}
          />
        </Card>
      )}

      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Spending</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {formatCurrency(summaries?.totalSpent || 0)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                {formatDate(filters.startDate)} - {formatDate(filters.endDate)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Average per Day</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {formatCurrency(summaries?.avgPerDay || 0)}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Based on {summaries?.transactionCount || 0} transactions
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-500">Growth Rate</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {(trendAnalysis?.growth || 0).toFixed(1)}%
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Compared to previous period
              </p>
            </div>
          </Card>
        </div>

        {/* Main Chart */}
        <Card className="p-6">
          {React.createElement(currentReport.component, {
            data: type === 'spending' ? reports.spending : categoryAnalysis,
            loading,
            error
          })}
        </Card>

        {/* Forecast Visualization */}
        {type === 'spending' && trendAnalysis?.forecast?.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Spending Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Based on your spending patterns, here's a forecast for the next period:
                </p>
                {trendAnalysis.forecast.map((forecast, index) => (
                  <div key={index} className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      {formatDate(forecast.date)}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(forecast.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <LineChart
                  data={trendAnalysis.forecast}
                  xAxisKey="date"
                  yAxisKey="amount"
                  color="#0EA5E9"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Category Breakdown */}
        {type === 'category' && categoryAnalysis?.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Category Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {categoryAnalysis.map((category) => (
                  <div key={category.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color || '#000' }}
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(category.total || 0)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {(category.percentage || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <DonutChart
                  data={categoryAnalysis}
                  nameKey="name"
                  valueKey="total"
                  colors={categoryAnalysis.map(cat => cat.color || '#000')}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Transaction List */}
        {reports.receipts && reports.receipts.length > 0 && (
          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium">Related Transactions</h3>
            </div>
            <div className="divide-y">
              {reports.receipts.map(receipt => (
                <div 
                  key={receipt.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/receipts/${receipt.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {receipt.merchant}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(receipt.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(receipt.total)}
                      </p>
                      {receipt.category && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {receipt.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ReportDetailPage;