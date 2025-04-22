import React, { useMemo } from 'react';//correct
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie,
  Cell,
  XAxis, YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';//correct
import { generateChartColors } from '../../../shared/components/charts/chartHelpers';//correct
import { formatDate } from '../../../shared/utils/date';//correct
import { formatCurrency } from '../../../shared/utils/currency';//correct

export const ChartComponent = ({
  type = 'line',
  data = [],
  config = {},
  height = 400
}) => {
  const {
    xAxis = 'date',
    yAxis = 'value',
    color = '#0EA5E9',
    formatter = (value) => value,
    dateFormat = 'MMM dd',
    showGrid = true,
    showLegend = true,
    colors = [],
    innerRadius,
    outerRadius
  } = config;

  const chartColors = useMemo(() => {
    if (colors.length > 0) return colors;
    return generateChartColors(data.length);
  }, [colors, data.length]);

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey={xAxis}
              tickFormatter={value => formatDate(value, dateFormat)}
            />
            <YAxis tickFormatter={formatter} />
            <Tooltip />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={yAxis}
              stroke={color}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              dataKey={xAxis}
              tickFormatter={value => formatDate(value, dateFormat)}
            />
            <YAxis tickFormatter={formatter} />
            <Tooltip />
            {showLegend && <Legend />}
            <Bar dataKey={yAxis} fill={color} />
          </BarChart>
        );

      case 'pie':
      case 'donut':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              fill={color}
              dataKey={yAxis}
              label
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};