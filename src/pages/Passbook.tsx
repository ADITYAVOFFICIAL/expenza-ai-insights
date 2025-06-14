import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BookOpenText, AlertTriangle, Search, Filter as FilterIcon, XCircle, PlusCircle, Repeat, ArrowDownUp, TrendingDown, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, GenericDocData, COLLECTIONS, storageService } from '@/lib/appwrite';
import { Expense } from '@/types/expense';
import ExpenseCard from '@/components/ExpenseCard';
import { toast } from '@/hooks/use-toast';
import {
  format,
  parseISO,
  isWithinInterval,
  subMonths,
  compareDesc,
  isSameDay,
  isSameYear,
  startOfToday,
  startOfYesterday,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isValid,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import ExpenseForm from '@/components/ExpenseForm';
import { Allowance } from '@/lib/allowanceService';
import banksData from '@/data/banks.json';
import paymentAppsData from '@/data/paymentApps.json';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

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
const ALL_PAYMENT_METHODS_VALUE = "__ALL_PAYMENT_METHODS__";

interface BankSuggestion { name: string; icon?: string; }
interface PaymentMethodSuggestion { id: string; name: string; icon?: string; }

const Passbook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allFetchedTransactions, setAllFetchedTransactions] = useState<Expense[]>([]);
  const [displayTransactions, setDisplayTransactions] = useState<GroupedTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBank, setFilterBank] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('thisMonth');
  const [filterType, setFilterType] = useState('all');
  const [filterMinAmount, setFilterMinAmount] = useState('');
  const [filterMaxAmount, setFilterMaxAmount] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'amountHigh' | 'amountLow'>('newest');

  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueBanks, setUniqueBanks] = useState<BankSuggestion[]>([]);
  const [uniquePaymentMethods, setUniquePaymentMethods] = useState<PaymentMethodSuggestion[]>([]);

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
      const expensesRes = await databaseService.getExpenses(user.$id, 5000);
      const fetchedExpenses = (expensesRes.documents as unknown as Expense[]) || [];
      
      const today = new Date();
      const historicalTransactions = fetchedExpenses.filter(tx => {
          const txDate = parseISO(tx.date);
          return isValid(txDate) && txDate <= today;
      });

      const categories = new Set<string>();
      const bankNamesSet = new Set<string>();
      const paymentMethodIdsSet = new Set<string>();

      historicalTransactions.forEach(tx => {
        if (tx.category) categories.add(tx.category);
        if (tx.bank) bankNamesSet.add(tx.bank);
        const paymentId = tx.paymentMethod || (tx as any).paymentApp;
        if (paymentId) paymentMethodIdsSet.add(paymentId);
      });
      setUniqueCategories(Array.from(categories).sort());
      
      const bankSuggestionsList: BankSuggestion[] = Array.from(bankNamesSet).sort().map(name => {
        const bankFromFile = banksData.find(b => b.name.toLowerCase() === name.toLowerCase());
        return { name, icon: bankFromFile?.icon };
      });
      setUniqueBanks(bankSuggestionsList);

      const paymentMethodSuggestionsList: PaymentMethodSuggestion[] = Array.from(paymentMethodIdsSet).map(idOrName => {
        const appDetail = paymentAppsData.find(app => app.id.toLowerCase() === idOrName.toLowerCase() || app.name.toLowerCase() === idOrName.toLowerCase());
        return appDetail ? { id: appDetail.id, name: appDetail.name, icon: appDetail.icon } : { id: idOrName, name: idOrName, icon: undefined };
      }).sort((a, b) => a.name.localeCompare(b.name));
      setUniquePaymentMethods(paymentMethodSuggestionsList);

      setAllFetchedTransactions(historicalTransactions);

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

  const { filteredData, summary } = useMemo(() => {
    if (isLoading) return { filteredData: [], summary: { count: 0, income: 0, expenses: 0, net: 0 } };

    let filtered = [...allFetchedTransactions];

    if (filterType === 'expense') filtered = filtered.filter(tx => tx.amount >= 0);
    if (filterType === 'income') filtered = filtered.filter(tx => tx.amount < 0);

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.name.toLowerCase().includes(lowerSearchTerm) ||
        (tx.notes && tx.notes.toLowerCase().includes(lowerSearchTerm)) ||
        tx.category.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (filterCategory) filtered = filtered.filter(tx => tx.category === filterCategory);
    if (filterBank) filtered = filtered.filter(tx => tx.bank === filterBank);
    if (filterPaymentMethod) filtered = filtered.filter(tx => (tx.paymentMethod || (tx as any).paymentApp) === filterPaymentMethod);

    const min = parseFloat(filterMinAmount);
    const max = parseFloat(filterMaxAmount);
    if (!isNaN(min)) filtered = filtered.filter(tx => Math.abs(tx.amount) >= min);
    if (!isNaN(max)) filtered = filtered.filter(tx => Math.abs(tx.amount) <= max);

    if (filterDateRange !== 'all') {
      const now = new Date();
      let startDate: Date, endDate: Date;
      switch (filterDateRange) {
        case 'today': startDate = startOfToday(); endDate = endOfMonth(now); break;
        case 'yesterday': startDate = startOfYesterday(); endDate = startOfYesterday(); break;
        case 'thisWeek': startDate = startOfWeek(now, { weekStartsOn: 1 }); endDate = endOfWeek(now, { weekStartsOn: 1 }); break;
        case 'thisMonth': startDate = startOfMonth(now); endDate = endOfMonth(now); break;
        case 'lastMonth': const lms = startOfMonth(subMonths(now, 1)); startDate = lms; endDate = endOfMonth(lms); break;
        case 'last3Months': startDate = startOfMonth(subMonths(now, 2)); endDate = endOfMonth(now); break;
        default: startDate = new Date(0); endDate = addMonths(now, 12); break;
      }
      filtered = filtered.filter(tx => isValid(parseISO(tx.date)) && isWithinInterval(parseISO(tx.date), { start: startDate, end: endOfMonth(endDate) }));
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'amountHigh') return Math.abs(b.amount) - Math.abs(a.amount);
      if (sortOrder === 'amountLow') return Math.abs(a.amount) - Math.abs(b.amount);
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return sortOrder === 'newest' ? compareDesc(dateA, dateB) : -compareDesc(dateA, dateB);
    });
    
    const income = filtered.filter(tx => tx.amount < 0).reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
    const expenses = filtered.filter(tx => tx.amount >= 0).reduce((acc, tx) => acc + tx.amount, 0);

    const summary = {
      count: filtered.length,
      income,
      expenses,
      net: income - expenses,
    };

    return { filteredData: filtered, summary };
  }, [allFetchedTransactions, searchTerm, filterCategory, filterBank, filterPaymentMethod, filterDateRange, filterType, filterMinAmount, filterMaxAmount, sortOrder, isLoading]);

  useEffect(() => {
    const today = startOfToday();
    const yesterday = startOfYesterday();
    const groups: GroupedTransaction[] = [];
    let lastLabel = "";

    filteredData.forEach(tx => {
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
  }, [filteredData, getRelativeDateLabel]);

  const handleEditTransaction = (transaction: Expense) => {
    const transactionToEdit = { ...transaction, paymentApp: transaction.paymentMethod || (transaction as any).paymentApp };
    setEditingTransaction(transactionToEdit);
    setShowEditTransactionDialog(true);
  };

  const handleUpdateSubmittedTransaction = async (expenseFormData: Partial<Expense>) => {
    if (!editingTransaction?.$id || !user?.$id) return;
    setIsSubmittingEdit(true);
    try {
      await databaseService.updateExpense(editingTransaction.$id, {
        name: expenseFormData.name!, amount: expenseFormData.amount!, date: expenseFormData.date!,
        category: expenseFormData.category!, currency: expenseFormData.currency || 'INR', notes: expenseFormData.notes || undefined,
        paymentMethod: (expenseFormData as any).paymentApp || undefined, bank: expenseFormData.bank || undefined,
        billImage: expenseFormData.billImage, isRecurring: expenseFormData.isRecurring || false,
        groupId: expenseFormData.groupId || undefined, paidBy: expenseFormData.paidBy || undefined,
        splitBetween: expenseFormData.splitBetween && expenseFormData.splitBetween.length > 0 ? expenseFormData.splitBetween : undefined,
        isSettled: expenseFormData.isSettled,
      });
      toast({ title: "Transaction Updated", description: "The transaction has been successfully updated." });
      setShowEditTransactionDialog(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error Updating Transaction", description: error.message || "Failed to update transaction.", variant: "destructive" });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user?.$id) return;
    if (window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      try {
        const transactionToDelete = await databaseService.getDocument(COLLECTIONS.EXPENSES, transactionId);
        const billImageId = (transactionToDelete as unknown as Expense).billImage;
        await databaseService.deleteExpense(transactionId);
        if (billImageId) {
          try { await storageService.deleteFile(billImageId); } 
          catch (fileError) { console.error("Error deleting bill image:", fileError); }
        }
        toast({ title: "Expense Deleted", description: "The expense has been successfully deleted." });
        fetchData();
      } catch (error) {
        toast({ title: "Error", description: "Could not delete the expense.", variant: "destructive" });
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm(''); setFilterCategory(''); setFilterBank(''); setFilterPaymentMethod('');
    setFilterDateRange('thisMonth'); setFilterType('all'); setFilterMinAmount(''); setFilterMaxAmount('');
    setSortOrder('newest');
  };

  useEffect(() => {
    const fetchBankSuggestions = async () => {
      if (showEditTransactionDialog && user?.$id) {
        try {
          const allowancesRes = await databaseService.getAllowances(user.$id);
          const allowancesDocs = (allowancesRes.documents as unknown as Allowance[]);
          const uniqueBankNames = new Set<string>();
          allowancesDocs.forEach(allowance => { if (allowance.bankName) uniqueBankNames.add(allowance.bankName); });
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
        } catch (error) { console.error("Error fetching bank suggestions for edit:", error); }
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
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || filterCategory || filterBank || filterPaymentMethod || filterDateRange !== 'thisMonth' || filterType !== 'all' || filterMinAmount || filterMaxAmount;
  const selectedBankForFilter = uniqueBanks.find(b => b.name === filterBank);
  const selectedPaymentMethodForFilter = uniquePaymentMethods.find(pm => pm.id === filterPaymentMethod);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpenText className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Passbook</h1>
            <p className="text-muted-foreground text-sm lg:text-base">A complete history of all your transactions.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><FilterIcon className="w-5 h-5" /> Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search by name, notes, category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select value={filterDateRange} onValueChange={setFilterDateRange}><SelectTrigger><SelectValue placeholder="Select Date Range" /></SelectTrigger><SelectContent>{DATE_RANGE_OPTIONS.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select>
            <Select value={filterType} onValueChange={setFilterType}><SelectTrigger><SelectValue placeholder="Transaction Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Transactions</SelectItem><SelectItem value="expense">Expenses</SelectItem><SelectItem value="income">Income</SelectItem></SelectContent></Select>
            <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest' | 'amountHigh' | 'amountLow') => setSortOrder(value)}><SelectTrigger><SelectValue placeholder="Sort Order" /></SelectTrigger><SelectContent><SelectItem value="newest">Date: Newest First</SelectItem><SelectItem value="oldest">Date: Oldest First</SelectItem><SelectItem value="amountHigh">Amount: High to Low</SelectItem><SelectItem value="amountLow">Amount: Low to High</SelectItem></SelectContent></Select>
            <Select value={filterCategory || ALL_CATEGORIES_VALUE} onValueChange={(value) => setFilterCategory(value === ALL_CATEGORIES_VALUE ? '' : value)}><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger><SelectContent><SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>{uniqueCategories.map(cat => (<SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>))}</SelectContent></Select>
            <Select value={filterBank || ALL_BANKS_VALUE} onValueChange={(value) => setFilterBank(value === ALL_BANKS_VALUE ? '' : value)}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {selectedBankForFilter?.icon && <img src={selectedBankForFilter.icon} alt={selectedBankForFilter.name} className="w-4 h-4 object-contain" />}
                    <span>{selectedBankForFilter?.name || "All Banks"}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent><SelectItem value={ALL_BANKS_VALUE}>All Banks</SelectItem>{uniqueBanks.map(bank => (<SelectItem key={bank.name} value={bank.name}><div className="flex items-center gap-2">{bank.icon && <img src={bank.icon} alt={bank.name} className="w-4 h-4 object-contain mr-2" />}{bank.name}</div></SelectItem>))}</SelectContent>
            </Select>
            <Select value={filterPaymentMethod || ALL_PAYMENT_METHODS_VALUE} onValueChange={(value) => setFilterPaymentMethod(value === ALL_PAYMENT_METHODS_VALUE ? '' : value)}>
              <SelectTrigger>
                <SelectValue>
                  <div className="flex items-center gap-2">
                    {selectedPaymentMethodForFilter?.icon && <img src={selectedPaymentMethodForFilter.icon} alt={selectedPaymentMethodForFilter.name} className="w-4 h-4 object-contain rounded" />}
                    <span>{selectedPaymentMethodForFilter?.name || "All Payment Methods"}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent><SelectItem value={ALL_PAYMENT_METHODS_VALUE}>All Payment Methods</SelectItem>{uniquePaymentMethods.map(pm => (<SelectItem key={pm.id} value={pm.id}><div className="flex items-center gap-2">{pm.icon && <img src={pm.icon} alt={pm.name} className="w-4 h-4 object-contain mr-2 rounded" />}{pm.name}</div></SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input type="number" placeholder="Min Amount (₹)" value={filterMinAmount} onChange={e => setFilterMinAmount(e.target.value)} />
            <Input type="number" placeholder="Max Amount (₹)" value={filterMaxAmount} onChange={e => setFilterMaxAmount(e.target.value)} />
          </div>
          {hasActiveFilters && (<Button variant="ghost" onClick={clearFilters} className="text-sm text-primary hover:text-primary/80 p-0 h-auto mt-4"><XCircle className="w-4 h-4 mr-2" />Clear All Filters</Button>)}
        </CardContent>
      </Card>

      <Card className="border-dashed"><CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
        <div className="text-sm text-muted-foreground">Showing <span className="font-bold text-foreground">{summary.count}</span> transactions</div>
        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium text-green-600 dark:text-green-400"><TrendingUp className="w-4 h-4"/>Income: ₹{summary.income.toLocaleString()}</div>
        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium text-red-600 dark:text-red-500"><TrendingDown className="w-4 h-4"/>Expenses: ₹{summary.expenses.toLocaleString()}</div>
        <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-bold"><ArrowDownUp className="w-4 h-4 text-muted-foreground"/>Net: <span className={cn(summary.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-500')}>₹{summary.net.toLocaleString()}</span></div>
      </CardContent></Card>

      {isLoading && allFetchedTransactions.length > 0 && (<div className="flex items-center justify-center py-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div><p className="ml-2 text-muted-foreground">Applying filters...</p></div>)}

      {displayTransactions.length === 0 && !isLoading ? (
        <Card className="mt-4"><CardContent className="flex flex-col items-center justify-center p-6 sm:p-10 text-center min-h-[250px]"><BookOpenText className="w-16 h-16 mb-4 text-muted-foreground opacity-50" /><p className="text-lg font-semibold text-foreground mb-2">{hasActiveFilters ? "No Transactions Match Filters" : "No Transactions Found"}</p><p className="text-sm text-muted-foreground mb-6 max-w-sm">{hasActiveFilters ? "Try adjusting your search terms or filters to find what you're looking for." : "It looks like you haven't added any expenses yet. Get started by recording a transaction."}</p>{hasActiveFilters ? (<Button variant="outline" onClick={clearFilters}><FilterX className="w-4 h-4 mr-2" /> Clear Filters</Button>) : (<div className="flex flex-col sm:flex-row gap-3"><Button asChild size="lg"><Link to="/add-expense"><PlusCircle className="w-4 h-4 mr-2" /> Add New Expense</Link></Button><Button variant="outline" asChild size="lg"><Link to="/recurring"><Repeat className="w-4 h-4 mr-2" /> Manage Recurring</Link></Button></div>)}</CardContent></Card>
      ) : (
        <TooltipProvider delayDuration={200}>
          {displayTransactions.map((group) => (
            <div key={group.dateLabel}>
              <h3 className="text-sm font-semibold text-muted-foreground my-3 px-1">{group.dateLabel}</h3>
              <div className="space-y-3">
                {group.transactions.map((transaction) => (
                  <ExpenseCard key={transaction.$id} expense={transaction} onEdit={() => handleEditTransaction(transaction)} onDelete={() => handleDeleteTransaction(transaction.$id!)} />
                ))}
              </div>
            </div>
          ))}
        </TooltipProvider>
      )}

       {editingTransaction && (
        <Dialog open={showEditTransactionDialog} onOpenChange={(isOpen) => { setShowEditTransactionDialog(isOpen); if (!isOpen) setEditingTransaction(null); }}>
          <DialogContent className="bg-card border text-foreground border-card flex flex-col max-h-[90vh] sm:max-h-[80vh] w-[90vw] max-w-lg p-0 rounded-lg shadow-lg">
            <DialogHeader className="p-6 pb-4 border-b"><DialogTitle>Edit Transaction</DialogTitle></DialogHeader>
            <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
              <ExpenseForm formId="edit-transaction-form" onSubmit={handleUpdateSubmittedTransaction} isLoading={isSubmittingEdit} initialData={editingTransaction} isEditing={true} bankSuggestions={bankSuggestionsForEdit} onDelete={handleDeleteTransaction} />
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 border-t">
              <DialogClose asChild><Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0" disabled={isSubmittingEdit}>Cancel</Button></DialogClose>
              <Button type="submit" form="edit-transaction-form" className="w-full sm:w-auto" disabled={isSubmittingEdit}>{isSubmittingEdit ? "Updating..." : "Update Transaction"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Passbook;