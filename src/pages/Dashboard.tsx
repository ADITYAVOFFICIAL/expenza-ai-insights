
import React, { useState } from 'react';
import { Plus, TrendingUp, Users, Calendar, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import QuickStats from '@/components/QuickStats';
import ExpenseCard from '@/components/ExpenseCard';
import ActivityFeed from '@/components/ActivityFeed';
import AllowanceManager from '@/components/AllowanceManager';
import { Expense } from '@/types/expense';
import { Allowance } from '@/lib/allowanceService';

const Dashboard = () => {
  const [allowances, setAllowances] = useState<Allowance[]>([
    {
      id: '1',
      bankName: 'HDFC Bank',
      amount: 5000,
      frequency: 'monthly',
      nextReceived: '2024-02-01',
      isActive: true,
      userId: 'user1',
      createdAt: '2024-01-01'
    }
  ]);

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

  const handleAddAllowance = (allowance: Omit<Allowance, 'id' | 'createdAt'>) => {
    const newAllowance = {
      ...allowance,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userId: 'user1' // Replace with actual user ID
    };
    setAllowances([...allowances, newAllowance]);
  };

  const handleEditAllowance = (id: string, updatedAllowance: Partial<Allowance>) => {
    setAllowances(allowances.map(a => a.id === id ? { ...a, ...updatedAllowance } : a));
  };

  const handleDeleteAllowance = (id: string) => {
    setAllowances(allowances.filter(a => a.id !== id));
  };

  const handleEditExpense = (expense: Expense) => {
    console.log('Edit expense:', expense);
    // Implement edit functionality
  };

  const handleDeleteExpense = (expenseId: string) => {
    console.log('Delete expense:', expenseId);
    // Implement delete functionality
  };

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
              <ExpenseCard 
                key={expense.id} 
                expense={expense}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>

      {/* Allowance Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AllowanceManager
            allowances={allowances}
            onAdd={handleAddAllowance}
            onEdit={handleEditAllowance}
            onDelete={handleDeleteAllowance}
          />
        </div>

        {/* Category Insights */}
        <div className="lg:col-span-2">
          <Card className="p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Categories This Month</h3>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
