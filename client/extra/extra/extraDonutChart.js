import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { generateChartColors } from '../../../utils/chartHelpers'; // Assuming this utility exists
import { formatCurrency } from '../../src/shared/utils/currency'; // Assuming this utility exists

const RADIAN = Math.PI / 180;

/**
 * @typedef {object} DonutChartProps
 * @property {Array<object>} [data=[]] - The data for the chart. Each object should have a name and value key.
 * @property {string} [nameKey='name'] - The key in the data objects that represents the name/label.
 * @property {string} [valueKey='value'] - The key in the data objects that represents the value.
 * @property {string[]} [colors=[]] - Optional array of custom colors for the chart segments. If not provided, colors will be generated.
 * @property {string|number} [innerRadius='60%'] - The inner radius of the donut chart. Can be a number or a percentage string.
 * @property {string|number} [outerRadius='80%'] - The outer radius of the donut chart. Can be a number or a percentage string.
 * @property {boolean} [showLegend=true] - Whether to display the legend.
 * @property {boolean} [showTooltip=true] - Whether to display the tooltip on hover.
 * @property {boolean} [showLabels=true] - Whether to display percentage labels on the segments.
 * @property {number} [height=400] - The height of the chart container.
 */

/**
 * @desc A reusable Donut Chart component using Recharts.
 * Displays data as a donut chart with customizable options for appearance, legend, tooltip, and labels.
 * @param {DonutChartProps} props - The component props.
 * @returns {JSX.Element} - The rendered DonutChart component.
 */
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
    // Assuming generateChartColors utility exists and returns an array of colors
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
  /**
   * @desc Renders custom percentage labels on the donut chart segments.
   * @param {object} props - Props provided by Recharts.
   * @returns {JSX.Element|null} - The rendered text element or null.
   */
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

    // Only show labels for segments larger than 5%
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
  /**
   * @desc Renders a custom tooltip for the donut chart segments on hover.
   * @param {object} props - Props provided by Recharts.
   * @returns {JSX.Element|null} - The rendered tooltip element or null.
   */
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    // Assuming formatCurrency utility exists
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
  /**
   * @desc Renders a custom legend for the donut chart.
   * @param {object} props - Props provided by Recharts.
   * @returns {JSX.Element|null} - The rendered legend element or null.
   */
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
