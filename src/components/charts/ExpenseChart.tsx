
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExpenseChart = () => {
  // Mock daily expense data
  const dailyData = [
    { day: 'Mon', amount: 850 },
    { day: 'Tue', amount: 1200 },
    { day: 'Wed', amount: 650 },
    { day: 'Thu', amount: 900 },
    { day: 'Fri', amount: 1400 },
    { day: 'Sat', amount: 2100 },
    { day: 'Sun', amount: 1800 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={dailyData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="day" 
          className="text-xs"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
          labelClassName="text-sm font-medium"
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        <Bar 
          dataKey="amount" 
          fill="#10b981" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
