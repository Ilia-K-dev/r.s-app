import React from 'react';

import { ChartComponent } from '../../../../shared/components/charts/ChartComponent'; // Updated import path
import { Card } from '../../../../shared/components/ui/Card'; // Updated import path

export const SpendingBreakdown = ({ data }) => {
  const categoryData = data.map(item => ({
    name: item.category,
    value: item.total,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartComponent type="pie" data={categoryData} title="Spending by Category" config={{ yAxis: 'value', xAxis: 'name' }}/>
      <ChartComponent
        type="bar"
        data={categoryData}
        title="Category Comparison"
        config={{ yAxis: 'value', xAxis: 'name', color: '#0EA5E9' }}
      />
    </div>
  );
};
