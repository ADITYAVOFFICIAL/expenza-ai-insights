import React, { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, Users, Calendar, BarChart3, Target, CreditCard, FileText, Shield, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuickStats, { QuickStatProps } from '@/components/QuickStats';
import ExpenseCard from '@/components/ExpenseCard';
import ActivityFeed, { ActivityItem } from '@/components/ActivityFeed';
import AllowanceManager from '@/components/AllowanceManager';
import { Expense, RecurringExpense } from '@/types/expense'; // Added RecurringExpense
import { Allowance, AllowanceData } from '@/lib/allowanceService'; // Ensure AllowanceData is exported or defined
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, COLLECTIONS } from '@/lib/appwrite';
import { toast } from '@/hooks/use-toast';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, isSameMonth, isBefore } from 'date-fns'; // Added isSameMonth, isBefore
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ExpenseForm from '@/components/ExpenseForm';
import { Allowance } from '@/lib/allowanceService';
import banksData from '@/data/banks.json';
import { GenericDocData } from '@/lib/appwrite';

const quickActions = [
  { icon: Plus, label: 'Add Expense', subtitle: 'Log a new transaction', href: '/add-expense' },
  { icon: BarChart3, label: 'View Analytics', subtitle: 'Track your spending', href: '/analytics' },
  { icon: Users, label: 'Manage Groups', subtitle: 'Split bills with friends', href: '/groups' },
  { icon: Target, label: 'Set Goals', subtitle: 'Save for your dreams', href: '/goals' },
];

interface BankSuggestion {
  name: string;
  icon?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [recurringExpensesList, setRecurringExpensesList] = useState<RecurringExpense[]>([]); // New state for recurring expenses

