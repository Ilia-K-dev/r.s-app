import React from 'react';//correct
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'; //correct
import { Card } from '../../../../shared/components/ui/Card';//correct
import { formatCurrency } from '../../../../shared/utils/currency';//correct
import { formatDate } from '../../../../shared/utils/date';//correct

export const SpendingTrendChart = ({ data }) => (
  <Card className="h-[400px]">
    <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="month" 
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={value => formatCurrency(value)}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white p-3 shadow-lg border rounded-lg">
                <p className="font-medium">{label}</p>
                <p className="text-primary-600">
                  {formatCurrency(payload[0].value)}
                </p>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#0EA5E9"
          strokeWidth={2}
          dot={{ fill: '#0EA5E9', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

export const CategoryBreakdownChart = ({ data }) => {
  const COLORS = ['#0EA5E9', '#22C55E', '#EAB308', '#EC4899', '#8B5CF6'];

  return (
    <Card className="h-[400px]">
      <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 shadow-lg border rounded-lg">
                  <p className="font-medium">{data.name}</p>
                  <p>{formatCurrency(data.value)}</p>
                  <p className="text-sm text-gray-500">
                    {(data.percentage).toFixed(1)}%
                  </p>
                </div>
              );
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export const VendorPerformanceChart = ({ data }) => (
  <Card className="h-[400px]">
    <h3 className="text-lg font-semibold mb-4">Vendor Performance</h3>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="name" 
          stroke="#6B7280"
          fontSize={12}
        />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={value => `${(value * 100).toFixed(0)}%`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white p-3 shadow-lg border rounded-lg">
                <p className="font-medium">{label}</p>
                <p>Reliability: {(payload[0].value * 100).toFixed(1)}%</p>
                <p>Quality: {(payload[1].value * 100).toFixed(1)}%</p>
                <p>Price: {(payload[2].value * 100).toFixed(1)}%</p>
              </div>
            );
          }}
        />
        <Legend />
        <Bar dataKey="reliability" fill="#0EA5E9" />
        <Bar dataKey="quality" fill="#22C55E" />
        <Bar dataKey="price" fill="#EAB308" />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

export const InventoryValueChart = ({ data }) => (
  <Card className="h-[400px]">
    <h3 className="text-lg font-semibold mb-4">Inventory Value Trends</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          dataKey="date" 
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={value => formatDate(value, 'MMM dd')}
        />
        <YAxis
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={value => formatCurrency(value)}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white p-3 shadow-lg border rounded-lg">
                <p className="font-medium">{formatDate(label, 'MMM dd, yyyy')}</p>
                <p>Total Value: {formatCurrency(payload[0].value)}</p>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#0EA5E9"
          strokeWidth={2}
          dot={{ fill: '#0EA5E9', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

export const TurnoverRateChart = ({ data }) => (
  <Card className="h-[400px]">
    <h3 className="text-lg font-semibold mb-4">Inventory Turnover Rate</h3>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data}
        layout="vertical"
        margin={{ left: 100 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis 
          type="number"
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={value => `${value.toFixed(1)}x`}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#6B7280"
          fontSize={12}
          width={100}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            const rate = payload[0].value;
            return (
              <div className="bg-white p-3 shadow-lg border rounded-lg">
                <p className="font-medium">{label}</p>
                <p>Turnover Rate: {rate.toFixed(1)}x</p>
                <p className="text-sm text-gray-500">
                  {rate > 12 ? 'High' : rate > 6 ? 'Good' : 'Low'} turnover
                </p>
              </div>
            );
          }}
        />
        <Bar 
          dataKey="rate" 
          fill="#0EA5E9"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);