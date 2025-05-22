import React from 'react'; //correct
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'; //correct

import ChartWrapper from '../../../shared/components/charts/ChartWrapper'; //corret
import { useAnalytics } from '../../analytics/hooks/useAnalytics'; //correct

const PredictiveAnalytics = () => {
  const { spendingAnalytics, loading, error } = useAnalytics();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const data = spendingAnalytics.monthlyTrends;

  return (
    <ChartWrapper title="Predictive Spending Analysis">
      <LineChart
        width={800}
        height={400}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="month" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
        <Line type="monotone" dataKey="predictedAmount" stroke="#82ca9d" />
      </LineChart>
    </ChartWrapper>
  );
};

export default PredictiveAnalytics;
