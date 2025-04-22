import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Card } from '../../common/Card';

export const BarChart = ({ 
  data,
  title,
  xAxisKey = 'name',
  bars = [{ dataKey: 'value', color: '#0EA5E9' }]
}) => {
  return (
    <Card>
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {bars.map(({ dataKey, color, name }, index) => (
            <Bar
              key={index}
              dataKey={dataKey}
              fill={color}
              name={name || dataKey}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Card>
  );
};