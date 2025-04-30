import React from 'react'; //correct
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import { Card } from '../../../../shared/components/ui/Card'; //correct
import { formatCurrency } from '../../../../shared/utils/currency'; //correct
import { formatDate } from '../../../../shared/utils/date'; //correct

// Stock Prediction Chart
export const StockPredictionChart = ({ data }) => (
  <Card className="h-[400px]">
    <h3 className="text-lg font-semibold mb-4">Stock Level Predictions</h3>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={value => formatDate(value, 'MMM dd')}
        />
        <YAxis stroke="#6B7280" fontSize={12} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white p-3 shadow-lg border rounded-lg">
                <p className="font-medium">{formatDate(label, 'MMM dd, yyyy')}</p>
                <p>Predicted Stock: {payload[0].value}</p>
                <p>Confidence: {(payload[1].value * 100).toFixed(1)}%</p>
              </div>
            );
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="predictedStock"
          stroke="#0EA5E9"
          fill="#0EA5E9"
          fillOpacity={0.2}
        />
        <Area
          type="monotone"
          dataKey="confidence"
          stroke="#22C55E"
          fill="#22C55E"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  </Card>
);

// Price Elasticity Chart
export const PriceElasticityChart = ({ data }) => (
  <Card className="h-[400px]">
    <h3 className="text-lg font-semibold mb-4">Price Elasticity Analysis</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="price"
          stroke="#6B7280"
          fontSize={12}
          tickFormatter={value => formatCurrency(value)}
        />
        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={value => `${value} units`} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white p-3 shadow-lg border rounded-lg">
                <p className="font-medium">Price: {formatCurrency(label)}</p>
                <p>Demand: {payload[0].value} units</p>
                <p>Elasticity: {payload[1].value.toFixed(2)}</p>
              </div>
            );
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="demand" stroke="#0EA5E9" strokeWidth={2} />
        <Line type="monotone" dataKey="elasticity" stroke="#22C55E" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

// Spending Forecast Chart
export const SpendingForecastChart = ({ data }) => (
  <Card className="h-[400px]">
    <h3 className="text-lg font-semibold mb-4">Spending Forecast</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
        <YAxis stroke="#6B7280" fontSize={12} tickFormatter={value => formatCurrency(value)} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white p-3 shadow-lg border rounded-lg">
                <p className="font-medium">{label}</p>
                <p>Historical: {payload[0].value ? formatCurrency(payload[0].value) : 'N/A'}</p>
                <p>Forecast: {payload[1].value ? formatCurrency(payload[1].value) : 'N/A'}</p>
                <p>
                  Confidence:{' '}
                  {payload[2]?.value ? `${(payload[2].value * 100).toFixed(1)}%` : 'N/A'}
                </p>
              </div>
            );
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="historical"
          stroke="#0EA5E9"
          strokeWidth={2}
          dot={{ fill: '#0EA5E9', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#22C55E"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#22C55E', r: 4 }}
        />
        <Line type="monotone" dataKey="confidence" stroke="#EAB308" strokeWidth={1} />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

// Seasonal Pattern Chart
export const SeasonalPatternChart = ({ data }) => (
  <Card className="h-[400px]">
    <h3 className="text-lg font-semibold mb-4">Seasonal Patterns</h3>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
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
                <p>Seasonal Factor: {(payload[0].value * 100).toFixed(1)}%</p>
                <p>Trend: {payload[1].value > 1 ? 'Above Average' : 'Below Average'}</p>
              </div>
            );
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="seasonalFactor"
          stroke="#0EA5E9"
          strokeWidth={2}
          dot={{ fill: '#0EA5E9', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);
