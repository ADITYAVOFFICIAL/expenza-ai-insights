import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, Edit, Trash2, Pause, Play, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/appwrite';
import { RecurringExpense } from '@/types/expense';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';

interface RecurringFormState {
  name: string;
  amount: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
  bank: string;
  paymentMethod: string;
  notes: string;
}

const initialRecurringFormState: RecurringFormState = {
  name: '',
  amount: '',
  category: 'utilities',
  frequency: 'monthly',
  nextDueDate: format(new Date(), 'yyyy-MM-dd'),
  bank: '',
  paymentMethod: '',
  notes: '',
};

const Recurring = () => {
  const { user } = useAuth();
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFormState, setCreateFormState] = useState<RecurringFormState>(initialRecurringFormState);
  
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState<RecurringFormState>(initialRecurringFormState);
  const [showEditDialog, setShowEditDialog] = useState(false);


  const fetchRecurringExpenses = useCallback(async () => {
    if (!user?.$id) {
      setError("User not authenticated.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await databaseService.getRecurringExpenses(user.$id);
      setRecurringExpenses(response.documents as unknown as RecurringExpense[]);
    } catch (err: any) {
      console.error("Error fetching recurring expenses:", err);
      setError("Failed to load recurring expenses. Please try again.");
      toast({ title: "Error", description: err.message || "Could not load data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecurringExpenses();
  }, [fetchRecurringExpenses]);

  const handleCreateRecurring = async () => {
    if (!user?.$id) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    if (!createFormState.name || !createFormState.amount || !createFormState.nextDueDate) {
        toast({ title: "Missing Fields", description: "Name, amount, and next due date are required.", variant: "warning" });
        return;
    }

    setProcessingAction('create');
    try {
      const dataToSave: Omit<RecurringExpense, '$id' | '$createdAt' | '$updatedAt' | 'lastPaidDate'> = {
        userId: user.$id,
        name: createFormState.name,
        amount: parseFloat(createFormState.amount),
        category: createFormState.category,
        frequency: createFormState.frequency,
        nextDueDate: createFormState.nextDueDate,
        isActive: true,
        bank: createFormState.bank || undefined,
        paymentMethod: createFormState.paymentMethod || undefined,
        notes: createFormState.notes || undefined,
      };
      await databaseService.createRecurringExpense(dataToSave);
      toast({ title: "Success", description: "Recurring expense added." });
      setShowCreateDialog(false);
      setCreateFormState(initialRecurringFormState);
      fetchRecurringExpenses();
    } catch (err: any) {
      console.error("Error creating recurring expense:", err);
      toast({ title: "Error", description: err.message || "Failed to add recurring expense.", variant: "destructive" });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleToggleActive = async (id: string, currentIsActive: boolean) => {
    if (!id) return;
    setProcessingAction(id);
    try {
      await databaseService.updateRecurringExpense(id, { isActive: !currentIsActive });
      setRecurringExpenses(prev => 
        prev.map(exp => exp.$id === id ? { ...exp, isActive: !currentIsActive } : exp)
      );
      toast({ title: "Success", description: `Expense ${!currentIsActive ? 'activated' : 'paused'}.` });
    } catch (err: any) {
      console.error("Error updating recurring expense status:", err);
      toast({ title: "Error", description: err.message || "Failed to update status.", variant: "destructive" });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this recurring expense? This action cannot be undone.")) return;
    setProcessingAction(id);
    try {
      await databaseService.deleteRecurringExpense(id);
      setRecurringExpenses(prev => prev.filter(exp => exp.$id !== id));
      toast({ title: "Success", description: "Recurring expense deleted." });
    } catch (err: any) {
      console.error("Error deleting recurring expense:", err);
      toast({ title: "Error", description: err.message || "Failed to delete expense.", variant: "destructive" });
    } finally {
      setProcessingAction(null);
    }
  };
  
  const handleOpenEditDialog = (expense: RecurringExpense) => {
    setEditingExpenseId(expense.$id!);
    setEditFormState({
        name: expense.name,
        amount: expense.amount.toString(),
        category: expense.category,
        frequency: expense.frequency,
        nextDueDate: expense.nextDueDate ? format(parseISO(expense.nextDueDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        bank: expense.bank || '',
        paymentMethod: expense.paymentMethod || '',
        notes: expense.notes || '',
    });
    setShowEditDialog(true); 
  };
  
  const handleUpdateRecurring = async () => {
    if (!editingExpenseId || !user?.$id) {
        toast({ title: "Error", description: "Cannot update expense. Invalid data.", variant: "destructive" });
        return;
    }
     if (!editFormState.name || !editFormState.amount || !editFormState.nextDueDate) {
        toast({ title: "Missing Fields", description: "Name, amount, and next due date are required.", variant: "warning" });
        return;
    }

    setProcessingAction(editingExpenseId);
    try {
        const dataToUpdate: Partial<Omit<RecurringExpense, '$id' | 'userId' | '$createdAt' | '$updatedAt' | 'isActive' | 'lastPaidDate'>> = {
            name: editFormState.name,
            amount: parseFloat(editFormState.amount),
            category: editFormState.category,
            frequency: editFormState.frequency,
            nextDueDate: editFormState.nextDueDate,
            bank: editFormState.bank || undefined,
            paymentMethod: editFormState.paymentMethod || undefined,
            notes: editFormState.notes || undefined,
        };
        await databaseService.updateRecurringExpense(editingExpenseId, dataToUpdate);
        toast({ title: "Success", description: "Recurring expense updated."});
        setShowEditDialog(false);
        setEditingExpenseId(null);
        fetchRecurringExpenses();
    } catch (err:any) {
        console.error("Error updating recurring expense:", err);
        toast({ title: "Error", description: err.message || "Failed to update expense.", variant: "destructive"});
    } finally {
        setProcessingAction(null);
    }
  };


  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'weekly': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'monthly': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'yearly': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getDaysUntilDue = (nextDueDateStr: string) => {
    const nextDate = parseISO(nextDueDateStr);
    if (!isValid(nextDate)) return { days: NaN, label: "Invalid date" };
    const days = differenceInDays(nextDate, new Date());
    if (days < 0) return { days, label: "Overdue" };
    if (days === 0) return { days, label: "Due today" };
    return { days, label: `in ${days} day${days === 1 ? '' : 's'}` };
  };

  const activeExpenses = recurringExpenses.filter(r => r.isActive);
  const totalMonthlyAmount = activeExpenses
    .filter(r => r.frequency === 'monthly')
    .reduce((acc, r) => acc + r.amount, 0);
  const dueThisWeek = activeExpenses.filter(r => {
    const { days } = getDaysUntilDue(r.nextDueDate);
    return days >= 0 && days <= 7;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button onClick={fetchRecurringExpenses}>Retry</Button>
      </div>
    );
  }

  const renderRecurringForm = (
    formState: RecurringFormState, 
    setFormState: React.Dispatch<React.SetStateAction<RecurringFormState>>,
    formType: 'create' | 'edit'
  ) => (
    <div className="space-y-4 py-4">
      <div>
        <Label htmlFor={`${formType}-recurringName`}>Expense Name *</Label>
        <Input id={`${formType}-recurringName`} value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} placeholder="e.g., Netflix Subscription" />
      </div>
      <div>
        <Label htmlFor={`${formType}-recurringAmount`}>Amount (₹) *</Label>
        <Input id={`${formType}-recurringAmount`} type="number" value={formState.amount} onChange={(e) => setFormState({ ...formState, amount: e.target.value })} placeholder="599" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${formType}-recurringCategory`}>Category</Label>
          <Select value={formState.category} onValueChange={(value) => setFormState({ ...formState, category: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="housing">Housing</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${formType}-recurringFrequency`}>Frequency</Label>
          <Select value={formState.frequency} onValueChange={(value: any) => setFormState({ ...formState, frequency: value })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor={`${formType}-recurringNextDue`}>Next Due Date *</Label>
        <Input id={`${formType}-recurringNextDue`} type="date" value={formState.nextDueDate} onChange={(e) => setFormState({ ...formState, nextDueDate: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${formType}-recurringBank`}>Bank (Optional)</Label>
          <Input id={`${formType}-recurringBank`} value={formState.bank} onChange={(e) => setFormState({ ...formState, bank: e.target.value })} placeholder="e.g., HDFC Bank" />
        </div>
        <div>
          <Label htmlFor={`${formType}-recurringPaymentApp`}>Payment Method (Optional)</Label>
          <Input id={`${formType}-recurringPaymentApp`} value={formState.paymentMethod} onChange={(e) => setFormState({ ...formState, paymentMethod: e.target.value })} placeholder="e.g., UPI, Card" />
        </div>
      </div>
        <div>
        <Label htmlFor={`${formType}-recurringNotes`}>Notes (Optional)</Label>
        <Input id={`${formType}-recurringNotes`} value={formState.notes} onChange={(e) => setFormState({ ...formState, notes: e.target.value })} placeholder="Additional details" />
      </div>
    </div>
  );

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Recurring Expenses</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Manage your regular bills and subscriptions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(isOpen) => { setShowCreateDialog(isOpen); if (!isOpen) setCreateFormState(initialRecurringFormState); }}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" onClick={() => { setCreateFormState(initialRecurringFormState); setShowCreateDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Recurring Expense</DialogTitle>
            </DialogHeader>
            {renderRecurringForm(createFormState, setCreateFormState, 'create')}
            <DialogFooter>
                <DialogClose asChild><Button variant="outline" disabled={processingAction === 'create'}>Cancel</Button></DialogClose>
                <Button onClick={handleCreateRecurring} disabled={processingAction === 'create'}>
                    {processingAction === 'create' ? 'Adding...' : 'Add Recurring Expense'}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><Calendar className="w-5 h-5" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Est. Monthly Total</div>
                <div className="text-xl font-bold">₹{totalMonthlyAmount.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"><Play className="w-5 h-5" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-xl font-bold">{activeExpenses.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"><Calendar className="w-5 h-5" /></div>
              <div>
                <div className="text-sm text-muted-foreground">Due This Week</div>
                <div className="text-xl font-bold">{dueThisWeek.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due This Week Section */}
      {dueThisWeek.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Due This Week</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dueThisWeek.map((expense) => {
                  const dueDateInfo = getDaysUntilDue(expense.nextDueDate);
                  return (
                    <div key={expense.$id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <div>
                        <div className="font-medium">{expense.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {dueDateInfo.label} • ₹{expense.amount.toLocaleString()}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs">Mark as Paid</Button> {/* Placeholder */}
                    </div>
                  );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Expenses List */}
      {recurringExpenses.length === 0 && !isLoading && (
         <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                No recurring expenses found. <br/> Add your subscriptions and regular bills to get started.
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {recurringExpenses.map((expense) => {
          const dueDateInfo = getDaysUntilDue(expense.nextDueDate);
          return (
            <Card key={expense.$id} className={!expense.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{expense.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getFrequencyColor(expense.frequency) + " capitalize"}>
                      {expense.frequency}
                    </Badge>
                    <Switch
                      checked={expense.isActive}
                      onCheckedChange={() => handleToggleActive(expense.$id!, expense.isActive)}
                      disabled={processingAction === expense.$id}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Amount</div>
                      <div className="text-xl font-bold">₹{expense.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Next Due</div>
                      <div className="font-medium">{format(parseISO(expense.nextDueDate), 'MMM dd, yyyy')}</div>
                      <div className={`text-xs ${dueDateInfo.days < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {dueDateInfo.label}
                      </div>
                    </div>
                  </div>
                  {(expense.bank || expense.paymentMethod) && (
                    <div className="grid grid-cols-2 gap-4">
                        {expense.bank && <div><div className="text-sm text-muted-foreground">Bank</div><div className="font-medium">{expense.bank}</div></div>}
                        {expense.paymentMethod && <div><div className="text-sm text-muted-foreground">Payment Method</div><div className="font-medium">{expense.paymentMethod}</div></div>}
                    </div>
                  )}
                  {expense.category && <div><div className="text-sm text-muted-foreground">Category</div><Badge variant="outline" className="capitalize">{expense.category}</Badge></div>}
                  {expense.notes && <div><div className="text-sm text-muted-foreground">Notes</div><p className="text-sm">{expense.notes}</p></div>}
                  {expense.lastPaidDate && <div><div className="text-sm text-muted-foreground">Last Paid</div><div className="text-sm">{format(parseISO(expense.lastPaidDate), 'MMM dd, yyyy')}</div></div>}
                  
                  <div className="flex gap-2 pt-2 border-t border-border/50">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEditDialog(expense)} disabled={processingAction === expense.$id}>
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteRecurring(expense.$id!)} disabled={processingAction === expense.$id}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Edit Dialog */}
      {editingExpenseId && (
        <Dialog open={showEditDialog} onOpenChange={(isOpen) => { setShowEditDialog(isOpen); if (!isOpen) setEditingExpenseId(null); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Recurring Expense: {editFormState.name}</DialogTitle>
                </DialogHeader>
                {renderRecurringForm(editFormState, setEditFormState, 'edit')}
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline" disabled={processingAction === editingExpenseId}>Cancel</Button></DialogClose>
                    <Button onClick={handleUpdateRecurring} disabled={processingAction === editingExpenseId}>
                        {processingAction === editingExpenseId ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Recurring;