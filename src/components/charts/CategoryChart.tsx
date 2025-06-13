import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryChartProps {
  data: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="amount"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
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
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => (
            <span style={{ color: entry.color }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
