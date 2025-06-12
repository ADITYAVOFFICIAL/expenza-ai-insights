
import React, { useState } from 'react';
import { Target, Plus, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Goals = () => {
  // Mock goals data
  const goals = [
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 67000,
      targetDate: '2024-12-31',
      category: 'savings',
      isAchieved: false
    },
    {
      id: '2',
      name: 'Vacation to Europe',
      targetAmount: 150000,
      currentAmount: 89000,
      targetDate: '2024-08-15',
      category: 'travel',
      isAchieved: false
    },
    {
      id: '3',
      name: 'New Laptop',
      targetAmount: 80000,
      currentAmount: 80000,
      targetDate: '2024-03-01',
      category: 'tech',
      isAchieved: true
    },
    {
      id: '4',
      name: 'Monthly Food Budget',
      targetAmount: 15000,
      currentAmount: 12500,
      targetDate: '2024-01-31',
      category: 'food',
      isAchieved: false
    }
  ];

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      savings: 'bg-green-500',
      travel: 'bg-blue-500',
      tech: 'bg-purple-500',
      food: 'bg-orange-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground">Track your financial goals and milestones</p>
        </div>
        <Button className="gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-xl font-bold">{goals.filter(g => !g.isAchieved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-xl font-bold">{goals.filter(g => g.isAchieved).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Target</p>
                <p className="text-xl font-bold">₹{goals.reduce((sum, goal) => sum + goal.targetAmount, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-xl font-bold">
                  {Math.round(goals.reduce((sum, goal) => sum + calculateProgress(goal.currentAmount, goal.targetAmount), 0) / goals.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            
            return (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(goal.category)}`}></div>
                        <span className="text-sm text-muted-foreground capitalize">{goal.category}</span>
                        {goal.isAchieved && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Achieved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{progress.toFixed(0)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">
                        ₹{goal.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-sm font-medium">
                        ₹{goal.targetAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Target Date and Days Remaining */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Target Date</p>
                      <p className="text-sm font-medium">
                        {new Date(goal.targetDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Days Remaining</p>
                      <p className={`text-sm font-medium ${daysRemaining < 30 ? 'text-red-600' : 'text-green-600'}`}>
                        {goal.isAchieved ? 'Completed' : `${daysRemaining} days`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit Goal
                    </Button>
                    {!goal.isAchieved && (
                      <Button size="sm" className="flex-1">
                        Add Money
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Goals;
