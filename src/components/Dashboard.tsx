
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import ExpenseList from './ExpenseList';
import QuickStats from './QuickStats';
import RecentExpenses from './RecentExpenses';
import SavingsChart from './SavingsChart';

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalBalance, setTotalBalance] = useState(5240.50);
  const [monthlySpent, setMonthlySpent] = useState(1850.30);
  const [savings, setSavings] = useState(890.20);

  // Load expenses from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenza-expenses');
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses);
      setExpenses(parsedExpenses);
      
      // Calculate totals
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTotal = parsedExpenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === currentYear;
        })
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      
      setMonthlySpent(monthlyTotal);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Welcome back!</h1>
          <p className="text-slate-600 mt-1">Here's your financial overview for today</p>
        </div>
        <Link to="/add-expense">
          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-700 text-sm font-medium">Total Balance</p>
                <p className="text-2xl font-bold text-emerald-800">₹{totalBalance.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-orange-800">₹{monthlySpent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Savings</p>
                <p className="text-2xl font-bold text-blue-800">₹{savings.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SavingsChart expenses={expenses} />
        </div>
        <div>
          <RecentExpenses expenses={expenses.slice(0, 5)} />
        </div>
      </div>

      {/* Recent Expenses */}
      <ExpenseList expenses={expenses} setExpenses={setExpenses} />
    </div>
  );
};

export default Dashboard;
