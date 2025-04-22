import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatCurrency } from '../../src/shared/utils/currency';
import { generateChartColors } from '../../../utils/chartHelpers';

const LineChart = ({
  data = [],
  lines = [{ key: 'value', name: 'Value', color: '#0EA5E9' }],
  xAxisKey = 'date',
  yAxisFormatter = value => formatCurrency(value),
  height = 400,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  curved = true,
  dotSize = 4,
  strokeWidth = 2
}) => {
  // Generate colors if not all lines have colors specified
  const chartLines = useMemo(() => {
    const colors = generateChartColors(lines.length);
    return lines.map((line, index) => ({
      ...line,
      color: line.color || colors[index]
    }));
  }, [lines]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {yAxisFormatter(entry.value)}
          </p>
        ))}
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
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5E7EB"
              vertical={false}
            />
          )}
          
          <XAxis
            dataKey={xAxisKey}
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
          />
          
          <YAxis
            stroke="#6B7280"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            tickFormatter={yAxisFormatter}
          />
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend content={<CustomLegend />} />}

          {chartLines.map((line, index) => (
            <Line
              key={index}
              type={curved ? "monotone" : "linear"}
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={strokeWidth}
              dot={{
                r: dotSize,
                fill: line.color,
                strokeWidth: 0
              }}
              activeDot={{
                r: dotSize + 2,
                fill: line.color,
                stroke: '#fff',
                strokeWidth: 2
              }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;