import React, { useState, useEffect, useCallback } from 'react';
import { Target, Plus, Calendar, TrendingUp, Check, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/appwrite';
import { Goal as GoalType } from '@/types/expense';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, differenceInDays, differenceInCalendarMonths, isBefore, isValid, isEqual } from 'date-fns';

const initialGoalFormData = {
  name: '',
  targetAmountStr: '',
  currentAmountStr: '0',
  targetDate: format(new Date(), 'yyyy-MM-dd'),
  category: 'savings',
};

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [currentEditingGoalId, setCurrentEditingGoalId] = useState<string | null>(null);
  const [goalFormData, setGoalFormData] = useState(initialGoalFormData);

  const [showAddMoneyDialog, setShowAddMoneyDialog] = useState(false);
  const [goalToAddMoneyTo, setGoalToAddMoneyTo] = useState<GoalType | null>(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');

  const fetchGoals = useCallback(async () => {
    if (!user?.$id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await databaseService.getGoals(user.$id);
      const fetchedGoals = response.documents.map((doc: any) => ({
        ...doc,
        targetAmount: Number(doc.targetAmount),
        currentAmount: Number(doc.currentAmount),
        // targetDate is already an ISO string from Appwrite
      })) as GoalType[];
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      toast({ title: 'Error', description: 'Could not fetch goals.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGoalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setGoalFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateMonthlyTarget = (targetAmount: number, currentAmount: number, targetDateISO: string): number => {
    if (!isValid(parseISO(targetDateISO))) return 0;
    const remainingAmount = targetAmount - currentAmount;
    if (remainingAmount <= 0) return 0;

    const target = parseISO(targetDateISO);
    const now = new Date();
    
    if (isBefore(target, now) || isEqual(target, now)) return remainingAmount;

    const monthsRemaining = differenceInCalendarMonths(target, now);
    if (monthsRemaining <= 0) return remainingAmount;

    return Math.max(0, Math.ceil(remainingAmount / monthsRemaining));
  };

  const getDaysLeft = (targetDateISO: string): number => {
    if (!isValid(parseISO(targetDateISO))) return 0;
    const target = parseISO(targetDateISO);
    const now = new Date();
    const days = differenceInDays(target, now);
    return Math.max(0, days);
  };

  const getGoalProgress = (currentAmount: number, targetAmount: number): number => {
    if (targetAmount === 0) return currentAmount > 0 ? 100 : 0;
    return Math.min(100, Math.max(0, (currentAmount / targetAmount) * 100));
  };
  
  const getGoalStatus = (goal: GoalType) => {
    const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
    if (goal.isAchieved) return { label: 'Achieved', color: 'bg-green-500' };
    if (progress >= 100) return { label: 'Completed', color: 'bg-green-500' }; // Technically achieved
    if (progress >= 80) return { label: 'Almost There', color: 'bg-blue-500' };
    if (progress >= 50) return { label: 'On Track', color: 'bg-yellow-500' };
    return { label: 'Needs Attention', color: 'bg-red-500' };
  };

  const handleSubmitGoal = async () => {
    if (!user?.$id) return;
    setProcessing(true);

    const targetAmount = parseFloat(goalFormData.targetAmountStr);
    const currentAmount = isEditingGoal ? parseFloat(goalFormData.currentAmountStr) : (goalFormData.currentAmountStr ? parseFloat(goalFormData.currentAmountStr) : 0);


    if (isNaN(targetAmount) || targetAmount <= 0) {
      toast({ title: 'Invalid Input', description: 'Target amount must be a positive number.', variant: 'destructive' });
      setProcessing(false);
      return;
    }
    if (isNaN(currentAmount) || currentAmount < 0) {
      toast({ title: 'Invalid Input', description: 'Current amount must be a non-negative number.', variant: 'destructive' });
      setProcessing(false);
      return;
    }
     if (!goalFormData.targetDate || !isValid(parseISO(goalFormData.targetDate))) {
      toast({ title: 'Invalid Date', description: 'Please select a valid target date.', variant: 'destructive' });
      setProcessing(false);
      return;
    }

    const goalDataPayload = {
      userId: user.$id,
      name: goalFormData.name,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      targetDate: new Date(goalFormData.targetDate).toISOString(), // Store as ISO
      category: goalFormData.category,
      isAchieved: currentAmount >= targetAmount,
    };

    try {
      if (isEditingGoal && currentEditingGoalId) {
        await databaseService.updateGoal(currentEditingGoalId, goalDataPayload);
        toast({ title: 'Success', description: 'Goal updated successfully.' });
      } else {
        await databaseService.createGoal(goalDataPayload);
        toast({ title: 'Success', description: 'Goal created successfully.' });
      }
      setShowGoalDialog(false);
      fetchGoals();
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast({ title: 'Error', description: 'Could not save goal.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsEditingGoal(false);
    setCurrentEditingGoalId(null);
    setGoalFormData(initialGoalFormData);
    setShowGoalDialog(true);
  };

  const handleOpenEditDialog = (goal: GoalType) => {
    setIsEditingGoal(true);
    setCurrentEditingGoalId(goal.$id!);
    setGoalFormData({
      name: goal.name,
      targetAmountStr: String(goal.targetAmount),
      currentAmountStr: String(goal.currentAmount),
      targetDate: format(parseISO(goal.targetDate), 'yyyy-MM-dd'),
      category: goal.category || 'savings',
    });
    setShowGoalDialog(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    setProcessing(true);
    try {
      await databaseService.deleteGoal(goalId);
      toast({ title: 'Success', description: 'Goal deleted successfully.' });
      fetchGoals();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      toast({ title: 'Error', description: 'Could not delete goal.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleOpenAddMoneyDialog = (goal: GoalType) => {
    setGoalToAddMoneyTo(goal);
    setAddMoneyAmount('');
    setShowAddMoneyDialog(true);
  };

  const handleAddMoneySubmit = async () => {
    if (!goalToAddMoneyTo || !user?.$id) return;
    setProcessing(true);
    const amountToAdd = parseFloat(addMoneyAmount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid positive amount.', variant: 'destructive' });
      setProcessing(false);
      return;
    }

    const newCurrentAmount = goalToAddMoneyTo.currentAmount + amountToAdd;
    const updatedGoalData = {
      currentAmount: newCurrentAmount,
      isAchieved: newCurrentAmount >= goalToAddMoneyTo.targetAmount,
    };

    try {
      await databaseService.updateGoal(goalToAddMoneyTo.$id!, updatedGoalData);
      toast({ title: 'Success', description: 'Money added to goal successfully.' });
      setShowAddMoneyDialog(false);
      fetchGoals();
    } catch (error) {
      console.error('Failed to add money to goal:', error);
      toast({ title: 'Error', description: 'Could not add money to goal.', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };


  const achievedGoalsCount = goals.filter(g => g.isAchieved).length;
  const totalGoalAmount = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSavedAmount = goals.reduce((acc, g) => acc + g.currentAmount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Track your financial goals and savings targets</p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"><Check className="w-5 h-5" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Achieved Goals</div>
                <div className="text-xl font-bold">{achievedGoalsCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"><Target className="w-5 h-5" /></div>
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
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"><TrendingUp className="w-5 h-5" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Total Target</div>
                <div className="text-xl font-bold">₹{totalGoalAmount.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"><TrendingUp className="w-5 h-5" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Total Saved</div>
                <div className="text-xl font-bold">₹{totalSavedAmount.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      {goals.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-1">No Goals Yet</h3>
            <p className="text-sm">Start planning for your future by adding a new financial goal.</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {goals.map((goal) => {
          const status = getGoalStatus(goal);
          const daysLeft = getDaysLeft(goal.targetDate);
          const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
          const monthlyTarget = calculateMonthlyTarget(goal.targetAmount, goal.currentAmount, goal.targetDate);

          return (
            <Card key={goal.$id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{goal.name}</CardTitle>
                  <Badge className={`${status.color} text-white`}>{status.label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Progress</span>
                      <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><div className="text-sm text-muted-foreground">Current</div><div className="font-semibold">₹{goal.currentAmount.toLocaleString()}</div></div>
                    <div><div className="text-sm text-muted-foreground">Target</div><div className="font-semibold">₹{goal.targetAmount.toLocaleString()}</div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Days Left</div>
                      <div className="font-semibold flex items-center gap-1 "><Calendar className="w-4 h-4 dark:text-foreground" />{daysLeft}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Monthly Target</div>
                      <div className="font-semibold">₹{monthlyTarget.toLocaleString()}</div>
                    </div>
                  </div>
                  <div><Badge variant="outline" className="capitalize">{goal.category}</Badge></div>
                  
                  {/* Action buttons row - always present */}
                  <div className="flex gap-2 pt-2 border-t items-center">
                    {!goal.isAchieved && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenAddMoneyDialog(goal)} disabled={processing}>
                        Add Money
                      </Button>
                    )}
                    {/* Spacer to push Edit/Delete to the right if Add Money is not shown */}
                    {goal.isAchieved && <div className="flex-1"></div>} 
                    
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(goal)} disabled={processing} className="h-9 w-9">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.$id!)} disabled={processing} className="h-9 w-9 text-destructive hover:text-destructive/90">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {goal.isAchieved && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-800 dark:text-green-200 text-sm font-medium mt-2">
                      🎉 Congratulations! Goal achieved!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create/Edit Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-foreground">{isEditingGoal ? 'Edit' : 'Create New'} Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 dark:text-foreground">
            <div><Label htmlFor="name">Goal Name</Label><Input id="name" name="name" value={goalFormData.name} onChange={handleInputChange} placeholder="e.g., Emergency Fund" /></div>
            <div><Label htmlFor="targetAmountStr">Target Amount (₹)</Label><Input id="targetAmountStr" name="targetAmountStr" type="number" value={goalFormData.targetAmountStr} onChange={handleInputChange} placeholder="100000" /></div>
            <div><Label htmlFor="currentAmountStr">Current Amount (₹)</Label><Input id="currentAmountStr" name="currentAmountStr" type="number" value={goalFormData.currentAmountStr} onChange={handleInputChange} disabled={!isEditingGoal} /></div>
            <div><Label htmlFor="targetDate">Target Date</Label><Input id="targetDate" name="targetDate" type="date" value={goalFormData.targetDate} onChange={handleInputChange} /></div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" value={goalFormData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem><SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="shopping">Shopping</SelectItem><SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="education">Education</SelectItem><SelectItem value="debt_payment">Debt Payment</SelectItem><SelectItem value="major_purchase">Major Purchase</SelectItem><SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={processing} className="dark:text-foreground">Cancel</Button></DialogClose>
            <Button type="submit" onClick={handleSubmitGoal} disabled={processing}>{processing ? (isEditingGoal ? 'Saving...' : 'Creating...') : (isEditingGoal ? 'Save Changes' : 'Create Goal')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Money Dialog */}
      <Dialog open={showAddMoneyDialog} onOpenChange={setShowAddMoneyDialog}>
        <DialogContent className='dark:text-foreground'>
          <DialogHeader><DialogTitle>Add Money to "{goalToAddMoneyTo?.name}"</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label htmlFor="addMoneyAmount">Amount to Add (₹)</Label><Input id="addMoneyAmount" type="number" value={addMoneyAmount} onChange={(e) => setAddMoneyAmount(e.target.value)} placeholder="5000" /></div>
            {goalToAddMoneyTo && (
                <div className="text-sm text-muted-foreground">
                    Current: ₹{goalToAddMoneyTo.currentAmount.toLocaleString()} / Target: ₹{goalToAddMoneyTo.targetAmount.toLocaleString()}
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={processing}>Cancel</Button></DialogClose>
            <Button type="submit" onClick={handleAddMoneySubmit} disabled={processing}>{processing ? 'Adding...' : 'Add Money'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

 {/* Finance Tips */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Finance Tips</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Budgeting Basics</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">Regularly review your spending and create a budget. Knowing where your money goes is the first step to financial control.</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">💰 Emergency Fund</h4>
              <p className="text-sm text-green-800 dark:text-green-200">Aim to save at least 3-6 months of living expenses in an easily accessible emergency fund. This can help you handle unexpected costs without derailing your goals.</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">📈 Smart Investing</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">Consider long-term investment options that match your risk tolerance. Even small, regular investments can grow significantly over time.</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">💳 Manage Debt Wisely</h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">Prioritize paying off high-interest debt. Explore strategies like the debt snowball or avalanche method to accelerate your debt repayment journey.</p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">🛡️ Protect Your Assets</h4>
              <p className="text-sm text-red-800 dark:text-red-200">Ensure you have adequate insurance coverage (health, life, property) to protect yourself and your family from unforeseen financial hardships.</p>
            </div>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <h4 className="font-medium text-indigo-900 dark:text-indigo-100 mb-2">🔄 Automate Savings</h4>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">Set up automatic transfers to your savings and investment accounts each payday. This "pay yourself first" approach makes saving effortless.</p>
            </div>
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
              <h4 className="font-medium text-pink-900 dark:text-pink-100 mb-2">🧐 Review Regularly</h4>
              <p className="text-sm text-pink-800 dark:text-pink-200">Periodically review your financial plan, goals, and investments. Life changes, and your financial strategy should adapt accordingly.</p>
            </div>
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
              <h4 className="font-medium text-teal-900 dark:text-teal-100 mb-2">🎓 Continuous Learning</h4>
              <p className="text-sm text-teal-800 dark:text-teal-200">Stay informed about personal finance topics. The more you learn, the better equipped you'll be to make sound financial decisions.</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/20 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">🎯 Set Clear Financial Goals</h4>
              <p className="text-sm text-gray-800 dark:text-gray-200">Define specific, measurable, achievable, relevant, and time-bound (SMART) financial goals. This provides direction and motivation for your financial journey.</p>
            </div>
            <div className="p-4 bg-lime-50 dark:bg-lime-900/20 rounded-lg">
              <h4 className="font-medium text-lime-900 dark:text-lime-100 mb-2">✂️ Cut Unnecessary Expenses</h4>
              <p className="text-sm text-lime-800 dark:text-lime-200">Identify non-essential spending and look for ways to reduce it. Small cutbacks can add up to significant savings over time.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Goals;
