
import React, { useState } from 'react';
import { TrendingUp, Calendar, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import BankChart from '@/components/charts/BankChart';
import SavingsCategoryChart from '@/components/charts/SavingsCategoryChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Analytics = () => {
  const [timeFilter, setTimeFilter] = useState('thisMonth');
  
  // Mock data
  const monthlyTrends = [
    { month: 'Jan', expenses: 15000, income: 50000, savings: 35000 },
    { month: 'Feb', expenses: 18000, income: 50000, savings: 32000 },
    { month: 'Mar', expenses: 16500, income: 55000, savings: 38500 },
    { month: 'Apr', expenses: 19000, income: 55000, savings: 36000 },
    { month: 'May', expenses: 17500, income: 60000, savings: 42500 },
    { month: 'Jun', expenses: 20000, income: 60000, savings: 40000 },
  ];

  const categorySpending = [
    { category: 'Food', amount: 8500, budget: 10000, percentage: 85 },
    { category: 'Transport', amount: 4200, budget: 5000, percentage: 84 },
    { category: 'Shopping', amount: 3800, budget: 4000, percentage: 95 },
    { category: 'Bills', amount: 2100, budget: 2500, percentage: 84 },
    { category: 'Entertainment', amount: 1800, budget: 2000, percentage: 90 },
  ];

  const dailySpending = [
    { day: '1', amount: 450 }, { day: '2', amount: 0 }, { day: '3', amount: 850 },
    { day: '4', amount: 300 }, { day: '5', amount: 1200 }, { day: '6', amount: 0 },
    { day: '7', amount: 600 }, { day: '8', amount: 400 }, { day: '9', amount: 750 },
    { day: '10', amount: 200 }, { day: '11', amount: 900 }, { day: '12', amount: 0 },
    { day: '13', amount: 1100 }, { day: '14', amount: 300 }, { day: '15', amount: 650 },
  ];

  const bankData = [
    { name: 'HDFC Bank', value: 25000, color: '#3b82f6' },
    { name: 'SBI', value: 18000, color: '#10b981' },
    { name: 'ICICI Bank', value: 12000, color: '#f59e0b' },
    { name: 'Axis Bank', value: 8000, color: '#ef4444' }
  ];

  const allowanceData = [
    { name: 'HDFC Bank', value: 50000, color: '#3b82f6' },
    { name: 'SBI', value: 35000, color: '#10b981' },
    { name: 'ICICI Bank', value: 25000, color: '#f59e0b' },
    { name: 'Axis Bank', value: 15000, color: '#ef4444' }
  ];

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Insights into your spending patterns</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: 'Total Spent', value: '₹63,400', change: '+12%', color: 'text-red-600' },
          { label: 'Total Income', value: '₹3,30,000', change: '+8%', color: 'text-green-600' },
          { label: 'Savings', value: '₹2,66,600', change: '+15%', color: 'text-blue-600' },
          { label: 'Avg Daily', value: '₹2,113', change: '-3%', color: 'text-orange-600' }
        ].map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4 lg:p-6">
              <div className="text-xs lg:text-sm text-muted-foreground">{metric.label}</div>
              <div className="text-lg lg:text-2xl font-bold">{metric.value}</div>
              <div className={`text-xs lg:text-sm ${metric.color}`}>{metric.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Bank Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expenses by Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <BankChart data={bankData} title="" />
          </CardContent>
        </Card>

        {/* Bank Allowance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Allowance by Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <BankChart data={allowanceData} title="" />
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Category Budget Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categorySpending.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.category}</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">₹{category.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">of ₹{category.budget.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        category.percentage > 90 ? 'bg-red-500' : 
                        category.percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{category.percentage}% used</span>
                    <span>₹{(category.budget - category.amount).toLocaleString()} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Spending Pattern */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Daily Spending Pattern (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailySpending}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Savings Category Chart */}
        <Card className="xl:col-span-2">
          <CardContent className="p-6">
            <SavingsCategoryChart />
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Spending Pattern Analysis</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Your food expenses have increased by 15% this month. Consider meal planning to reduce dining out costs by ₹2,000/month.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">🎯 Savings Opportunity</h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                You're on track to save ₹40,000 this month! Consider investing 60% in SIP and keeping 40% in emergency fund.
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">⚠️ Budget Alert</h4>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Shopping category is at 95% of budget. Consider postponing non-essential purchases until next month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
