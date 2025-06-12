
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SavingsCategoryChart = () => {
  const data = [
    { month: 'Jan', food: 2000, transport: 1500, entertainment: 800 },
    { month: 'Feb', food: 1800, transport: 1300, entertainment: 600 },
    { month: 'Mar', food: 1600, transport: 1100, entertainment: 400 },
    { month: 'Apr', food: 1400, transport: 900, entertainment: 200 },
    { month: 'May', food: 1200, transport: 700, entertainment: 100 },
    { month: 'Jun', food: 1000, transport: 500, entertainment: 50 },
  ];

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-foreground mb-4">Savings by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]}
            labelClassName="text-sm font-medium"
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Line 
            type="monotone" 
            dataKey="food" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Food"
          />
          <Line 
            type="monotone" 
            dataKey="transport" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Transport"
          />
          <Line 
            type="monotone" 
            dataKey="entertainment" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Entertainment"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SavingsCategoryChart;
