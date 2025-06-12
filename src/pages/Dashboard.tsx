
import React from 'react';
import { Plus, TrendingUp, Users, Calendar, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import QuickStats from '@/components/QuickStats';
import ExpenseCard from '@/components/ExpenseCard';
import ActivityFeed from '@/components/ActivityFeed';
import BankChart from '@/components/charts/BankChart';
import SavingsCategoryChart from '@/components/charts/SavingsCategoryChart';
import { Expense } from '@/types/expense';

const Dashboard = () => {
  // Mock data for bank charts
  const expenseByBank = [
    { name: 'HDFC Bank', value: 25000, color: '#3b82f6' },
    { name: 'SBI', value: 18000, color: '#10b981' },
    { name: 'ICICI Bank', value: 12000, color: '#f59e0b' },
    { name: 'Axis Bank', value: 8000, color: '#ef4444' }
  ];

  const allowanceByBank = [
    { name: 'HDFC Bank', value: 50000, color: '#3b82f6' },
    { name: 'SBI', value: 35000, color: '#10b981' },
    { name: 'ICICI Bank', value: 25000, color: '#f59e0b' },
    { name: 'Axis Bank', value: 15000, color: '#ef4444' }
  ];

  // Mock data - will be replaced with real data later
  const recentExpenses: Expense[] = [
    {
      id: '1',
      name: 'Lunch at Café Coffee Day',
      amount: 450,
      category: 'food',
      bank: 'HDFC Bank',
      paymentApp: 'Google Pay',
      date: '2024-01-15',
      notes: 'Team lunch',
      paidBy: 'You',
      splitBetween: ['You', 'John', 'Sarah'],
      isSettled: false,
      currency: 'INR'
    },
    {
      id: '2',
      name: 'Uber Ride',
      amount: 180,
      category: 'transport',
      bank: 'SBI',
      paymentApp: 'Paytm',
      date: '2024-01-14',
      paidBy: 'You',
      splitBetween: ['You'],
      isSettled: true,
      currency: 'INR'
    },
    {
      id: '3',
      name: 'Grocery Shopping',
      amount: 2340,
      category: 'groceries',
      bank: 'ICICI Bank',
      paymentApp: 'UPI',
      date: '2024-01-13',
      notes: 'Monthly groceries',
      paidBy: 'You',
      splitBetween: ['You', 'Spouse'],
      isSettled: true,
      currency: 'INR'
    }
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Track your expenses and manage your finances</p>
        </div>
        <Link to="/add-expense">
          <Button className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { icon: Plus, label: 'Quick Add', subtitle: 'Add expense', href: '/add-expense', color: 'blue' },
          { icon: TrendingUp, label: 'Analytics', subtitle: 'View insights', href: '/analytics', color: 'green' },
          { icon: Users, label: 'Groups', subtitle: 'Manage splits', href: '/groups', color: 'purple' },
          { icon: Calendar, label: 'Recurring', subtitle: 'Auto expenses', href: '/recurring', color: 'orange' }
        ].map((action, index) => (
          <Link key={index} to={action.href}>
            <Card className="p-3 lg:p-4 hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3">
                <div className={`p-2 rounded-lg bg-${action.color}-100 text-${action.color}-600 group-hover:bg-${action.color}-600 group-hover:text-white transition-colors`}>
                  <action.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <div className="text-center lg:text-left">
                  <h3 className="font-medium text-foreground text-sm lg:text-base">{action.label}</h3>
                  <p className="text-xs lg:text-sm text-muted-foreground">{action.subtitle}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-4 lg:p-6">
          <BankChart data={expenseByBank} title="Expenses by Bank" />
        </Card>
        
        <Card className="p-4 lg:p-6">
          <BankChart data={allowanceByBank} title="Allowance by Bank" />
        </Card>
        
        <div className="xl:col-span-2">
          <Card className="p-4 lg:p-6">
            <SavingsCategoryChart />
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-foreground">Recent Expenses</h2>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Category Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Categories</h3>
          <div className="space-y-3">
            {[
              { name: 'Food & Dining', amount: 8450, percentage: 35, color: 'bg-orange-500' },
              { name: 'Transportation', amount: 4200, percentage: 17, color: 'bg-blue-500' },
              { name: 'Groceries', amount: 3800, percentage: 16, color: 'bg-green-500' },
              { name: 'Entertainment', amount: 2100, percentage: 9, color: 'bg-purple-500' }
            ].map((category, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{category.name}</span>
                    <span className="text-sm text-muted-foreground">₹{category.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${category.color}`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                  {category.percentage}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Trend</h3>
          <div className="flex items-end justify-between h-32 gap-2">
            {[65, 78, 82, 45, 92, 88, 76].map((height, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-muted-foreground">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
