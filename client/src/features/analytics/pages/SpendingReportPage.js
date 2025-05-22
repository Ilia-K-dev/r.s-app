import React, { useState, useEffect } from 'react'; //correct

import { BudgetProgress } from '../../../features/analytics/components/BudgetProgress'; //correct
import { MonthlyTrends } from '../../../features/analytics/components/MonthlyTrends'; //correct
import { SpendingBreakdown } from '../../../features/analytics/components/reports/SpendingBreakdown'; //correct
import { receiptApi } from '../../../features/receipts/services/receipts'; //correct
import { DateRangePicker } from '../../../shared/components/ui/DateRangePicker'; //correct

export const SpendingReportPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [reportData, setReportData] = useState({
    categories: [],
    trends: [],
    budgets: [],
  });

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      loadReportData();
    }
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      const response = await receiptApi.getReportData(dateRange);
      setReportData(response.data);
    } catch (error) {
      console.error('Error loading report data:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Spending Report</h1>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onChange={setDateRange}
        />
      </div>

      <div className="space-y-8">
        <SpendingBreakdown data={reportData.categories} />
        <MonthlyTrends data={reportData.trends} />
        <BudgetProgress categories={reportData.budgets} />
      </div>
    </div>
  );
};
