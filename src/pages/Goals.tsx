
import React, { useState } from 'react';
import { Target, Plus, Calendar, TrendingUp, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Goals = () => {
  const [goals, setGoals] = useState([
    {
      id: '1',
      name: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 65000,
      targetDate: '2024-06-30',
      category: 'savings',
      isAchieved: false,
      monthlyTarget: 10000,
      progress: 65
    },
    {
      id: '2',
      name: 'Vacation to Europe',
      targetAmount: 150000,
      currentAmount: 45000,
      targetDate: '2024-12-31',
      category: 'travel',
      isAchieved: false,
      monthlyTarget: 15000,
      progress: 30
    },
    {
      id: '3',
      name: 'New Laptop',
      targetAmount: 80000,
      currentAmount: 80000,
      targetDate: '2024-03-15',
      category: 'shopping',
      isAchieved: true,
      monthlyTarget: 0,
      progress: 100
    },
    {
      id: '4',
      name: 'Investment Portfolio',
      targetAmount: 200000,
      currentAmount: 125000,
      targetDate: '2024-08-30',
      category: 'investment',
      isAchieved: false,
      monthlyTarget: 20000,
      progress: 62.5
    }
  ]);

  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    category: 'savings'
  });

  const handleCreateGoal = () => {
    const goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      isAchieved: false,
      monthlyTarget: calculateMonthlyTarget(parseFloat(newGoal.targetAmount), newGoal.targetDate),
      progress: 0
    };
    setGoals([...goals, goal]);
    setNewGoal({ name: '', targetAmount: '', targetDate: '', category: 'savings' });
    setShowCreateGoal(false);
  };

  const calculateMonthlyTarget = (targetAmount: number, targetDate: string) => {
    const monthsLeft = Math.max(1, Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)));
    return Math.ceil(targetAmount / monthsLeft);
  };

  const getGoalStatus = (goal: any) => {
    if (goal.isAchieved) return { label: 'Achieved', color: 'bg-green-500' };
    if (goal.progress >= 80) return { label: 'Almost There', color: 'bg-blue-500' };
    if (goal.progress >= 50) return { label: 'On Track', color: 'bg-yellow-500' };
    return { label: 'Needs Attention', color: 'bg-red-500' };
  };

  const getDaysLeft = (targetDate: string) => {
    const days = Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const achievedGoals = goals.filter(g => g.isAchieved).length;
  const totalGoalAmount = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Track your financial goals and savings targets</p>
        </div>
        <Dialog open={showCreateGoal} onOpenChange={setShowCreateGoal}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="goalName">Goal Name</Label>
                <Input
                  id="goalName"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                />
              </div>
              <div>
                <Label htmlFor="targetAmount">Target Amount (₹)</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="100000"
                />
              </div>
              <div>
                <Label htmlFor="targetDate">Target Date</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Achieved Goals</div>
                <div className="text-xl font-bold">{achievedGoals}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Goals</div>
                <div className="text-xl font-bold">{goals.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Target</div>
                <div className="text-xl font-bold">₹{(totalGoalAmount / 1000).toFixed(0)}k</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Saved</div>
                <div className="text-xl font-bold">₹{(totalSaved / 1000).toFixed(0)}k</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {goals.map((goal) => {
          const status = getGoalStatus(goal);
          const daysLeft = getDaysLeft(goal.targetDate);
          
          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  <Badge className={`${status.color} text-white`}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{goal.progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>

                  {/* Amount Progress */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Current</div>
                      <div className="font-semibold">₹{goal.currentAmount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Target</div>
                      <div className="font-semibold">₹{goal.targetAmount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Time and Monthly Target */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Days Left</div>
                      <div className="font-semibold flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {daysLeft}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Monthly Target</div>
                      <div className="font-semibold">₹{goal.monthlyTarget.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <Badge variant="outline" className="capitalize">
                      {goal.category}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  {!goal.isAchieved && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Add Money
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit Goal
                      </Button>
                    </div>
                  )}

                  {/* Achievement Message */}
                  {goal.isAchieved && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-green-800 dark:text-green-200 text-sm font-medium">
                        🎉 Congratulations! Goal achieved!
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Goal Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">📈 Optimization Tip</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Based on your spending pattern, you can increase your Emergency Fund contribution by ₹2,000/month by reducing dining out expenses.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">💡 New Goal Suggestion</h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Consider setting up a "Health Insurance Premium" goal of ₹25,000 for next year's premium payment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;
