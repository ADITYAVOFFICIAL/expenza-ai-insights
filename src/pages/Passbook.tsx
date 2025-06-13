import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpenText, AlertTriangle, Repeat, Search, Filter as FilterIcon, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/appwrite';
import { Expense, RecurringExpense } from '@/types/expense';
import ExpenseCard from '@/components/ExpenseCard';
import { toast } from '@/hooks/use-toast';
import {
  format,
  parseISO,
  isWithinInterval,
  subMonths,
  addMonths,
  compareDesc,
  isSameDay,
  isSameYear,
  startOfToday,
  startOfYesterday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface GroupedTransaction {
  dateLabel: string;
  transactions: Expense[];
}

const DATE_RANGE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
];

const ALL_CATEGORIES_VALUE = "__ALL_CATEGORIES__";
const ALL_BANKS_VALUE = "__ALL_BANKS__";

interface BankSuggestion {
  name: string;
  icon?: string;
}

const Passbook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allFetchedTransactions, setAllFetchedTransactions] = useState<Expense[]>([]);
  const [displayTransactions, setDisplayTransactions] = useState<GroupedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState(''); // Empty string means no filter / show placeholder
  const [filterBank, setFilterBank] = useState(''); // Empty string means no filter / show placeholder
  const [filterDateRange, setFilterDateRange] = useState('all');

  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueBanks, setUniqueBanks] = useState<string[]>([]);

  const [showEditTransactionDialog, setShowEditTransactionDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Expense | null>(null);
  const [bankSuggestionsForEdit, setBankSuggestionsForEdit] = useState<BankSuggestion[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const getRelativeDateLabel = useCallback((date: Date, today: Date, yesterday: Date): string => {
    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, yesterday)) return "Yesterday";
    if (isSameYear(date, today)) return format(date, 'MMMM d');
    return format(date, 'MMMM d, yyyy');
  }, []);

  const fetchData = useCallback(async () => {
    if (!user?.$id) {
      setError("User not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [expensesRes, recurringExpensesRes] = await Promise.all([
        databaseService.getExpenses(user.$id, 500),
        databaseService.getRecurringExpenses(user.$id),
      ]);

      const fetchedExpenses = (expensesRes.documents as unknown as Expense[]) || [];
      const fetchedRecurringTemplates = (recurringExpensesRes.documents as unknown as RecurringExpense[]) || [];

      const today = startOfToday();
      const recurringWindowStartDate = subMonths(today, 6);
      const recurringWindowEndDate = addMonths(today, 6);

      const virtualRecurringExpenses: Expense[] = fetchedRecurringTemplates
        .filter(re => re.isActive && re.nextDueDate)
        .filter(re => {
          try {
            const dueDate = parseISO(re.nextDueDate);
            return isWithinInterval(dueDate, { start: recurringWindowStartDate, end: recurringWindowEndDate });
          } catch { return false; }
        })
        .map(re => ({
          $id: `recurring-${re.$id}-${re.nextDueDate}`,
          userId: re.userId,
          name: re.name,
          amount: re.amount,
          category: re.category,
          date: re.nextDueDate,
          paymentMethod: re.paymentMethod || 'Auto-Pay',
          bank: re.bank,
          notes: re.notes || `Scheduled: ${re.name}`,
          isRecurring: true,
          currency: 'INR',
          $createdAt: parseISO(re.nextDueDate).toISOString(),
          $updatedAt: parseISO(re.nextDueDate).toISOString(),
        }));

      const combinedTransactions = [...fetchedExpenses, ...virtualRecurringExpenses];

      const categories = new Set<string>();
      const banks = new Set<string>();
      combinedTransactions.forEach(tx => {
        if (tx.category) categories.add(tx.category);
        if (tx.bank) banks.add(tx.bank);
      });
      setUniqueCategories(Array.from(categories).sort());
      setUniqueBanks(Array.from(banks).sort());

      setAllFetchedTransactions(combinedTransactions);

    } catch (err) {
      console.error("Error fetching passbook data:", err);
      setError("Failed to load transaction data.");
      toast({ title: "Error", description: "Could not load passbook data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isLoading && allFetchedTransactions.length === 0) return;

    let filtered = [...allFetchedTransactions];

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.name.toLowerCase().includes(lowerSearchTerm) ||
        (tx.notes && tx.notes.toLowerCase().includes(lowerSearchTerm)) ||
        tx.category.toLowerCase().includes(lowerSearchTerm) ||
        (tx.bank && tx.bank.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (filterCategory) { // filterCategory will be '' if "All Categories" is selected
      filtered = filtered.filter(tx => tx.category === filterCategory);
    }

    if (filterBank) { // filterBank will be '' if "All Banks" is selected
      filtered = filtered.filter(tx => tx.bank === filterBank);
    }

    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate: Date, endDate: Date;
      switch (filterDateRange) {
        case 'today':
          startDate = startOfToday();
          endDate = startOfToday();
          break;
        case 'yesterday':
          startDate = startOfYesterday();
          endDate = startOfYesterday();
          break;
        case 'thisWeek':
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          endDate = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'thisMonth':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'lastMonth':
          const lastMonthStart = startOfMonth(subMonths(now, 1));
          startDate = lastMonthStart;
          endDate = endOfMonth(lastMonthStart);
          break;
        case 'last3Months':
          startDate = startOfMonth(subMonths(now, 2));
          endDate = endOfMonth(now);
          break;
        default:
          startDate = new Date(0);
          endDate = addMonths(now, 12);
          break;
      }

      filtered = filtered.filter(tx => {
        try {
          const txDate = parseISO(tx.date);
          if (filterDateRange === 'today' || filterDateRange === 'yesterday') {
            return isSameDay(txDate, startDate);
          }
          // For other ranges, ensure the date is within the interval (inclusive of start and end)
          // For isWithinInterval, the end date should typically be the end of the day.
          // Let's adjust endDate for ranges to be end of day for clarity, though isWithinInterval handles it.
          const effectiveEndDate = (filterDateRange === 'today' || filterDateRange === 'yesterday') ? startDate : endOfMonth(endDate); // or endOfDay(endDate) if more precise
          return isWithinInterval(txDate, { start: startDate, end: effectiveEndDate });
        } catch { return false; }
      });
    }

    filtered.sort((a, b) => {
      try {
        return compareDesc(parseISO(a.date), parseISO(b.date));
      } catch { return 0; }
    });

    const today = startOfToday();
    const yesterday = startOfYesterday();
    const groups: GroupedTransaction[] = [];
    let lastLabel = "";

    filtered.forEach(tx => {
      const date = parseISO(tx.date);
      const currentLabel = getRelativeDateLabel(date, today, yesterday);
      if (currentLabel !== lastLabel) {
        groups.push({ dateLabel: currentLabel, transactions: [tx] });
        lastLabel = currentLabel;
      } else {
        groups[groups.length - 1].transactions.push(tx);
      }
    });

    setDisplayTransactions(groups);

  }, [allFetchedTransactions, searchTerm, filterCategory, filterBank, filterDateRange, getRelativeDateLabel, isLoading]);


  const handleEditTransaction = (transaction: Expense) => {
    if (transaction.isRecurringInstance || transaction.$id?.startsWith('recurring-')) {
      toast({ title: "Info", description: "Manage scheduled expenses from the 'Recurring' page.", variant: "default" });
      navigate('/recurring');
      return;
    }
    // Ensure the expense object passed to initialData has paymentApp if paymentMethod exists
    const transactionToEdit = {
      ...transaction,
      paymentApp: transaction.paymentMethod || (transaction as any).paymentApp
    };
    setEditingTransaction(transactionToEdit);
    setShowEditTransactionDialog(true);
  };

  const handleUpdateSubmittedTransaction = async (expenseFormData: Partial<Expense>) => {
    if (!editingTransaction?.$id || !user?.$id) {
      toast({ title: "Error", description: "Cannot update transaction. Missing ID or user information.", variant: "destructive" });
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

      await databaseService.updateExpense(editingTransaction.$id, dataToUpdate);
      toast({ title: "Transaction Updated", description: "The transaction has been successfully updated." });
      setShowEditTransactionDialog(false);
      setEditingTransaction(null);
      fetchData();
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      toast({ title: "Error Updating Transaction", description: error.message || "Failed to update transaction. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string, isVirtualRecurring?: boolean) => {
    if (isVirtualRecurring) {
      toast({ title: "Info", description: "Manage scheduled expenses from the 'Recurring' page.", variant: "default" });
      navigate('/recurring');
      return;
    }
    if (!user?.$id) return;

    try {
      await databaseService.deleteExpense(transactionId);
      toast({ title: "Expense Deleted", description: "The expense has been successfully deleted." });
      fetchData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({ title: "Error", description: "Could not delete the expense.", variant: "destructive" });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterBank('');
    setFilterDateRange('all');
  };

  useEffect(() => {
    const fetchBankSuggestions = async () => {
      if (showEditTransactionDialog && user?.$id) {
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
        }
      }
    };
    fetchBankSuggestions();
  }, [showEditTransactionDialog, user]);

  if (isLoading && allFetchedTransactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your passbook...</p>
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

  const hasActiveFilters = searchTerm || filterCategory || filterBank || filterDateRange !== 'all';

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BookOpenText className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Passbook</h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              View all your actual and scheduled transactions.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FilterIcon className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, notes, category, bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select value={filterDateRange} onValueChange={setFilterDateRange}>
              <SelectTrigger><SelectValue placeholder="Select Date Range" /></SelectTrigger>
              <SelectContent>
                {DATE_RANGE_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterCategory || ALL_CATEGORIES_VALUE} // Show placeholder if filterCategory is ''
              onValueChange={(value) => setFilterCategory(value === ALL_CATEGORIES_VALUE ? '' : value)}
            >
              <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
                {uniqueCategories.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterBank || ALL_BANKS_VALUE} // Show placeholder if filterBank is ''
              onValueChange={(value) => setFilterBank(value === ALL_BANKS_VALUE ? '' : value)}
            >
              <SelectTrigger><SelectValue placeholder="Select Bank" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_BANKS_VALUE}>All Banks</SelectItem>
                {uniqueBanks.map(bank => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-sm text-primary hover:text-primary/80">
              <XCircle className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {isLoading && allFetchedTransactions.length > 0 && ( // Show subtle loading indicator when refiltering
        <div className="flex items-center justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-2 text-muted-foreground">Applying filters...</p>
        </div>
      )}

      {!isLoading && displayTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <BookOpenText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            {hasActiveFilters ? "No transactions match your current filters." : "No transactions found."}
            <br />
            {hasActiveFilters ? (
                <Button variant="link" className="p-0 h-auto" onClick={clearFilters}>
                    Clear filters to see all transactions
                </Button>
            ) : (
                <>
                <Button variant="link" className="p-0 h-auto" asChild>
                    <Link to="/add-expense">Add your first expense</Link>
                </Button>
                or check your recurring schedule.
                </>
            )}
          </CardContent>
        </Card>
      ) : (
        <TooltipProvider delayDuration={200}>
          {displayTransactions.map((group) => (
            <div key={group.dateLabel}>
              <h3 className="text-sm font-semibold text-muted-foreground my-3 px-1">{group.dateLabel}</h3>
              <div className="space-y-3">
                {group.transactions.map((transaction) => (
                  <ExpenseCard
                    key={transaction.$id || transaction.name + transaction.date} // Use a more robust key for virtual instances
                    expense={transaction}
                    onEdit={() => handleEditTransaction(transaction)}
                    onDelete={() => handleDeleteTransaction(transaction.$id!, transaction.isRecurringInstance)}
                  />
                ))}
              </div>
            </div>
          ))}
        </TooltipProvider>
      )}

      {editingTransaction && (
        <Dialog open={showEditTransactionDialog} onOpenChange={(isOpen) => {
          setShowEditTransactionDialog(isOpen);
          if (!isOpen) setEditingTransaction(null);
        }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            <ExpenseForm
              onSubmit={handleUpdateSubmittedTransaction}
              isLoading={isSubmittingEdit}
              initialData={editingTransaction}
              isEditing={true}
              bankSuggestions={bankSuggestionsForEdit}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Passbook;