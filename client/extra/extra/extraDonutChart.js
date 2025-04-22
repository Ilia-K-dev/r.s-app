import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { generateChartColors } from '../../../utils/chartHelpers';
import { formatCurrency } from '../../src/shared/utils/currency';

const RADIAN = Math.PI / 180;

const DonutChart = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  colors = [],
  innerRadius = '60%',
  outerRadius = '80%',
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  height = 400
}) => {
  // Generate colors if not provided
  const chartColors = useMemo(() => {
    if (colors.length >= data.length) return colors;
    return generateChartColors(data.length);
  }, [colors, data.length]);

  // Format data for the chart
  const formattedData = useMemo(() => {
    return data.map(item => ({
      name: item[nameKey],
      value: typeof item[valueKey] === 'string' ? parseFloat(item[valueKey]) : item[valueKey]
    }));
  }, [data, nameKey, valueKey]);

  // Calculate total for percentages
  const total = useMemo(() => {
    return formattedData.reduce((sum, item) => sum + item.value, 0);
  }, [formattedData]);

  // Custom label for the segments
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (!showLabels) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    ) : null;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-gray-600">{formatCurrency(data.value)}</p>
        <p className="text-sm text-gray-500">
          {((data.value / total) * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  };

  // Custom legend
  const CustomLegend = ({ payload }) => {
    if (!showLegend) return null;

    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="flex items-center">
            <span
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {formattedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]} 
              />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend content={<CustomLegend />} />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;