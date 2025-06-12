
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseChart from '@/components/charts/ExpenseChart';
import CategoryChart from '@/components/charts/CategoryChart';
import TrendChart from '@/components/charts/TrendChart';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock data - in a real app this would come from an API
  const analyticsData = {
    totalSpent: 24580,
    monthlyChange: 12.5,
    categoriesSpending: [
      { name: 'Food & Dining', amount: 8450, percentage: 35, color: '#f97316' },
      { name: 'Transportation', amount: 4200, percentage: 17, color: '#3b82f6' },
      { name: 'Groceries', amount: 3800, percentage: 16, color: '#22c55e' },
      { name: 'Entertainment', amount: 2100, percentage: 9, color: '#8b5cf6' },
      { name: 'Other', amount: 6030, percentage: 23, color: '#6b7280' }
    ],
    monthlyTrend: [
      { month: 'Jan', amount: 18500 },
      { month: 'Feb', amount: 22100 },
      { month: 'Mar', amount: 19800 },
      { month: 'Apr', amount: 24580 },
      { month: 'May', amount: 21200 },
      { month: 'Jun', amount: 26300 }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Understand your spending patterns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            {selectedPeriod === 'month' ? 'This Month' : 'This Year'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analyticsData.totalSpent.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                +{analyticsData.monthlyChange}%
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{Math.round(analyticsData.totalSpent / 30).toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">-2.3%</span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Largest Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Food & Dining</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">35% of total</Badge>
              <span className="text-sm text-muted-foreground">₹8,450</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-4">
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Spending Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={analyticsData.monthlyTrend} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryChart data={analyticsData.categoriesSpending} />
              </CardContent>
            </Card>

            {/* Daily Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900">💡 Spending Pattern</h4>
              <p className="text-sm text-blue-700 mt-1">
                You spend 23% more on weekends compared to weekdays. Consider meal planning to reduce food expenses.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900">📈 Good News</h4>
              <p className="text-sm text-green-700 mt-1">
                Your entertainment spending is down 15% this month. You're staying within your budget goals!
              </p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-900">⚠️ Budget Alert</h4>
              <p className="text-sm text-orange-700 mt-1">
                Transportation costs have increased by 30%. Consider using public transport or carpooling.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
