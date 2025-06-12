
import React from 'react';
import { RotateCcw, Plus, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const Recurring = () => {
  // Mock recurring expenses data
  const recurringExpenses = [
    {
      id: '1',
      name: 'Netflix Subscription',
      amount: 199,
      category: 'entertainment',
      frequency: 'monthly',
      nextDate: '2024-02-01',
      isActive: true,
      lastExecuted: '2024-01-01'
    },
    {
      id: '2',
      name: 'Rent',
      amount: 25000,
      category: 'rent',
      frequency: 'monthly',
      nextDate: '2024-02-01',
      isActive: true,
      lastExecuted: '2024-01-01'
    },
    {
      id: '3',
      name: 'Gym Membership',
      amount: 2000,
      category: 'health',
      frequency: 'monthly',
      nextDate: '2024-02-15',
      isActive: false,
      lastExecuted: '2023-12-15'
    },
    {
      id: '4',
      name: 'Internet Bill',
      amount: 1200,
      category: 'bills',
      frequency: 'monthly',
      nextDate: '2024-02-05',
      isActive: true,
      lastExecuted: '2024-01-05'
    }
  ];

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      daily: 'bg-red-100 text-red-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-green-100 text-green-800',
      yearly: 'bg-purple-100 text-purple-800'
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recurring Expenses</h1>
          <p className="text-muted-foreground">Manage your automatic and recurring payments</p>
        </div>
        <Button className="gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Recurring
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Recurring</p>
                <p className="text-xl font-bold">{recurringExpenses.filter(e => e.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Total</p>
                <p className="text-xl font-bold">
                  ₹{recurringExpenses
                    .filter(e => e.isActive && e.frequency === 'monthly')
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Pause className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paused</p>
                <p className="text-xl font-bold">{recurringExpenses.filter(e => !e.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Payment</p>
                <p className="text-lg font-bold">2 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Expenses List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Recurring Expenses</h2>
        <div className="space-y-3">
          {recurringExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      <Switch checked={expense.isActive} />
                      <div>
                        <h3 className="font-semibold">{expense.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={getFrequencyColor(expense.frequency)}
                          >
                            {expense.frequency}
                          </Badge>
                          <span className="text-sm text-muted-foreground capitalize">
                            {expense.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold">₹{expense.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      Next: {new Date(expense.nextDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recurring;
