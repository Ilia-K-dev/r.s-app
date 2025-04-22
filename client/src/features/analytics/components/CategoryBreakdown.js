import React from 'react';//correct
import { useAnalytics } from '../../../features/analytics/hooks/useAnalytics';//correct
import ChartWrapper from '../../../shared/components/charts/ChartWrapper';//corret
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';//correct

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const CategoryBreakdown = () => {
  const { spendingAnalytics, loading, error } = useAnalytics();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const data = Object.entries(spendingAnalytics.categoryBreakdown).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  return (
    <ChartWrapper title="Spending by Category">
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          cx={200}
          cy={200}
          outerRadius={150}
          fill="#8884d8"
          dataKey="value"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ChartWrapper>
  );
};

export default CategoryBreakdown;