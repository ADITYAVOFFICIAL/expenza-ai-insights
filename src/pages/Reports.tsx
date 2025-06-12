
import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');

  // Mock data
  const expensesByCategory = [
    { category: 'Food', amount: 12500, percentage: 31.25, color: '#ef4444' },
    { category: 'Transport', amount: 8200, percentage: 20.5, color: '#3b82f6' },
    { category: 'Shopping', amount: 6800, percentage: 17, color: '#10b981' },
    { category: 'Bills', amount: 5400, percentage: 13.5, color: '#f59e0b' },
    { category: 'Entertainment', amount: 4100, percentage: 10.25, color: '#8b5cf6' },
    { category: 'Others', amount: 3000, percentage: 7.5, color: '#6b7280' },
  ];

  const monthlyComparison = [
    { month: 'Oct', thisYear: 35000, lastYear: 32000 },
    { month: 'Nov', thisYear: 38000, lastYear: 35000 },
    { month: 'Dec', thisYear: 42000, lastYear: 39000 },
    { month: 'Jan', thisYear: 40000, lastYear: 37000 },
  ];

  const dailyExpenses = [
    { date: '01', amount: 1200 }, { date: '02', amount: 800 }, { date: '03', amount: 2400 },
    { date: '04', amount: 600 }, { date: '05', amount: 1800 }, { date: '06', amount: 400 },
    { date: '07', amount: 3200 }, { date: '08', amount: 900 }, { date: '09', amount: 1500 },
    { date: '10', amount: 700 }, { date: '11', amount: 2100 }, { date: '12', amount: 1300 },
    { date: '13', amount: 1600 }, { date: '14', amount: 800 }, { date: '15', amount: 2200 },
  ];

  const topExpenses = [
    { name: 'Grocery Shopping', amount: 3200, date: '2024-01-15', category: 'Food' },
    { name: 'Fuel', amount: 2800, date: '2024-01-14', category: 'Transport' },
    { name: 'Restaurant Bill', amount: 2400, date: '2024-01-13', category: 'Food' },
    { name: 'Online Shopping', amount: 2100, date: '2024-01-12', category: 'Shopping' },
    { name: 'Movie Tickets', amount: 1800, date: '2024-01-11', category: 'Entertainment' },
  ];

  const bankWiseExpenses = [
    { bank: 'HDFC Bank', amount: 18500, transactions: 24 },
    { bank: 'SBI', amount: 12300, transactions: 18 },
    { bank: 'ICICI Bank', amount: 8700, transactions: 12 },
    { bank: 'Axis Bank', amount: 5500, transactions: 8 },
  ];

  const paymentAppUsage = [
    { app: 'Google Pay', amount: 15200, count: 32 },
    { app: 'PhonePe', amount: 12800, count: 28 },
    { app: 'Paytm', amount: 8900, count: 19 },
    { app: 'BHIM UPI', amount: 6100, count: 15 },
    { app: 'Net Banking', amount: 3000, count: 6 },
  ];

  const exportOptions = [
    { label: 'Excel (.xlsx)', value: 'xlsx', icon: FileText },
    { label: 'PDF Report', value: 'pdf', icon: FileText },
    { label: 'CSV Data', value: 'csv', icon: FileText },
  ];

  const handleExport = (format: string) => {
    // Mock export functionality
    console.log(`Exporting report in ${format} format`);
    // Here you would implement actual export logic
  };

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Detailed financial reports and insights</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="last3Months">Last 3 Months</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="bills">Bills</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Banks</SelectItem>
                <SelectItem value="hdfc">HDFC Bank</SelectItem>
                <SelectItem value="sbi">SBI</SelectItem>
                <SelectItem value="icici">ICICI Bank</SelectItem>
                <SelectItem value="axis">Axis Bank</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={handleExport}>
              <SelectTrigger>
                <SelectValue placeholder="Export Report" />
              </SelectTrigger>
              <SelectContent>
                {exportOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
                <div className="text-xl font-bold">₹45,000</div>
                <div className="text-xs text-red-600">+12% from last month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Daily</div>
                <div className="text-xl font-bold">₹1,500</div>
                <div className="text-xs text-blue-600">-5% from last month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Transactions</div>
                <div className="text-xl font-bold">87</div>
                <div className="text-xs text-green-600">+8% from last month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days Tracked</div>
                <div className="text-xl font-bold">30</div>
                <div className="text-xs text-purple-600">Current month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {expensesByCategory.map((category, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="truncate">{category.category}</span>
                  <span className="ml-auto">{category.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `₹${value.toLocaleString()}`, 
                    name === 'thisYear' ? 'This Year' : 'Last Year'
                  ]}
                />
                <Bar dataKey="lastYear" fill="#94a3b8" name="lastYear" />
                <Bar dataKey="thisYear" fill="#3b82f6" name="thisYear" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Expenses Trend */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Daily Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topExpenses.map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{expense.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{expense.date}</span>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{expense.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bank-wise Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank-wise Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bankWiseExpenses.map((bank, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{bank.bank}</div>
                    <div className="text-sm text-muted-foreground">
                      {bank.transactions} transactions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{bank.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment App Usage */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Payment App Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentAppUsage.map((app, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-medium">{app.app}</div>
                  <div className="text-2xl font-bold">₹{app.amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">{app.count} transactions</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
