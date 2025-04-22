import React from 'react';//correct
import { TrendLine } from '../../../shared/components/charts/ChartComponent'//correct
import { format } from 'date-fns';//correct

export const MonthlyTrends = ({ data }) => {
  const formattedData = data.map(item => ({
    date: format(new Date(item.date), 'MMM yyyy'),
    total: item.total,
    average: item.average
  }));

  return (
    <TrendLine
      data={formattedData}
      title="Monthly Spending Trends"
      lines={[
        { dataKey: 'total', color: '#0EA5E9', name: 'Total Spending' },
        { dataKey: 'average', color: '#22C55E', name: 'Average Spending' }
      ]}
      xAxisKey="date"
    />
  );
};
