import React from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

const ModernCategoryChart = () => {
  const { t, i18n } = useTranslation('analytics');
  const isRTL = i18n.language === 'he';

  // Placeholder data - translate category names
  const data = [
    { name: t('charts.categoryBreakdown.categories.categoryA'), value: 400 },
    { name: t('charts.categoryBreakdown.categories.categoryB'), value: 300 },
    { name: t('charts.categoryBreakdown.categories.categoryC'), value: 300 },
    { name: t('charts.categoryBreakdown.categories.categoryD'), value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} // Add label formatter
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [`${value}`, `${name}`]} // Add tooltip formatter
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ModernCategoryChart;
