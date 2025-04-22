import React, { useState } from 'react';//correct
import { ReportFilters } from '../../features/analytics/components/reports/ReportFilters';//correct
import { SpendingChart } from '../../features/analytics/components/SpendingChart';//correct
import { CategoryBreakdown } from '../../features/analytics/components/CategoryBreakdown';//correct
import { MonthlyTrends } from '../../features/analytics/components/MonthlyTrends';//correct
import { useReceipts } from '../../features/receipts/hooks/useReceipts';//correct
import { Card } from '../../shared/components/ui/Card';//correct
import { Loading } from '../../shared/components/ui/Loading';//correct

export const ReportsPage = () => {
  const { receipts, loading } = useReceipts();
  const [filters, setFilters] = useState({
    reportType: 'spending',
    startDate: null,
    endDate: null,
    category: null
  });

  if (loading) {
    return <Loading />;
  }

  const renderReport = () => {
    switch (filters.reportType) {
      case 'spending':
        return <SpendingChart data={receipts} />;
      case 'categories':
        return <CategoryBreakdown data={receipts} />;
      case 'trends':
        return <MonthlyTrends data={receipts} />;
      case 'budget':
        return (
          <Card title="Budget Progress">
            {/* Budget progress content */}
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <ReportFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({
          reportType: 'spending',
          startDate: null,
          endDate: null,
          category: null
        })}
      />

      <div className="grid gap-6">
        {renderReport()}
      </div>
    </div>
  );
};