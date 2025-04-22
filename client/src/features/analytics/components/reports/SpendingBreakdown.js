import React from 'react';
import { DonutChart } from '../charts/DonutChart'; // Updated import path
import { BarChart } from '../charts/BarChart'; // Updated import path
import { Card } from '../common/Card'; // Updated import path

export const SpendingBreakdown = ({ data }) => {
  const categoryData = data.map(item => ({
    name: item.category,
    value: item.total
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DonutChart
        data={categoryData}
        title="Spending by Category"
      />
      <BarChart
        data={categoryData}
        title="Category Comparison"
        bars={[{ dataKey: 'value', color: '#0EA5E9', name: 'Amount' }]}
      />
    </div>
  );
};
