import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ListChecks,
  CreditCard,
  Tag,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/appwrite';
import { Expense, RecurringExpense } from '@/types/expense';
import { toast } from '@/hooks/use-toast';
import {
  parseISO,
  format,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  differenceInDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  isValid,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  endOfDay,
} from 'date-fns';
import paymentAppsData from '@/data/paymentApps.json';
import banksData from '@/data/banks.json';
import categoriesData from '@/data/categories.json';
import { useIsMobile } from '@/hooks/use-mobile';
import AnalyticsExportDialog, { AnalyticsExportableData } from '@/components/AnalyticsExportDialog';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280', '#ec4899', '#6366f1'];

interface BankSuggestion {
  name: string;
  icon?: string;
  label: string;
}

interface ReportCategoryDetail {
  id: string;
  name: string;
  label: string;
  iconName?: string;
  IconComponent: React.ElementType;
}

const reportChartConfigs = [
  { id: 'reportCategoryPieChartWrapper', title: 'Expenses by Category Chart' },
  { id: 'reportExpenseTrendChartWrapper', title: 'Expense Trend Chart' },
];

const reportDataSetOptions = [
  { id: 'summaryMetrics', label: 'Summary Metrics', defaultSelected: true },
  { id: 'monthlyTrends', label: 'Expense Trend Over Time', defaultSelected: true },
  { id: 'categorySpending', label: 'Spending by Category', defaultSelected: true },
  { id: 'expenseByBank', label: 'Expenses by Bank', defaultSelected: true },
  { id: 'allExpenses', label: 'Detailed Expense List (Raw Data)', defaultSelected: true },
  { id: 'dailySpending', label: 'Daily Spending Trend (N/A for Reports)', defaultSelected: false },
  { id: 'allowanceByBank', label: 'Allowances by Bank (N/A for Reports)', defaultSelected: false },
];

