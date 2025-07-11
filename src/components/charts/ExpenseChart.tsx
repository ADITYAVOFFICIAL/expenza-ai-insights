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
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))', // General text color for the tooltip box
            }}
            itemStyle={{ color: 'hsl(var(--foreground))' }} // Styles the value part, e.g., "₹21,024"
            labelStyle={{ color: 'hsl(var(--foreground))' }} // Styles the label part, e.g., "Amount"
          />
        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ExpenseChart;
