
import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const SavingsTrackingChart = () => {
  const [viewMode, setViewMode] = React.useState<'weekly' | 'monthly'>('weekly');

  const weeklyData = [
    { period: 'Week 1', saved: 2500, target: 3000, difference: 500 },
    { period: 'Week 2', saved: 3200, target: 3000, difference: -200 },
    { period: 'Week 3', saved: 2800, target: 3000, difference: 200 },
    { period: 'Week 4', saved: 3500, target: 3000, difference: -500 },
    { period: 'Week 5', saved: 2900, target: 3000, difference: 100 },
    { period: 'Week 6', saved: 3800, target: 3000, difference: -800 },
  ];

  const monthlyData = [
    { period: 'Jan', saved: 12000, target: 15000, difference: 3000 },
    { period: 'Feb', saved: 18000, target: 15000, difference: -3000 },
    { period: 'Mar', saved: 14500, target: 15000, difference: 500 },
    { period: 'Apr', saved: 16800, target: 15000, difference: -1800 },
    { period: 'May', saved: 13200, target: 15000, difference: 1800 },
    { period: 'Jun', saved: 19500, target: 15000, difference: -4500 },
  ];

  const currentData = viewMode === 'weekly' ? weeklyData : monthlyData;
  
  const totalSaved = currentData.reduce((sum, item) => sum + item.saved, 0);
  const totalTarget = currentData.reduce((sum, item) => sum + item.target, 0);
  const avgSavings = totalSaved / currentData.length;
  const savingsRate = ((totalSaved / totalTarget) * 100).toFixed(1);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Savings Tracking</CardTitle>
          <Select value={viewMode} onValueChange={(value: 'weekly' | 'monthly') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Track your explicit savings vs targets over time
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Saved</div>
            <div className="text-lg font-bold text-green-600">₹{totalSaved.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Target</div>
            <div className="text-lg font-bold text-blue-600">₹{totalTarget.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Avg {viewMode.slice(0, -2)}ly</div>
            <div className="text-lg font-bold text-purple-600">₹{Math.round(avgSavings).toLocaleString()}</div>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Savings Rate</div>
            <div className="text-lg font-bold text-orange-600">{savingsRate}%</div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="period" 
              className="text-xs" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `₹${value.toLocaleString()}`, 
                name === 'saved' ? 'Actual Saved' : 'Target'
              ]}
              labelClassName="text-sm font-medium"
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="saved" 
              stroke="#10b981" 
              strokeWidth={3}
              name="saved"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#6b7280" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="target"
              dot={{ fill: '#6b7280', strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Performance Indicators */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {currentData.slice(-3).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">{item.period}</div>
                <div className="text-sm text-muted-foreground">
                  ₹{item.saved.toLocaleString()} saved
                </div>
              </div>
              <Badge 
                variant={item.difference > 0 ? "destructive" : "default"}
                className={item.difference > 0 ? "" : "bg-green-500 hover:bg-green-600"}
              >
                {item.difference > 0 ? '-' : '+'}₹{Math.abs(item.difference).toLocaleString()}
              </Badge>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Savings Insights</h4>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <p>• You're averaging ₹{Math.round(avgSavings).toLocaleString()} in {viewMode} savings</p>
            <p>• Your savings rate is {savingsRate}% of your target</p>
            <p>• {totalSaved > totalTarget ? 'Great job! You\'re exceeding your savings goals!' : 'You need to save more to reach your targets'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SavingsTrackingChart;