const Reports = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [allRecurringExpenses, setAllRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState('thisMonth');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [currentReportExportData, setCurrentReportExportData] = useState<AnalyticsExportableData | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.$id) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [expensesResponse, recurringResponse] = await Promise.all([
        databaseService.getExpenses(user.$id, 2000), 
        databaseService.getRecurringExpenses(user.$id),
      ]);
      
      setAllExpenses(expensesResponse.documents as unknown as Expense[]);
      setAllRecurringExpenses(recurringResponse.documents as unknown as RecurringExpense[]);

    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError("Failed to load report data. Please try again.");
      toast({ title: "Error", description: err.message || "Could not load data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dateInterval = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfDay(endOfMonth(now)) };
      case 'lastMonth':
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        return { start: lastMonthStart, end: endOfDay(endOfMonth(lastMonthStart)) };
      case 'last3Months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfDay(endOfMonth(now)) };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfDay(endOfYear(now)) };
      default:
        return { start: startOfMonth(now), end: endOfDay(endOfMonth(now)) };
    }
  }, [dateRange]);

  const processedRecurringInstances = useMemo(() => {
    const instances: Expense[] = [];
    if (!dateInterval.start || !dateInterval.end) return instances;

    const intervalStart = dateInterval.start;
    const intervalEnd = dateInterval.end;

    allRecurringExpenses.forEach(re => {
      if (!re.isActive || !re.nextDueDate || !re.frequency || re.amount <= 0) return;
      let currentPaymentDate = parseISO(re.nextDueDate);
      if (!isValid(currentPaymentDate)) return;

      while (currentPaymentDate < intervalStart) {
        let advanced = false;
        if (re.frequency === 'daily') { currentPaymentDate = addDays(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'weekly') { currentPaymentDate = addWeeks(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'monthly') { currentPaymentDate = addMonths(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'yearly') { currentPaymentDate = addYears(currentPaymentDate, 1); advanced = true; }
        if (!advanced || !isValid(currentPaymentDate)) return; 
      }

      while (isValid(currentPaymentDate) && currentPaymentDate <= intervalEnd) {
        instances.push({
          $id: `rec-${re.$id}-${format(currentPaymentDate, 'yyyyMMdd')}`,
          userId: re.userId,
          name: re.name, 
          amount: re.amount,
          category: re.category,
          date: format(currentPaymentDate, 'yyyy-MM-dd'),
          bank: re.bank,
          paymentMethod: re.paymentMethod,
          notes: re.notes || `Recurring schedule: ${re.frequency}`,
          isRecurringInstance: true,
          currency: 'INR', 
          $createdAt: currentPaymentDate.toISOString(),
          $updatedAt: currentPaymentDate.toISOString(),
        } as Expense); 

        let advanced = false;
        if (re.frequency === 'daily') { currentPaymentDate = addDays(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'weekly') { currentPaymentDate = addWeeks(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'monthly') { currentPaymentDate = addMonths(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'yearly') { currentPaymentDate = addYears(currentPaymentDate, 1); advanced = true; }
        if (!advanced) break; 
      }
    });
    return instances;
  }, [allRecurringExpenses, dateInterval]);

  const combinedExpenses = useMemo(() => {
    return [...allExpenses, ...processedRecurringInstances];
  }, [allExpenses, processedRecurringInstances]);
  
  const filteredTransactions = useMemo(() => {
    return combinedExpenses.filter(expense => {
      if (!expense.date || !dateInterval.start || !dateInterval.end) return false;
      const expenseDate = parseISO(expense.date);
      if (!isValid(expenseDate)) return false;

      const inDateRange = isWithinInterval(expenseDate, dateInterval);
      const categoryMatch = categoryFilter === 'all' || expense.category === categoryFilter;
      const bankMatch = bankFilter === 'all' || expense.bank === bankFilter;
      
      return inDateRange && categoryMatch && bankMatch;
    });
  }, [combinedExpenses, dateInterval, categoryFilter, bankFilter]);

  // FIX: Create a separate array that *only* contains positive expenses for expense-specific charts
  const filteredExpenses = useMemo(() => {
    return filteredTransactions.filter(t => t.amount >= 0);
  }, [filteredTransactions]);

  const expensesByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    // Use filteredExpenses (only positive amounts)
    filteredExpenses.forEach(expense => {
      const category = expense.category || 'Others';
      categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
    });
    return Object.entries(categoryMap).map(([name, amount], index) => ({
      name,
      amount,
      color: COLORS[index % COLORS.length],
    })).sort((a,b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const expenseTrendData = useMemo(() => {
    const trendMap: { [key: string]: number } = {};
    if (!filteredExpenses.length || !dateInterval.start || !dateInterval.end) return [];
    
    const daysInInterval = differenceInDays(dateInterval.end, dateInterval.start);
    let periods: Date[];
    let dateFormat: string;

    if (daysInInterval <= 0) return []; 

    if (daysInInterval <= 31) {
      periods = eachDayOfInterval(dateInterval);
      dateFormat = 'MMM dd';
    } else if (daysInInterval <= 93) {
      periods = eachWeekOfInterval(dateInterval, { weekStartsOn: 1 });
      dateFormat = "MMM dd'W'";
    } else {
      periods = eachMonthOfInterval(dateInterval);
      dateFormat = 'MMM yyyy';
    }
    
    const periodObjects: {date: Date, label: string}[] = periods.map(p => ({date: p, label: format(p, dateFormat)}));
    periodObjects.forEach(pObj => trendMap[pObj.label] = 0);

    // Use filteredExpenses (only positive amounts)
    filteredExpenses.forEach(expense => {
        const expenseDate = parseISO(expense.date);
        if (!isValid(expenseDate)) return;

        let periodLabelToUpdate: string | null = null;
        for (const pObj of periodObjects) {
            if (daysInInterval <= 31) {
                if (format(expenseDate, 'MMM dd') === pObj.label) {
                    periodLabelToUpdate = pObj.label;
                    break;
                }
            } else if (daysInInterval <= 93) {
                const weekStart = startOfWeek(expenseDate, { weekStartsOn: 1 });
                if (format(weekStart, "MMM dd'W'") === pObj.label) {
                    periodLabelToUpdate = pObj.label;
                    break;
                }
            } else {
                if (format(expenseDate, 'MMM yyyy') === pObj.label) {
                    periodLabelToUpdate = pObj.label;
                    break;
                }
            }
        }
        if (periodLabelToUpdate && trendMap.hasOwnProperty(periodLabelToUpdate)) {
            trendMap[periodLabelToUpdate] += expense.amount;
        }
    });

    return periodObjects
        .map(pObj => ({ period: pObj.label, amount: trendMap[pObj.label] || 0, date: pObj.date }))
        .sort((a,b) => a.date.getTime() - b.date.getTime())
        .map(({period, amount}) => ({period, amount}));

  }, [filteredExpenses, dateInterval]);

  const topExpensesList = useMemo(() => {
    // Use filteredExpenses (only positive amounts)
    return [...filteredExpenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .map(exp => ({
        name: exp.name,
        amount: exp.amount,
        date: exp.date ? format(parseISO(exp.date), 'yyyy-MM-dd') : 'N/A',
        category: exp.category,
      }));
  }, [filteredExpenses]);

  const bankWiseExpensesData = useMemo(() => {
    const bankMap: { [key: string]: { bank: string; amount: number; transactions: number } } = {};
    // Use filteredExpenses (only positive amounts)
    filteredExpenses.forEach(expense => {
      const bankName = expense.bank || 'Unknown Bank';
      if (!bankMap[bankName]) {
        bankMap[bankName] = { bank: bankName, amount: 0, transactions: 0 };
      }
      bankMap[bankName].amount += expense.amount;
      bankMap[bankName].transactions += 1;
    });
    return Object.values(bankMap).sort((a,b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const paymentAppUsageData = useMemo(() => {
    const appMap: { [key: string]: { app: string; amount: number; count: number } } = {};
    const nonAppMethodKeywords = ['cash', 'credit card', 'bank transfer', 'debit card', 'other', 'card'];

    // Use filteredExpenses (only positive amounts)
    filteredExpenses.forEach(expense => {
      const paymentIdentifier = expense.paymentMethod;
      let appNameForGrouping: string;

      if (paymentIdentifier) {
        const knownApp = paymentAppsData.find(
          app => app.id.toLowerCase() === paymentIdentifier.toLowerCase() || 
                 app.name.toLowerCase() === paymentIdentifier.toLowerCase()
        );

        if (knownApp) {
          appNameForGrouping = knownApp.name;
        } else {
          if (nonAppMethodKeywords.some(keyword => paymentIdentifier.toLowerCase().includes(keyword))) {
             appNameForGrouping = 'Other/Cash';
          } else {
             appNameForGrouping = paymentIdentifier;
          }
        }
      } else {
        appNameForGrouping = 'Other/Cash';
      }

      if (!appMap[appNameForGrouping]) {
        appMap[appNameForGrouping] = { app: appNameForGrouping, amount: 0, count: 0 };
      }
      appMap[appNameForGrouping].amount += expense.amount;
      appMap[appNameForGrouping].count += 1;
    });
    return Object.values(appMap).sort((a,b) => b.amount - a.amount);
  }, [filteredExpenses]);
  
  const summaryStats = useMemo(() => {
    if (!dateInterval.start || !dateInterval.end) {
        return { totalExpenses: 0, avgDailyExpense: 0, totalTransactions: 0, daysTracked: 0 };
    }
    // Use filteredExpenses (only positive amounts)
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const numDays = differenceInDays(dateInterval.end, dateInterval.start) + 1;
    const avgDaily = numDays > 0 ? total / numDays : 0;
    return {
      totalExpenses: total,
      avgDailyExpense: avgDaily,
      totalTransactions: filteredExpenses.length,
      daysTracked: numDays > 0 ? numDays : 0,
    };
  }, [filteredExpenses, dateInterval]);

  const uniqueCategories = useMemo((): ReportCategoryDetail[] => {
    const categoryIds = new Set<string>();
    allExpenses.forEach(e => { if (e.category) categoryIds.add(e.category); });
    allRecurringExpenses.forEach(re => { if (re.category) categoryIds.add(re.category); });

    const defaultIconComponent = LucideIcons.Tag;

    const categoryDetailsList: ReportCategoryDetail[] = Array.from(categoryIds).sort().map(id => {
      const categoryFromData = categoriesData.find(cat => cat.id.toLowerCase() === id.toLowerCase());
      const name = categoryFromData?.name || id;
      const label = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const iconName = categoryFromData?.icon;
      const Icon = iconName && (LucideIcons as any)[iconName] ? (LucideIcons as any)[iconName] : defaultIconComponent;
      
      return { id, name, label, iconName, IconComponent: Icon };
    });
    
    return [
      { id: 'all', name: 'All Categories', label: 'All Categories', IconComponent: LucideIcons.ListChecks }, 
      ...categoryDetailsList
    ];
  }, [allExpenses, allRecurringExpenses]);

  const selectedCategoryForFilter = useMemo(() => {
    return uniqueCategories.find(c => c.id === categoryFilter);
  }, [uniqueCategories, categoryFilter]);

  const uniqueBanks = useMemo(() => {
    const bankNames = new Set<string>();
    allExpenses.forEach(e => { if (e.bank) bankNames.add(e.bank); });
    allRecurringExpenses.forEach(re => { if (re.bank) bankNames.add(re.bank); });
    
    const suggestions: BankSuggestion[] = Array.from(bankNames).sort().map(name => {
      const bankFromFile = banksData.find(b => b.name.toLowerCase() === name.toLowerCase());
      return { name, icon: bankFromFile?.icon, label: name };
    });
    
    return [{ name: 'all', label: 'All Banks', icon: undefined }, ...suggestions];
  }, [allExpenses, allRecurringExpenses]);

  const selectedBankForFilter = uniqueBanks.find(b => b.name === bankFilter);

  const pieOuterRadius = isMobile ? 70 : 120;
  const pieInnerRadius = isMobile ? 35 : 60;
  const pieLabelMinPercentage = isMobile ? 6 : 3;
  const pieLabelFontSize = isMobile ? 10 : 12;
  const pieLabelNameMaxLength = isMobile ? 7 : 15;
  const legendIconSize = isMobile ? 8 : 10;
  const legendFontSize = isMobile ? '10px' : '12px';

  useEffect(() => {
    if (loading || error || !dateInterval.start || !dateInterval.end || !summaryStats || !expenseTrendData || !expensesByCategory || !bankWiseExpensesData || !filteredTransactions) {
      setCurrentReportExportData(null);
      return;
    }

    const selectedCatLabel = uniqueCategories.find(c => c.id === categoryFilter)?.label || categoryFilter;
    const selectedBankLabel = uniqueBanks.find(b => b.name === bankFilter)?.label || bankFilter;
    const timeFilterLabel = `Report for ${dateRange} (Category: ${categoryFilter === 'all' ? 'All' : selectedCatLabel}, Bank: ${bankFilter === 'all' ? 'All' : selectedBankLabel})`;

    const summaryMetricsData = [
      { label: 'Total Expenses', value: `₹${summaryStats.totalExpenses.toLocaleString()}`, description: timeFilterLabel },
      { label: 'Avg Daily Expense', value: `₹${summaryStats.avgDailyExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, description: timeFilterLabel },
      { label: 'Total Transactions', value: `${summaryStats.totalTransactions}`, description: timeFilterLabel },
      { label: 'Days Tracked', value: `${summaryStats.daysTracked}`, description: timeFilterLabel },
    ];

    const trendData = expenseTrendData.map(item => ({
      month: item.period,
      expenses: item.amount,
      income: 0,
      savings: -item.amount,
    }));

    const categorySpendingData = expensesByCategory.map(cat => ({
      category: uniqueCategories.find(c => c.id === cat.name)?.label || cat.name,
      amount: cat.amount,
      percentage: summaryStats.totalExpenses > 0 ? parseFloat(((cat.amount / summaryStats.totalExpenses) * 100).toFixed(1)) : 0,
    }));

    const bankExpenseData = bankWiseExpensesData.map(bank => ({
      name: bank.bank,
      value: bank.amount,
    }));

    setCurrentReportExportData({
      summaryMetrics: summaryMetricsData,
      monthlyTrends: trendData,
      categorySpending: categorySpendingData,
      dailySpending: [],
      expenseByBank: bankExpenseData,
      allowanceByBank: [],
      allExpenses: filteredTransactions.map(e => ({...e, notes: e.notes || (e.isRecurringInstance ? `Recurring: ${e.name}` : '')})),
      timeFilterLabel,
    });
  }, [
    loading, error, dateInterval, dateRange, categoryFilter, bankFilter,
    summaryStats, expenseTrendData, expensesByCategory, bankWiseExpensesData,
    filteredTransactions, uniqueCategories, uniqueBanks
  ]);

  if (loading) {
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
        <h2 className="text-xl font-semibold text-destructive mb-2">Oops! Something went wrong.</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button onClick={fetchData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
                <p className="text-muted-foreground text-sm lg:text-base">
                Analyze your spending patterns and financial health.
                </p>
            </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="dark:text-foreground"
          onClick={() => {
            if (currentReportExportData) {
              setShowExportDialog(true);
            } else {
              toast({ title: "Data Not Ready", description: "Report data is still loading or not available for export.", variant: "default" });
            }
          }}
          disabled={loading || !!error || !currentReportExportData}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category">
                <div className="flex items-center gap-2">
                  {selectedCategoryForFilter?.IconComponent && (
                    <selectedCategoryForFilter.IconComponent className="w-4 h-4" />
                  )}
                  {selectedCategoryForFilter?.label || "Select Category"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {uniqueCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    {category.IconComponent && (
                      <category.IconComponent className="w-4 h-4 mr-2" />
                    )}
                    {category.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={bankFilter} onValueChange={setBankFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Bank">
                <div className="flex items-center gap-2">
                  {selectedBankForFilter?.icon && (
                    <img src={selectedBankForFilter.icon} alt={selectedBankForFilter.label} className="w-4 h-4 object-contain" />
                  )}
                  {selectedBankForFilter?.label || "Select Bank"}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
               {uniqueBanks.map(bank => (
                <SelectItem key={bank.name} value={bank.name}>
                  <div className="flex items-center gap-2">
                    {bank.icon && (
                      <img src={bank.icon} alt={bank.label} className="w-4 h-4 object-contain mr-2" />
                    )}
                    {bank.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shrink-0">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-xs sm:text-sm text-muted-foreground truncate">Total Expenses</div>
                <div className="text-base sm:text-lg md:text-xl font-bold truncate">₹{summaryStats.totalExpenses.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-xs sm:text-sm text-muted-foreground truncate">Avg Daily</div>
                <div className="text-base sm:text-lg md:text-xl font-bold truncate">₹{summaryStats.avgDailyExpense.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 shrink-0">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-xs sm:text-sm text-muted-foreground truncate">Transactions</div>
                <div className="text-base sm:text-lg md:text-xl font-bold truncate">{summaryStats.totalTransactions}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-grow">
                <div className="text-xs sm:text-sm text-muted-foreground truncate">Days Tracked</div>
                <div className="text-base sm:text-lg md:text-xl font-bold truncate">{summaryStats.daysTracked}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <div id="reportCategoryPieChartWrapper">
                <ResponsiveContainer width="100%" height={isMobile ? 280 : 300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={pieInnerRadius}
                      outerRadius={pieOuterRadius}
                      paddingAngle={2}
                      dataKey="amount"
                      nameKey="name"
                      labelLine={false}
                      label={({ cx, cy, midAngle, outerRadius: currentOuterRadius, percent, name }) => {
                        if ((percent * 100) < pieLabelMinPercentage) return null;
                        const categoryDetail = uniqueCategories.find(c => c.id === name);
                        const displayName = categoryDetail ? categoryDetail.label : name;
                        const radius = currentOuterRadius + (isMobile ? 8 : 15);
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        const textAnchor = x > cx ? 'start' : 'end';
                        const finalDisplayName = displayName.length > pieLabelNameMaxLength ? `${displayName.substring(0, pieLabelNameMaxLength)}...` : displayName;
                        return (
                          <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={textAnchor} dominantBaseline="central" fontSize={pieLabelFontSize}>
                            {`${finalDisplayName} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        );
                      }}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const categoryDetail = uniqueCategories.find(c => c.id === name);
                        const displayName = categoryDetail ? categoryDetail.label : name;
                        return [`₹${value.toLocaleString()}`, displayName];
                      }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  <Legend
                    iconSize={legendIconSize}
                    wrapperStyle={{ fontSize: legendFontSize, paddingTop: isMobile ? '5px' : '0' }}
                    layout={isMobile ? 'horizontal' : 'vertical'}
                    align={isMobile ? 'center' : 'right'}
                    verticalAlign={isMobile ? 'bottom' : 'middle'}
                    formatter={(value) => {
                      const categoryDetail = uniqueCategories.find(c => c.id === value);
                      const displayName = categoryDetail ? categoryDetail.label : value;
                      const nameMaxLength = isMobile ? 10 : 20;
                      return displayName.length > nameMaxLength ? `${displayName.substring(0, nameMaxLength)}...` : displayName;
                    }}
                  />
                </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-muted-foreground text-center py-10">No data for selected filters.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseTrendData.length > 0 ? (
              <div id="reportExpenseTrendChartWrapper">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={expenseTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="period" fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                      labelStyle={{color: 'hsl(var(--foreground))'}}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: 'var(--radius)',
                        color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="amount" name="Expenses" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r:3 }} activeDot={{r:5}}/>
                </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <p className="text-muted-foreground text-center py-10">No data for selected filters.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {topExpensesList.length > 0 ? (
              <div className="space-y-3">
                {topExpensesList.map((expense, index) => {
                  const categoryDetail = uniqueCategories.find(c => c.id === expense.category);
                  const categoryLabel = categoryDetail ? categoryDetail.label : (expense.category || 'N/A');
                  return (
                    <div key={index} className="p-3 rounded-lg hover:bg-muted/20 dark:hover:bg-muted/10 border border-transparent hover:border-border/30 transition-colors duration-150">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                        <div className="flex-grow min-w-0">
                          <div className="font-semibold text-sm sm:text-base text-foreground truncate" title={expense.name}>
                            {expense.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>{expense.date}</span>
                            <Badge variant="outline" className="text-xs capitalize py-0.5 px-1.5">
                              {categoryLabel}
                            </Badge>
                          </div>
                        </div>
                        <div className="sm:text-right flex-shrink-0 mt-1 sm:mt-0">
                          <div className={`font-bold text-sm sm:text-base ${expense.amount >= 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
                            ₹{Math.abs(expense.amount).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-muted-foreground text-center py-10">No top expenses for selected filters.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bank-wise Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {bankWiseExpensesData.length > 0 ? (
              <div className="space-y-3">
                {bankWiseExpensesData.map((bankItem, index) => {
                  const bankDetails = banksData.find(b => b.name.toLowerCase() === bankItem.bank.toLowerCase());
                  return (
                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        {bankDetails?.icon && (
                          <img src={bankDetails.icon} alt={bankDetails.name} className="w-5 h-5 object-contain rounded" />
                        )}
                        <div>
                          <div className="font-medium">{bankItem.bank}</div>
                          <div className="text-sm text-muted-foreground">
                            {bankItem.transactions} transaction{bankItem.transactions === 1 ? '' : 's'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{bankItem.amount.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-muted-foreground text-center py-10">No bank-wise data for selected filters.</p>}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment App Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentAppUsageData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentAppUsageData.map((appUsageItem, index) => {
                const paymentAppDetail = paymentAppsData.find(
                  pa => pa.id.toLowerCase() === appUsageItem.app.toLowerCase() || pa.name.toLowerCase() === appUsageItem.app.toLowerCase()
                );
                return (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {paymentAppDetail?.icon ? (
                        <img src={paymentAppDetail.icon} alt={paymentAppDetail.name} className="w-6 h-6 object-contain rounded" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-muted-foreground" /> 
                      )}
                      <span className="font-medium">{paymentAppDetail?.name || appUsageItem.app}</span>
                    </div>
                    <div className="text-2xl font-bold">₹{appUsageItem.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{appUsageItem.count} transaction{appUsageItem.count === 1 ? '' : 's'}</div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-muted-foreground text-center py-10">No payment app data for selected filters.</p>}
        </CardContent>
      </Card>

      {showExportDialog && currentReportExportData && (
        <AnalyticsExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          analyticsData={currentReportExportData}
          customChartConfigs={reportChartConfigs}
          customDataSetOptions={reportDataSetOptions}
        />
      )}
    </div>
  );
};

export default Reports;