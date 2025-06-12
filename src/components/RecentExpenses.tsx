
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const RecentExpenses = ({ expenses }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': 'bg-orange-100 text-orange-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Shopping': 'bg-purple-100 text-purple-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Bills & Utilities': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-green-100 text-green-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Travel': 'bg-teal-100 text-teal-800',
      'Groceries': 'bg-lime-100 text-lime-800',
      'Gas': 'bg-yellow-100 text-yellow-800',
      'Rent': 'bg-gray-100 text-gray-800',
      'Insurance': 'bg-cyan-100 text-cyan-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="rounded-2xl border-slate-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-slate-800">Recent Activity</CardTitle>
        <p className="text-sm text-slate-600">Latest expense transactions</p>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">💳</span>
            </div>
            <p className="text-slate-500 text-sm">No recent expenses</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 text-sm mb-1">{expense.name}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getCategoryColor(expense.category)} text-xs rounded-full`}>
                      {expense.category}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {format(new Date(expense.date), 'MMM dd')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800">
                    ₹{parseFloat(expense.amount).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentExpenses;
