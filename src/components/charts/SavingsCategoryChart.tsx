import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SavingsCategoryChartProps {
  data: any[]; // Example: [{ month: 'Jan', food: 100, transport: 50 }, ...]
  categories: string[]; // Example: ['food', 'transport', 'entertainment']
}

const categoryColors: { [key: string]: string } = {
  food: '#ef4444',
  transport: '#3b82f6',
  entertainment: '#10b981',
  shopping: '#f59e0b',
  utilities: '#8b5cf6',
  health: '#ec4899',
  other: '#6b7280',
};

const generateRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

const SavingsCategoryChart: React.FC<SavingsCategoryChartProps> = ({ data, categories }) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending by Category Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data available to display the chart.</p>
        </CardContent>
      </Card>
    );
  }

  const validCategories = categories.filter(catKey => 
    data.some(d => d[catKey] !== undefined && d[catKey] !== null && d[catKey] > 0)
  );


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Spending by Category Over Time</CardTitle>
      </CardHeader>
      <CardContent>
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
              formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
              labelClassName="text-sm font-medium"
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
            />
            <Legend />
            {validCategories.map((catKey) => (
              <Line 
                key={catKey}
                type="monotone" 
                dataKey={catKey}
                stroke={categoryColors[catKey] || generateRandomColor()}
                strokeWidth={2}
                name={catKey.charAt(0).toUpperCase() + catKey.slice(1)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SavingsCategoryChart;
