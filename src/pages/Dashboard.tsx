import React, { useState, useEffect, useCallback } from 'react';
import { Plus, TrendingUp, Users, Calendar, BarChart3, Target, CreditCard, FileText, Shield, AlertTriangle, TrendingDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QuickStats, { QuickStatProps } from '@/components/QuickStats';
import ExpenseCard from '@/components/ExpenseCard';
import ActivityFeed, { ActivityItem } from '@/components/ActivityFeed';
import AllowanceManager from '@/components/AllowanceManager';
import { Expense, RecurringExpense } from '@/types/expense';
import { Allowance, AllowanceData, processPastDueAllowances } from '@/lib/allowanceService';
import { processPastDueRecurringExpenses } from '@/lib/recurringExpenseService'; // Import the new service
import { Progress } from '@/components/ui/progress';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, storageService, COLLECTIONS, GenericDocData } from '@/lib/appwrite';
import { toast } from '@/hooks/use-toast';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, isValid, addDays, addWeeks, addMonths, addYears, format } from 'date-fns';
import { cn } from '@/lib/utils';
import categoriesData from '@/data/categories.json';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ExpenseForm from '@/components/ExpenseForm';
import banksData from '@/data/banks.json';

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

const getCategoryIcon = (categoryId: string | undefined) => {
  const defaultIcon = LucideIcons.Tag;
  if (!categoryId) return defaultIcon;
  const category = categoriesData.find(cat => cat.id.toLowerCase() === categoryId.toLowerCase() || cat.name.toLowerCase() === categoryId.toLowerCase());
  if (!category || !category.icon) return defaultIcon;
  return (LucideIcons as any)[category.icon] || defaultIcon;
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [recurringExpensesList, setRecurringExpensesList] = useState<RecurringExpense[]>([]);

  const [quickStatsData, setQuickStatsData] = useState<QuickStatProps[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [topCategoriesThisMonth, setTopCategoriesThisMonth] = useState<Array<{ name: string; amount: number; percentage: number; displayColor: string; id: string }>>([]);
  const [activityFeedItems, setActivityFeedItems] = useState<ActivityItem[]>([]);

  const [showEditExpenseDialog, setShowEditExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [bankSuggestionsForEdit, setBankSuggestionsForEdit] = useState<BankSuggestion[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const generateRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

  const fetchData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    setError(null);
    try {
      // Step 1: Fetch templates for processing
      const [allowancesToProcessRes, recurringToProcessRes] = await Promise.all([
        databaseService.getAllowances(user.$id),
        databaseService.getRecurringExpenses(user.$id),
      ]);
      
      const allowancesToProcess = (allowancesToProcessRes.documents as unknown as Allowance[]) || [];
      const recurringToProcess = (recurringToProcessRes.documents as unknown as RecurringExpense[]) || [];
      
      // Step 2: Process both allowances and recurring expenses
      const allowancesWereProcessed = await processPastDueAllowances(allowancesToProcess, user.$id, user.name);
      const recurringWereProcessed = await processPastDueRecurringExpenses(recurringToProcess, user.$id, user.name);

      if (allowancesWereProcessed) {
        toast({ title: "Allowances Updated", description: "Your recurring income has been automatically updated." });
      }
      if (recurringWereProcessed) {
        toast({ title: "Recurring Bills Updated", description: "Your recurring bills have been automatically logged." });
      }

      // Step 3: Fetch all data again to get the freshest state
      const [expensesRes, allowancesRes, recurringExpensesRes] = await Promise.all([
        databaseService.getExpenses(user.$id, 100),
        databaseService.getAllowances(user.$id),
        databaseService.getRecurringExpenses(user.$id),
      ]);

      const fetchedExpenses = (expensesRes.documents as unknown as Expense[]) || [];
      const fetchedAllowances = (allowancesRes.documents as unknown as Allowance[]) || [];
      const fetchedRecurringExpenses = (recurringExpensesRes.documents as unknown as RecurringExpense[]) || [];
      
      setExpenses(fetchedExpenses);
      setAllowances(fetchedAllowances);
      setRecurringExpensesList(fetchedRecurringExpenses);

      // --- All subsequent calculations will now use the up-to-date 'fetchedExpenses' ---

      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);

      const monthlyTransactions = fetchedExpenses.filter(exp => 
        isWithinInterval(parseISO(exp.date), { start: currentMonthStart, end: currentMonthEnd })
      );

      const monthlyIncomeTransactions = monthlyTransactions.filter(exp => exp.amount < 0);
      const monthlyExpenseTransactions = monthlyTransactions.filter(exp => exp.amount >= 0);

      const totalSpentMonth = monthlyExpenseTransactions.reduce((sum, exp) => sum + exp.amount, 0);
      const totalIncomeMonth = monthlyIncomeTransactions.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
      const netSavingsMonth = totalIncomeMonth - totalSpentMonth;

      setQuickStatsData([
        { title: 'Spent this month', value: `₹${totalSpentMonth.toLocaleString()}`, change: '', trend: totalSpentMonth > 0 ? 'down' : 'neutral', icon: TrendingUp },
        { title: 'Income this month', value: `₹${totalIncomeMonth.toLocaleString()}`, change: '', trend: totalIncomeMonth > 0 ? 'up' : 'neutral', icon: FileText },
        { title: 'Net Savings', value: `₹${netSavingsMonth.toLocaleString()}`, change: '', trend: netSavingsMonth > 0 ? 'up' : (netSavingsMonth < 0 ? 'down' : 'neutral'), icon: Shield },
        { title: 'Active Allowances', value: fetchedAllowances.filter(a => a.isActive).length.toString(), change: '', trend: 'neutral', icon: CreditCard },
      ]);
      
      setRecentExpenses(fetchedExpenses.filter(e => e.amount >= 0).slice(0, 5));

      setActivityFeedItems(
        fetchedExpenses.slice(0, 5).map(exp => {
          const isIncome = exp.amount < 0;
          const description = isIncome 
            ? `Income received: <b>${exp.name}</b> (₹${Math.abs(exp.amount).toLocaleString()})`
            : `Expense added: <b>${exp.name}</b> (₹${exp.amount.toLocaleString()})`;
          const type = isIncome ? 'income_received' : 'expense_added';

          return {
            id: exp.$id!,
            type: type,
            description: description,
            timestamp: exp.$createdAt || new Date().toISOString(),
            user: user?.name || 'You',
            userId: user?.$id,
            icon: isIncome ? TrendingDown : TrendingUp,
            avatarId: (user as any)?.avatarUrl && typeof (user as any).avatarUrl === 'string' && !(user as any).avatarUrl.startsWith('http') 
              ? (user as any).avatarUrl 
              : undefined,
          };
        })
      );
      
      const categorySpending: { [key: string]: number } = {};
      monthlyExpenseTransactions.forEach(exp => {
        categorySpending[exp.category] = (categorySpending[exp.category] || 0) + exp.amount;
      });
      const totalCategorySpending = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
      const sortedCategories = Object.entries(categorySpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, amount]) => {
          const categoryDetails = categoriesData.find(c => c.name.toLowerCase() === name.toLowerCase());
          return {
            id: categoryDetails?.id || name.toLowerCase(),
            name,
            amount,
            percentage: totalCategorySpending > 0 ? parseFloat(((amount / totalCategorySpending) * 100).toFixed(1)) : 0,
            displayColor: categoryDetails?.color || generateRandomColor(),
          };
        });
      setTopCategoriesThisMonth(sortedCategories);

    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data.");
      toast({ title: "Error", description: err.message || "Could not load dashboard data.", variant: "destructive" });
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
        paymentMethod: (expenseFormData as any).paymentApp || undefined,
        bank: expenseFormData.bank || undefined,
        billImage: expenseFormData.billImage,
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
      toast({ title: "Error Updating Expense", description: error.message || "Failed to update expense. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (expenseId?.startsWith('recurring-')) {
        toast({ title: "Info", description: "Delete recurring expenses from the 'Recurring' page.", variant: "default" });
        navigate('/recurring');
        return;
    }
    if (!user?.$id) return;

    if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
      try {
        const expenseToDelete = await databaseService.getDocument(COLLECTIONS.EXPENSES, expenseId);
        const billImageId = (expenseToDelete as unknown as Expense).billImage;

        await databaseService.deleteExpense(expenseId);

        if (billImageId) {
          try {
            await storageService.deleteFile(billImageId);
          } catch (fileError) {
            console.error("Error deleting bill image:", fileError);
          }
        }

        toast({ title: "Expense Deleted", description: "The expense has been successfully deleted." });
        fetchData();
      } catch (error) {
        toast({ title: "Error", description: "Could not delete the expense.", variant: "destructive" });
      }
    }
  };

  const handleAddAllowance = async (allowanceData: AllowanceData) => {
    if (!user?.$id) return;
    try {
      await databaseService.createAllowance({ ...allowanceData, userId: user.$id });
      toast({ title: "Allowance Added", description: "New allowance has been successfully added." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Could not add the allowance.", variant: "destructive" });
    }
  };

  const handleEditAllowance = async (allowanceId: string, allowanceData: Partial<AllowanceData>) => {
    if (!user?.$id) return;
    try {
      await databaseService.updateAllowance(allowanceId, { ...allowanceData, userId: user.$id });
      toast({ title: "Allowance Updated", description: "Allowance has been successfully updated." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Could not update the allowance.", variant: "destructive" });
    }
  };

  const handleDeleteAllowance = async (allowanceId: string) => {
    if (!user?.$id) return;
    try {
      await databaseService.deleteAllowance(allowanceId);
      toast({ title: "Allowance Deleted", description: "Allowance has been successfully deleted." });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Could not delete the allowance.", variant: "destructive" });
    }
  };

  if (loading && expenses.length === 0 && recurringExpensesList.length === 0) {
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

      <QuickStats stats={quickStatsData} />

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
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Recent Expenses</h2>
            <Link 
              to="/passbook"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "dark:text-foreground")}
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

        <div className="lg:col-span-1">
          <ActivityFeed items={activityFeedItems} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AllowanceManager
            allowances={allowances}
            onAdd={handleAddAllowance}
            onEdit={handleEditAllowance}
            onDelete={handleDeleteAllowance}
          />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Top Categories This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topCategoriesThisMonth.length > 0 ? topCategoriesThisMonth.map((category) => {
                const CategoryIcon = getCategoryIcon(category.id);
                return (
                  <div key={category.name}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <CategoryIcon 
                            className="w-4 h-4"
                            style={{ color: category.displayColor }}
                        />
                        <span className="text-sm font-medium text-foreground">{category.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">₹{category.amount.toLocaleString()}</span>
                    </div>
                    <Progress value={category.percentage} className="h-2" indicatorClassName="bg-primary" style={{ backgroundColor: `${category.displayColor}4D`, '--progress-indicator-color': category.displayColor } as React.CSSProperties} />
                  </div>
                );
              }) : (
                <p className="text-muted-foreground text-center py-4">No category spending data for this month yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {editingExpense && (
        <Dialog open={showEditExpenseDialog} onOpenChange={(isOpen) => {
          setShowEditExpenseDialog(isOpen);
          if (!isOpen) setEditingExpense(null);
        }}>
          <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl">
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