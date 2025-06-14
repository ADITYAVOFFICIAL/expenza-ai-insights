import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Plus, Edit, Trash2, AlertTriangle, Check, ChevronsUpDown, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as LucideIcons from 'lucide-react';
import categoriesData from '@/data/categories.json';
import { Dialog,DialogTrigger,DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, COLLECTIONS } from '@/lib/appwrite';
import { RecurringExpense } from '@/types/expense';
import { toast } from '@/hooks/use-toast';
import { format, differenceInDays, parseISO, isValid, startOfWeek, endOfWeek, startOfToday, isBefore, isWithinInterval, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import banksData from '@/data/banks.json';
import paymentAppsData from '@/data/paymentApps.json';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Helper function to generate a unique ID for a recurring instance
const generateRecurringInstanceId = (recurringExpenseId: string, date: Date): string => {
  return `rec_${recurringExpenseId}_${format(date, 'yyyyMMdd')}`;
};

const getCategoryDetails = (categoryId: string | undefined) => {
  const defaultIcon = LucideIcons.Briefcase;
  const defaultColor = 'hsl(var(--muted-foreground))';
  if (!categoryId) return { IconComponent: defaultIcon, color: defaultColor, name: 'Other' };
  const category = categoriesData.find(cat => cat.id.toLowerCase() === categoryId.toLowerCase());
  if (!category) return { IconComponent: defaultIcon, color: defaultColor, name: categoryId };
  const IconComponent = (LucideIcons as any)[category.icon] || defaultIcon;
  return { IconComponent, color: category.color || defaultColor, name: category.name };
};

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

interface BankSuggestion {
  name: string;
  icon?: string;
}

const initialRecurringFormState: RecurringFormState = {
  name: '',
  amount: '',
  category: 'subscriptions',
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

  const [bankSuggestions, setBankSuggestions] = useState<BankSuggestion[]>([]);
  const [bankPopoverOpen, setBankPopoverOpen] = useState(false);
  const [paymentMethodPopoverOpen, setPaymentMethodPopoverOpen] = useState(false);

  const fetchRecurringExpenses = useCallback(async () => {
    if (!user?.$id) {
      setError("User not authenticated.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [response, allowancesRes] = await Promise.all([
        databaseService.getRecurringExpenses(user.$id),
        databaseService.getAllowances(user.$id)
      ]);
      setRecurringExpenses(response.documents as unknown as RecurringExpense[]);
      
      const uniqueBankNames = new Set<string>();
      (allowancesRes.documents as any[]).forEach(allowance => {
        if (allowance.bankName) uniqueBankNames.add(allowance.bankName);
      });
      const suggestions: BankSuggestion[] = Array.from(uniqueBankNames).sort().map(name => {
        const bankFromFile = banksData.find(b => b.name.toLowerCase() === name.toLowerCase());
        return { name, icon: bankFromFile?.icon };
      });
      setBankSuggestions(suggestions);

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
    if (!user?.$id) return;
    if (!createFormState.name || !createFormState.amount || !createFormState.nextDueDate) {
        toast({ title: "Missing Fields", description: "Name, amount, and next due date are required.", variant: "warning" });
        return;
    }
    setProcessingAction('create');
    try {
      await databaseService.createRecurringExpense({
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
      });
      toast({ title: "Success", description: "Recurring expense added." });
      setShowCreateDialog(false);
      fetchRecurringExpenses();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add recurring expense.", variant: "destructive" });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleMarkAsPaid = async (re: RecurringExpense) => {
    if (!user?.$id || !re.$id) return;
    setProcessingAction(re.$id);
    try {
      const dueDate = parseISO(re.nextDueDate);
      if (!isValid(dueDate)) throw new Error("Invalid due date");

      const instanceId = generateRecurringInstanceId(re.$id, dueDate);

      // IDEMPOTENCY CHECK
      try {
        await databaseService.getDocument(COLLECTIONS.EXPENSES, instanceId);
        toast({ title: "Already Paid", description: "This bill has already been logged for this due date.", variant: "default" });
      } catch (error: any) {
        if (error.code === 404) {
          // Transaction does not exist, so we can create it
          await databaseService.createDocument(COLLECTIONS.EXPENSES, {
            userId: user.$id,
            name: re.name,
            amount: re.amount,
            date: dueDate.toISOString(),
            category: re.category,
            paymentMethod: re.paymentMethod,
            bank: re.bank,
            notes: re.notes || `Paid recurring: ${re.name}`,
            isRecurringInstance: true,
            paidBy: user.name,
            isSettled: true,
            currency: 'INR',
          }, instanceId); // Use the predictable ID
          toast({ title: "Success", description: `${re.name} marked as paid.` });
        } else {
          throw error; // Re-throw other errors
        }
      }

      // Calculate the next due date
      let newNextDueDate;
      switch (re.frequency) {
        case 'daily': newNextDueDate = addDays(dueDate, 1); break;
        case 'weekly': newNextDueDate = addWeeks(dueDate, 1); break;
        case 'monthly': newNextDueDate = addMonths(dueDate, 1); break;
        case 'yearly': newNextDueDate = addYears(dueDate, 1); break;
        default: newNextDueDate = addMonths(dueDate, 1);
      }

      // Update the recurring expense template
      await databaseService.updateRecurringExpense(re.$id, {
        nextDueDate: newNextDueDate.toISOString(),
        lastPaidDate: new Date().toISOString(),
      });

      fetchRecurringExpenses();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to mark as paid.", variant: "destructive" });
    } finally {
      setProcessingAction(null);
    }
  };
  
  const handleToggleActive = async (id: string, currentIsActive: boolean) => {
    if (!id) return;
    setProcessingAction(id);
    try {
      await databaseService.updateRecurringExpense(id, { isActive: !currentIsActive });
      toast({ title: "Success", description: `Expense ${!currentIsActive ? 'activated' : 'paused'}.` });
      fetchRecurringExpenses();
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
      toast({ title: "Success", description: "Recurring expense deleted." });
      fetchRecurringExpenses();
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
    if (!editingExpenseId || !user?.$id) return;
    if (!editFormState.name || !editFormState.amount || !editFormState.nextDueDate) {
        toast({ title: "Missing Fields", description: "Name, amount, and next due date are required.", variant: "warning" });
        return;
    }
    setProcessingAction(editingExpenseId);
    try {
        await databaseService.updateRecurringExpense(editingExpenseId, {
            name: editFormState.name,
            amount: parseFloat(editFormState.amount),
            category: editFormState.category,
            frequency: editFormState.frequency,
            nextDueDate: editFormState.nextDueDate,
            bank: editFormState.bank || undefined,
            paymentMethod: editFormState.paymentMethod || undefined,
            notes: editFormState.notes || undefined,
        });
        toast({ title: "Success", description: "Recurring expense updated."});
        setShowEditDialog(false);
        fetchRecurringExpenses();
    } catch (err:any) {
        toast({ title: "Error", description: err.message || "Failed to update expense.", variant: "destructive"});
    } finally {
        setProcessingAction(null);
    }
  };

  const { overdue, dueThisWeek, upcoming } = useMemo(() => {
    const today = startOfToday();
    const endOfWeekDate = endOfWeek(today, { weekStartsOn: 1 });
    
    const overdue: RecurringExpense[] = [];
    const dueThisWeek: RecurringExpense[] = [];
    const upcoming: RecurringExpense[] = [];

    recurringExpenses.forEach(re => {
      if (!re.nextDueDate) return;
      const dueDate = parseISO(re.nextDueDate);
      if (!isValid(dueDate)) return;

      if (isBefore(dueDate, today)) {
        overdue.push(re);
      } else if (isWithinInterval(dueDate, { start: today, end: endOfWeekDate })) {
        dueThisWeek.push(re);
      } else {
        upcoming.push(re);
      }
    });

    overdue.sort((a, b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime());
    dueThisWeek.sort((a, b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime());
    upcoming.sort((a, b) => parseISO(a.nextDueDate).getTime() - parseISO(b.nextDueDate).getTime());

    return { overdue, dueThisWeek, upcoming };
  }, [recurringExpenses]);

  const getDaysUntilDue = (nextDueDateStr: string) => {
    const nextDate = parseISO(nextDueDateStr);
    if (!isValid(nextDate)) return { days: NaN, label: "Invalid date" };
    const days = differenceInDays(nextDate, new Date());
    if (days < 0) return { days, label: "Overdue" };
    if (days === 0) return { days, label: "Due today" };
    return { days, label: `in ${days} day${days === 1 ? '' : 's'}` };
  };

  const renderExpenseList = (title: string, expensesToList: RecurringExpense[], showPayButton: boolean) => {
    if (expensesToList.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {expensesToList.map(expense => {
            const dueDateInfo = getDaysUntilDue(expense.nextDueDate);
            const bankDetails = expense.bank ? banksData.find(b => b.name.toLowerCase() === expense.bank!.toLowerCase()) : undefined;
            const paymentAppDetail = expense.paymentMethod ? paymentAppsData.find(p => p.id.toLowerCase() === expense.paymentMethod!.toLowerCase() || p.name.toLowerCase() === expense.paymentMethod!.toLowerCase()) : undefined;
            const { IconComponent: CategoryIcon, color: categoryColor, name: categoryName } = getCategoryDetails(expense.category);
            const isProcessing = processingAction === expense.$id;

            return (
              <Card key={expense.$id} className={cn('transition-opacity', !expense.isActive && 'opacity-60')}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${categoryColor}20` }}>
                        <CategoryIcon className="w-5 h-5" style={{ color: categoryColor }} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-semibold text-md text-foreground truncate" title={expense.name}>{expense.name}</h4>
                        <p className="text-xs text-muted-foreground capitalize">{categoryName}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold">₹{expense.amount.toLocaleString()}</div>
                      <Badge variant="outline" className="text-xs capitalize mt-0.5">{expense.frequency}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Next Due</div>
                        <div className={cn("font-medium", dueDateInfo.days < 0 && "text-destructive")}>{format(parseISO(expense.nextDueDate), 'MMM dd, yyyy')}</div>
                      </div>
                    </div>
                    {(bankDetails || paymentAppDetail) && (
                      <div className="flex items-center gap-1.5">
                        {bankDetails?.icon ? <img src={bankDetails.icon} alt={bankDetails.name} className="w-4 h-4 object-contain" /> : <CreditCard className="w-4 h-4 text-muted-foreground" />}
                        <div>
                          <div className="text-xs text-muted-foreground">{bankDetails ? 'Bank' : 'Method'}</div>
                          <div className="font-medium truncate">{bankDetails?.name || paymentAppDetail?.name || expense.paymentMethod}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t">
                    <TooltipProvider>
                      <div className="flex items-center gap-1">
                        <Tooltip><TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEditDialog(expense)} disabled={isProcessing}><Edit className="w-4 h-4" /></Button>
                        </TooltipTrigger><TooltipContent><p>Edit</p></TooltipContent></Tooltip>
                        
                        <Tooltip><TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90" onClick={() => handleDeleteRecurring(expense.$id!)} disabled={isProcessing}><Trash2 className="w-4 h-4" /></Button>
                        </TooltipTrigger><TooltipContent><p>Delete</p></TooltipContent></Tooltip>

                        <Tooltip><TooltipTrigger asChild>
                          <Switch checked={expense.isActive} onCheckedChange={() => handleToggleActive(expense.$id!, expense.isActive)} disabled={isProcessing} />
                        </TooltipTrigger><TooltipContent><p>{expense.isActive ? 'Pause' : 'Activate'}</p></TooltipContent></Tooltip>
                      </div>
                    </TooltipProvider>
                    {showPayButton && expense.isActive && (
                      <Button size="sm" onClick={() => handleMarkAsPaid(expense)} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Mark as Paid'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRecurringForm = (formState: RecurringFormState, setFormState: React.Dispatch<React.SetStateAction<RecurringFormState>>, formType: 'create' | 'edit') => {
    const selectedBankData = bankSuggestions.find(b => b.name === formState.bank);
    const selectedPaymentMethodData = formState.paymentMethod ? paymentAppsData.find(p => p.id === formState.paymentMethod) : undefined;
    return (
      <div className="space-y-4 py-4 text-foreground">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${formType}-recurringName`}>Expense Name *</Label>
            <Input id={`${formType}-recurringName`} value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} placeholder="e.g., Netflix Subscription" />
          </div>
          <div>
            <Label htmlFor={`${formType}-recurringAmount`}>Amount (₹) *</Label>
            <Input id={`${formType}-recurringAmount`} type="number" value={formState.amount} onChange={(e) => setFormState({ ...formState, amount: e.target.value })} placeholder="599" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${formType}-recurringCategory`}>Category</Label>
            <Select value={formState.category} onValueChange={(value) => setFormState({ ...formState, category: value })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{categoriesData.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor={`${formType}-recurringFrequency`}>Frequency</Label>
            <Select value={formState.frequency} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setFormState({ ...formState, frequency: value })}>
              <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${formType}-recurringBank`}>Bank (Optional)</Label>
            <Popover open={bankPopoverOpen} onOpenChange={setBankPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal h-10 mt-1">
                  <div className="flex items-center gap-2 truncate">{selectedBankData?.icon && <img src={selectedBankData.icon} alt={selectedBankData.name} className="w-4 h-4 object-contain" />}<span className="truncate">{formState.bank || "Select or type bank..."}</span></div><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command>
                <CommandInput placeholder="Search bank..." value={formState.bank} onValueChange={(val) => setFormState({...formState, bank: val})} />
                <CommandList><CommandEmpty>No bank found.</CommandEmpty><CommandGroup>
                  {bankSuggestions.map((s) => (<CommandItem key={s.name} value={s.name} onSelect={(val) => {setFormState({...formState, bank: val}); setBankPopoverOpen(false);}}><Check className={cn("mr-2 h-4 w-4", formState.bank === s.name ? "opacity-100" : "opacity-0")} />{s.icon && <img src={s.icon} alt={s.name} className="w-4 h-4 mr-2" />}{s.name}</CommandItem>))}
                </CommandGroup></CommandList>
              </Command></PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor={`${formType}-recurringPaymentApp`}>Payment Method (Optional)</Label>
            <Popover open={paymentMethodPopoverOpen} onOpenChange={setPaymentMethodPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between font-normal h-10 mt-1">
                  <div className="flex items-center gap-2 truncate">{selectedPaymentMethodData?.icon && <img src={selectedPaymentMethodData.icon} alt={selectedPaymentMethodData.name} className="w-4 h-4 object-contain" />}<span className="truncate">{selectedPaymentMethodData?.name || "Select payment method..."}</span></div><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command>
                <CommandInput placeholder="Search method..." />
                <CommandList><CommandEmpty>No method found.</CommandEmpty><CommandGroup>
                  {paymentAppsData.map((app) => (<CommandItem key={app.id} value={app.name} onSelect={() => {setFormState({...formState, paymentMethod: app.id}); setPaymentMethodPopoverOpen(false);}}><Check className={cn("mr-2 h-4 w-4", formState.paymentMethod === app.id ? "opacity-100" : "opacity-0")} />{app.icon && <img src={app.icon} alt={app.name} className="w-4 h-4 mr-2" />}{app.name}</CommandItem>))}
                </CommandGroup></CommandList>
              </Command></PopoverContent>
            </Popover>
          </div>
        </div>
        <div>
          <Label htmlFor={`${formType}-recurringNotes`}>Notes (Optional)</Label>
          <Input id={`${formType}-recurringNotes`} value={formState.notes} onChange={(e) => setFormState({ ...formState, notes: e.target.value })} placeholder="Additional details" />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error) {
    return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4"><AlertTriangle className="w-12 h-12 text-destructive mb-4" /><h2 className="text-xl font-semibold text-destructive mb-2">Error</h2><p className="text-muted-foreground mb-4 text-center">{error}</p><Button onClick={fetchRecurringExpenses}>Retry</Button></div>;
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Recurring Expenses</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Manage your regular bills and subscriptions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(isOpen) => { setShowCreateDialog(isOpen); if (!isOpen) setCreateFormState(initialRecurringFormState); }}>
          <DialogTrigger asChild><Button className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" />Add Recurring</Button></DialogTrigger>
          <DialogContent className="text-foreground"><DialogHeader><DialogTitle>Add New Recurring Expense</DialogTitle></DialogHeader>{renderRecurringForm(createFormState, setCreateFormState, 'create')}<DialogFooter><DialogClose asChild><Button variant="outline" disabled={processingAction === 'create'}>Cancel</Button></DialogClose><Button onClick={handleCreateRecurring} disabled={processingAction === 'create'}>{processingAction === 'create' ? 'Adding...' : 'Add Recurring Expense'}</Button></DialogFooter></DialogContent>
        </Dialog>
      </div>

      {recurringExpenses.length === 0 && !isLoading ? (
         <Card><CardContent className="p-6 text-center text-muted-foreground"><Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />No recurring expenses found. <br/> Add your subscriptions and regular bills to get started.</CardContent></Card>
      ) : (
        <div className="space-y-6">
          {renderExpenseList("Overdue", overdue, true)}
          {renderExpenseList("Due This Week", dueThisWeek, true)}
          {renderExpenseList("Upcoming", upcoming, false)}
        </div>
      )}
      
      {editingExpenseId && (
        <Dialog open={showEditDialog} onOpenChange={(isOpen) => { setShowEditDialog(isOpen); if (!isOpen) setEditingExpenseId(null); }}>
            <DialogContent className="bg-card border text-foreground border-card flex flex-col max-h-[90vh] sm:max-h-[80vh] w-[90vw] max-w-lg p-0 rounded-lg shadow-lg">
                <DialogHeader className="p-6 pb-4 border-b"><DialogTitle>Edit Recurring Expense: {editFormState.name}</DialogTitle></DialogHeader>
                <div className="flex-grow overflow-y-auto px-6 py-4">{renderRecurringForm(editFormState, setEditFormState, 'edit')}</div>
                <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 border-t">
                    <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0" disabled={!!processingAction}>Cancel</Button></DialogClose>
                    <Button onClick={handleUpdateRecurring} className="w-full sm:w-auto" disabled={!!processingAction}>{processingAction === editingExpenseId ? "Saving..." : "Save Changes"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Recurring;