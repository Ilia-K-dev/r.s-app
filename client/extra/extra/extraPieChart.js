import React from 'react';
import { PieChart as RechartPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const PieChart = ({ 
  data, 
  colors = ['#0EA5E9', '#22C55E', '#EAB308', '#EC4899', '#8B5CF6'],
  innerRadius = 60,
  outerRadius = 80
}) => {
  return (
    <RechartPieChart width={400} height={400}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell 
            key={`cell-${index}`}
            fill={colors[index % colors.length]}
          />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </RechartPieChart>
  );
};