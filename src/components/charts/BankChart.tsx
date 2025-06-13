import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface BankChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title: string;
}

const BankChart: React.FC<BankChartProps> = ({ data, title }) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-foreground mb-4 text-center">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
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
              <span style={{ color: entry.color, fontSize: '12px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BankChart;