  const [quickStatsData, setQuickStatsData] = useState<QuickStatProps[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [topCategoriesThisMonth, setTopCategoriesThisMonth] = useState<Array<{ name: string; amount: number; percentage: number; displayColor: string }>>([]);
  const [activityFeedItems, setActivityFeedItems] = useState<ActivityItem[]>([]);

  const [showEditExpenseDialog, setShowEditExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [bankSuggestionsForEdit, setBankSuggestionsForEdit] = useState<BankSuggestion[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const categoryColors: { [key: string]: string } = {
    food: '#FF6384',
    transport: '#36A2EB',
    shopping: '#FFCE56',
    utilities: '#4BC0C0',
    entertainment: '#9966FF',
    health: '#FF9F40',
    other: '#C9CBCF',
  };
  const generateRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;


  const fetchData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    setError(null);
    try {
      const [expensesRes, allowancesRes, recurringExpensesRes] = await Promise.all([
        databaseService.getExpenses(user.$id, 100), // Fetch more for calculations
        databaseService.getAllowances(user.$id),
        databaseService.getRecurringExpenses(user.$id), // Fetch recurring expenses
      ]);

      const fetchedExpenses = (expensesRes.documents as unknown as Expense[]) || [];
      const fetchedAllowances = (allowancesRes.documents as unknown as Allowance[]) || [];
      const fetchedRecurringExpenses = (recurringExpensesRes.documents as unknown as RecurringExpense[]) || [];
      
      setExpenses(fetchedExpenses);
      setAllowances(fetchedAllowances);
      setRecurringExpensesList(fetchedRecurringExpenses);

      // Process data for dashboard
      // Recent Expenses (last 5 actual expenses)
      setRecentExpenses(fetchedExpenses.slice(0, 5));

      // Activity Feed (simple: last 3 actual expenses as activities)
      setActivityFeedItems(
        fetchedExpenses.slice(0, 3).map(exp => ({
          id: exp.$id!,
          type: 'expense_added',
          description: `Expense added: ${exp.name} (₹${exp.amount.toLocaleString()})`,
          timestamp: exp.$createdAt || new Date().toISOString(),
          user: 'You',
        }))
      );

      // Quick Stats & Monthly Calculations
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      // Filter regular expenses for the current month
      let monthlyExpenses = fetchedExpenses.filter(exp => 
        isWithinInterval(parseISO(exp.date), { start: currentMonthStart, end: currentMonthEnd })
      );

      // Process recurring expenses for the current month
      const dueRecurringExpensesForMonth: Expense[] = fetchedRecurringExpenses
        .filter(re => 
          re.isActive && 
          re.nextDueDate && 
          isWithinInterval(parseISO(re.nextDueDate), { start: currentMonthStart, end: currentMonthEnd })
          // Optional: Add logic here to check if it was already "paid" or logged this month if you implement such a feature
        )
        .map(re => ({
          $id: `recurring-${re.$id}-${re.nextDueDate}`, // Create a unique ID for this instance
          userId: re.userId,
          name: re.name,
          amount: re.amount,
          category: re.category,
          date: re.nextDueDate, // Use nextDueDate as the date for this month's instance
          paymentMethod: re.paymentMethod || 'recurring',
          bank: re.bank,
          notes: re.notes || `Recurring: ${re.name}`,
          isRecurring: true, // Mark it as a recurring type for potential differentiation
          currency: 'INR', // Assuming INR
          $createdAt: parseISO(re.nextDueDate).toISOString(), // Use due date as creation for this instance
          $updatedAt: parseISO(re.nextDueDate).toISOString(),
        }));

      // Combine regular and due recurring expenses for monthly calculations
      const allMonthlyExpenses = [...monthlyExpenses, ...dueRecurringExpensesForMonth];


      const monthlyAllowances = fetchedAllowances.filter(allow => {
        const allowDate = allow.nextReceived ? parseISO(allow.nextReceived) : (allow.$createdAt ? parseISO(allow.$createdAt) : now);
        return isWithinInterval(allowDate, { start: currentMonthStart, end: currentMonthEnd });
      });

      const totalSpentMonth = allMonthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncomeMonth = monthlyAllowances.reduce((sum, allow) => sum + allow.amount, 0);
      const netSavingsMonth = totalIncomeMonth - totalSpentMonth;

      setQuickStatsData([
        { title: 'Spent this month', value: `₹${totalSpentMonth.toLocaleString()}`, change: '', trend: totalSpentMonth > 0 ? 'down' : 'neutral', icon: TrendingUp },
        { title: 'Income this month', value: `₹${totalIncomeMonth.toLocaleString()}`, change: '', trend: totalIncomeMonth > 0 ? 'up' : 'neutral', icon: FileText },
        { title: 'Net Savings', value: `₹${netSavingsMonth.toLocaleString()}`, change: '', trend: netSavingsMonth > 0 ? 'up' : (netSavingsMonth < 0 ? 'down' : 'neutral'), icon: Shield },
        { title: 'Active Allowances', value: fetchedAllowances.filter(a => a.isActive).length.toString(), change: '', trend: 'neutral', icon: CreditCard },
      ]);

      // Top Categories This Month (using combined expenses)
      const categorySpending: { [key: string]: number } = {};
      allMonthlyExpenses.forEach(exp => {
        categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
      });
      const totalCategorySpending = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
      const sortedCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5) // Top 5
        .map(([name, amount]) => ({
          name,
          amount,
          percentage: totalCategorySpending > 0 ? parseFloat(((amount / totalCategorySpending) * 100).toFixed(1)) : 0,
          displayColor: categoryColors[name.toLowerCase()] || generateRandomColor(),
        }));
      setTopCategoriesThisMonth(sortedCategories);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data.");
      toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchBankSuggestions = async () => {
      if (showEditExpenseDialog && user?.$id) {
        try {
          const allowancesRes = await databaseService.getAllowances(user.$id);
          const allowancesDocs = (allowancesRes.documents as unknown as Allowance[]);
          const uniqueBankNames = new Set<string>();
          allowancesDocs.forEach(allowance => {
            if (allowance.bankName) uniqueBankNames.add(allowance.bankName);
          });
          const suggestions: BankSuggestion[] = Array.from(uniqueBankNames).sort().map(name => {
            const bankFromFile = banksData.find(b => b.name.toLowerCase() === name.toLowerCase());
            return { name, icon: bankFromFile?.icon };
          });
          banksData.forEach(bankFileEntry => {
            if (!suggestions.some(s => s.name.toLowerCase() === bankFileEntry.name.toLowerCase())) {
              suggestions.push({ name: bankFileEntry.name, icon: bankFileEntry.icon });
            }
          });
          suggestions.sort((a, b) => a.name.localeCompare(b.name));
          setBankSuggestionsForEdit(suggestions);
        } catch (error) {
          console.error("Error fetching bank suggestions for edit:", error);
          toast({ title: "Error", description: "Could not load bank suggestions for editing.", variant: "destructive" });
        }
      }
    };
    fetchBankSuggestions();
  }, [showEditExpenseDialog, user]);

  const handleEditExpense = (expense: Expense) => {
    if (expense.$id?.startsWith('recurring-')) {
      toast({ title: "Info", description: "Edit recurring expenses from the 'Recurring' page.", variant: "default" });
      navigate('/recurring');
      return;
    }
    // The ExpenseForm expects initialData.paymentApp for the PaymentMethodSelector
    // Ensure the expense object passed to initialData has paymentApp if paymentMethod exists
    const expenseToEdit = {
      ...expense,
      paymentApp: expense.paymentMethod || (expense as any).paymentApp
    };
    setEditingExpense(expenseToEdit);
    setShowEditExpenseDialog(true);
  };

  const handleUpdateSubmittedExpense = async (expenseFormData: Partial<Expense>) => {
    if (!editingExpense?.$id || !user?.$id) {
      toast({ title: "Error", description: "Cannot update expense. Missing ID or user information.", variant: "destructive" });
      return;
    }
    setIsSubmittingEdit(true);
    try {
      const dataToUpdate: GenericDocData = {
        name: expenseFormData.name!,
        amount: expenseFormData.amount!,
        date: expenseFormData.date!,
        category: expenseFormData.category!,
        currency: expenseFormData.currency || 'INR',
        notes: expenseFormData.notes || undefined,
        paymentMethod: (expenseFormData as any).paymentApp || undefined, // form sends paymentApp, save as paymentMethod
        bank: expenseFormData.bank || undefined,
        billImage: expenseFormData.billImage || undefined,
        isRecurring: expenseFormData.isRecurring || false,
        groupId: expenseFormData.groupId || undefined,
        paidBy: expenseFormData.paidBy || undefined,
        splitBetween: expenseFormData.splitBetween && expenseFormData.splitBetween.length > 0 ? expenseFormData.splitBetween : undefined,
        isSettled: expenseFormData.isSettled,
      };

      await databaseService.updateExpense(editingExpense.$id, dataToUpdate);
      toast({ title: "Expense Updated", description: "Your expense has been successfully updated." });
      setShowEditExpenseDialog(false);
      setEditingExpense(null);
      fetchData(); 
    } catch (error: any) {
      console.error('Error updating expense:', error);
      toast({ title: "Error Updating Expense", description: error.message || "Failed to update expense. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    // Prevent deleting of auto-generated recurring expense instances from dashboard
    if (expenseId?.startsWith('recurring-')) {
        toast({ title: "Info", description: "Delete recurring expenses from the 'Recurring' page.", variant: "default" });
        navigate('/recurring');
        return;
    }
    if (!user?.$id) return;
    try {
      await databaseService.deleteExpense(expenseId);
      toast({ title: "Expense Deleted", description: "The expense has been successfully deleted." });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({ title: "Error", description: "Could not delete the expense.", variant: "destructive" });
    }
  };

  const handleAddAllowance = async (allowanceData: AllowanceData) => {
    if (!user?.$id) return;
    try {
      await databaseService.createAllowance({ ...allowanceData, userId: user.$id });
      toast({ title: "Allowance Added", description: "New allowance has been successfully added." });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error adding allowance:", error);
      toast({ title: "Error", description: "Could not add the allowance.", variant: "destructive" });
    }
  };

  const handleEditAllowance = async (allowanceId: string, allowanceData: Partial<AllowanceData>) => {
    if (!user?.$id) return;
    try {
      await databaseService.updateAllowance(allowanceId, { ...allowanceData, userId: user.$id });
      toast({ title: "Allowance Updated", description: "Allowance has been successfully updated." });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error updating allowance:", error);
      toast({ title: "Error", description: "Could not update the allowance.", variant: "destructive" });
    }
  };

  const handleDeleteAllowance = async (allowanceId: string) => {
    if (!user?.$id) return;
    try {
      await databaseService.deleteAllowance(allowanceId);
      toast({ title: "Allowance Deleted", description: "Allowance has been successfully deleted." });
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error deleting allowance:", error);
      toast({ title: "Error", description: "Could not delete the allowance.", variant: "destructive" });
    }
  };


  if (loading && expenses.length === 0 && recurringExpensesList.length === 0) { // Show full page loader only on initial load
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Here's your financial overview for today.</p>
        </div>
        <Link to="/add-expense">
          <Button size="sm" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add New Expense
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={quickStatsData} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        {quickActions.map((action) => (
          <Link key={action.label} to={action.href}>
            <Card className="p-3 lg:p-4 h-full transition-all duration-200 hover:shadow-md hover:border-primary/50 group">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-3">
                <div className="p-2 lg:p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                  <action.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm lg:text-base">{action.label}</h3>
                  <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Expenses</h2>
            <Link 
              to="/analytics"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View All
            </Link>
          </div>
          {recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense) => (
                <ExpenseCard 
                  key={expense.$id} 
                  expense={expense}
                  onEdit={() => handleEditExpense(expense)}
                  onDelete={() => handleDeleteExpense(expense.$id!)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              No recent expenses. <Link to="/add-expense" className="text-primary hover:underline">Add one now!</Link>
            </Card>
          )}
        </div>

        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed items={activityFeedItems} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allowance Management */}
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Top Categories This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCategoriesThisMonth.length > 0 ? topCategoriesThisMonth.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                       <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.displayColor }}
                       />
                      <span className="text-sm font-medium text-foreground">{category.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">₹{category.amount.toLocaleString()}</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" indicatorClassName="bg-primary" style={{ '--tw-bg-opacity': '1', backgroundColor: category.displayColor }} />
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-4">No category spending data for this month yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Insights Dialog, if any */}
      {/* ... existing JSX ... */}

      {editingExpense && (
        <Dialog open={showEditExpenseDialog} onOpenChange={(isOpen) => {
          setShowEditExpenseDialog(isOpen);
          if (!isOpen) setEditingExpense(null);
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSubmit={handleUpdateSubmittedExpense}
              isLoading={isSubmittingEdit}
              initialData={editingExpense}
              isEditing={true}
              bankSuggestions={bankSuggestionsForEdit}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;