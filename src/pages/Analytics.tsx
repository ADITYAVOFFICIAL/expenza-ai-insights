import { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BankChart from '@/components/charts/BankChart';
import SavingsCategoryChart from '@/components/charts/SavingsCategoryChart';
import SavingsTrackingChart from '@/components/charts/SavingsTrackingChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, authService } from '@/lib/appwrite'; // Added authService
import { Expense, RecurringExpense } from '@/types/expense'; // Ensure RecurringExpense is in types
import { Allowance } from '@/lib/allowanceService';
import { Goal } from '@/types/goal';
import { toast } from '@/hooks/use-toast';
import FinancialTrendsChart from '@/components/charts/FinancialTrendsChart'; // Ensure this import is present
import { 
  format, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  subMonths, 
  isWithinInterval,
  startOfYear,
  endOfYear,
  isValid,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  differenceInDays,
  eachWeekOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfWeek, // Added for trend calculation
} from 'date-fns';
import AnalyticsExportDialog, { AnalyticsExportableData } from '@/components/AnalyticsExportDialog';
import { useIsMobile } from '@/hooks/use-mobile'; // Add this if not already present

interface MonthlyTrend {
  month: string;
  expenses: number;
  income: number;
  savings: number;
}

interface CategorySpending {
  category: string;
  amount: number;
  budget?: number;
  percentage?: number;
  color?: string; // Added for consistency if needed by charts
}

interface DailySpending {
  day: string; // Format: 'dd' for chart display
  fullDate: string; // Format: 'yyyy-MM-dd' for sorting/reference
  amount: number;
}

interface BankData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface SavingsDataPoint { // From SavingsTrackingChart
  period: string;
  saved: number;
  target: number;
  difference: number; // Make it non-optional here as the chart expects it
}


const Analytics = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile(); // Existing
  const [loading, setLoading] = useState(true); // For main analytics data
  const [error, setError] = useState<string | null>(null); // For page data

  const [timeFilter, setTimeFilter] = useState('thisMonth'); // Existing
  const [customDate, setCustomDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [expenses, setExpenses] = useState<Expense[]>([]); // Existing
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]); // Existing
  const [allowances, setAllowances] = useState<Allowance[]>([]); // Existing
  const [goals, setGoals] = useState<Goal[]>([]); // Existing

  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]); // Ensure this state exists
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);
  const [expenseByBank, setExpenseByBank] = useState<BankData[]>([]);
  const [allowanceByBank, setAllowanceByBank] = useState<BankData[]>([]);
  const [savingsChartData, setSavingsChartData] = useState<{ weekly: SavingsDataPoint[], monthly: SavingsDataPoint[] }>({ weekly: [], monthly: [] });
  const [savingsCategoryData, setSavingsCategoryData] = useState<any[]>([]);

  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [avgDailySpend, setAvgDailySpend] = useState(0);

  const [showExportDialog, setShowExportDialog] = useState(false); // Existing
  const [analyticsExportData, setAnalyticsExportData] = useState<AnalyticsExportableData | null>(null); // Existing

  const generateRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`; // Existing

  const fetchData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true); // For main analytics data
    setError(null);
    try {
      const [expensesRes, recurringExpensesRes, allowancesRes, goalsRes, profileRes] = await Promise.all([
        databaseService.getExpenses(user.$id, 1000),
        databaseService.getRecurringExpenses(user.$id),
        databaseService.getAllowances(user.$id),
        databaseService.getGoals(user.$id),
        authService.getUserProfile(user.$id) // Fetch user profile
      ]);
      setExpenses((expensesRes.documents as unknown as Expense[]) || []);
      setRecurringExpenses((recurringExpensesRes.documents as unknown as RecurringExpense[]) || []);
      setAllowances((allowancesRes.documents as unknown as Allowance[]) || []);
      setGoals((goalsRes.documents as unknown as Goal[]) || []);
    

    } catch (err: any) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Please try again.");
      toast({ title: "Error", description: "Could not load analytics data.", variant: "destructive" });
    }
    // setLoading(false) will be handled by the processing useEffect
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dateInterval = useMemo(() => {
    const now = new Date();
    let start: Date, end: Date;
    let label = "This Month";
    switch (timeFilter) {
      case 'lastMonth':
        start = startOfMonth(subMonths(now, 1));
        end = endOfMonth(subMonths(now, 1));
        label = "Last Month";
        break;
      case 'last3Months':
        start = startOfMonth(subMonths(now, 2));
        end = endOfMonth(now); // Includes current month
        label = "Last 3 Months";
        break;
      case 'thisYear':
        start = startOfYear(now);
        end = endOfYear(now);
        label = "This Year";
        break;
      case 'custom':
        const customSelectedDate = new Date(customDate.year, customDate.month);
        start = startOfMonth(customSelectedDate);
        end = endOfMonth(customSelectedDate);
        label = format(customSelectedDate, 'MMMM yyyy');
        break;
      case 'thisMonth':
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
        label = "This Month";
    }
    return { start, end, label };
  }, [timeFilter, customDate]);

  // Define processedRecurringInstances first
  const processedRecurringInstances = useMemo(() => {
    const instances: Expense[] = [];
    const { start: intervalStart, end: intervalEnd } = dateInterval;

    recurringExpenses.forEach(re => {
      if (!re.isActive || !re.nextDueDate) return;

      let currentPaymentDate = parseISO(re.nextDueDate);
      if (!isValid(currentPaymentDate)) return;
      
      // Advance currentPaymentDate to the first occurrence within or after intervalStart
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
          paymentApp: re.paymentMethod, // Map from RecurringExpense.paymentMethod
          notes: re.notes || `Recurring schedule: ${re.frequency}`,
          isRecurringInstance: true,
          currency: 'INR', // Assuming INR or get from re.currency if available
          $createdAt: currentPaymentDate.toISOString(),
          $updatedAt: currentPaymentDate.toISOString(),
        } as Expense);

        let advanced = false;
        if (re.frequency === 'daily') { currentPaymentDate = addDays(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'weekly') { currentPaymentDate = addWeeks(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'monthly') { currentPaymentDate = addMonths(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'yearly') { currentPaymentDate = addYears(currentPaymentDate, 1); advanced = true; }
        
        if (!advanced || !isValid(currentPaymentDate)) break;
      }
    });
    return instances;
  }, [recurringExpenses, dateInterval]);

  // Now define combinedExpensesForFilterPeriod, which depends on processedRecurringInstances
  const combinedExpensesForFilterPeriod = useMemo(() => {
    const { start: intervalStart, end: intervalEnd } = dateInterval;
    const filteredRegularExpenses = expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      return isValid(expDate) && isWithinInterval(expDate, { start: intervalStart, end: intervalEnd });
    });
    return [...filteredRegularExpenses, ...processedRecurringInstances].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [expenses, processedRecurringInstances, dateInterval]);

  const filteredAllowancesForPeriod = useMemo(() => {
    const { start: startDate, end: endDate } = dateInterval;
    return allowances.filter(allow => {
      const allowDateStr = allow.nextReceived || allow.$createdAt; // Use nextReceived first, fallback to createdAt
      if (!allowDateStr) return false;
      const allowDate = parseISO(allowDateStr);
      return isValid(allowDate) && isWithinInterval(allowDate, { start: startDate, end: endDate });
    });
  }, [allowances, dateInterval]);


  useEffect(() => {
    if (!user?.$id) {
      setLoading(false);
      return;
    }
    // If initial data hasn't arrived yet, and we are in loading state, wait.
    if (loading && combinedExpensesForFilterPeriod.length === 0 && allowances.length === 0 && goals.length === 0 && expenses.length === 0 && recurringExpenses.length === 0) {
        // This condition means fetchData might not have completed or returned no data.
        // setLoading(false) will be called at the end of this effect.
    }
    
    const { start: startDate, end: endDate, label: timeFilterLabel } = dateInterval;

    // Use combinedExpensesForFilterPeriod directly as it's already filtered for the period
    const currentFilteredExpenses = combinedExpensesForFilterPeriod;
    
    const currentFilteredAllowances = filteredAllowancesForPeriod;

    // Monthly Trends (Expenses, Income, Savings)
    const trends: { [key: string]: { expenses: number, income: number } } = {};
    const monthYearFormat = 'MMM yyyy';
    
    // Determine aggregation period for trends (daily, weekly, monthly)
    const daysInInterval = differenceInDays(endDate, startDate);
    let trendPeriods: Date[];
    let trendDateFormat: string;

    if (daysInInterval <= 31) { // Daily for up to a month
        trendPeriods = eachDayOfInterval({ start: startDate, end: endDate });
        trendDateFormat = 'MMM dd';
    } else if (daysInInterval <= 93) { // Weekly for up to ~3 months
        trendPeriods = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
        trendDateFormat = 'MMM dd'; // Week starting
    } else { // Monthly for longer
        trendPeriods = eachMonthOfInterval({ start: startDate, end: endDate });
        trendDateFormat = monthYearFormat;
    }
    
    trendPeriods.forEach(periodStart => {
        const periodLabel = format(periodStart, trendDateFormat);
        trends[periodLabel] = { expenses: 0, income: 0 };
    });
    
    currentFilteredExpenses.forEach(exp => {
      const expDate = parseISO(exp.date);
      if(!isValid(expDate)) return;
      let periodLabelToUpdate: string | null = null;
      for (const periodStart of trendPeriods.slice().reverse()) { // Iterate backwards to find the correct period
          let periodEndCheck: Date;
          if (daysInInterval <= 31) periodEndCheck = endOfDay(periodStart);
          else if (daysInInterval <= 93) periodEndCheck = endOfWeek(periodStart, { weekStartsOn: 1 });
          else periodEndCheck = endOfMonth(periodStart);
          if (isWithinInterval(expDate, { start: periodStart, end: periodEndCheck })) {
              periodLabelToUpdate = format(periodStart, trendDateFormat);
              break;
          }
      }
      if (periodLabelToUpdate && trends[periodLabelToUpdate]) {
        trends[periodLabelToUpdate].expenses += exp.amount;
      }
    });

    currentFilteredAllowances.forEach(allow => {
      const allowDateStr = allow.nextReceived || allow.$createdAt;
      if (!allowDateStr) return;
      const allowDate = parseISO(allowDateStr);
      if(!isValid(allowDate)) return;

      let periodLabelToUpdate: string | null = null;
      for (const periodStart of trendPeriods.slice().reverse()) {
          let periodEndCheck: Date;
          if (daysInInterval <= 31) periodEndCheck = endOfDay(periodStart);
          else if (daysInInterval <= 93) periodEndCheck = endOfWeek(periodStart, { weekStartsOn: 1 });
          else periodEndCheck = endOfMonth(periodStart);
          if (isWithinInterval(allowDate, { start: periodStart, end: periodEndCheck })) {
              periodLabelToUpdate = format(periodStart, trendDateFormat);
              break;
          }
      }
      if (periodLabelToUpdate && trends[periodLabelToUpdate]) {
        trends[periodLabelToUpdate].income += allow.amount;
      }
    });

    const newMonthlyTrends = trendPeriods.map(periodStart => {
        const periodLabel = format(periodStart, trendDateFormat);
        const data = trends[periodLabel] || { expenses: 0, income: 0 };
        return {
            month: periodLabel, // 'month' key is used by chart, but value can be day/week/month label
            expenses: data.expenses,
            income: data.income,
            savings: data.income - data.expenses
        };
    });
    setMonthlyTrends(newMonthlyTrends);

    // Category Spending
    const catSpending: { [key: string]: number } = {};
    currentFilteredExpenses.forEach(exp => {
      catSpending[exp.category] = (catSpending[exp.category] || 0) + exp.amount;
    });
    const totalCatSpending = Object.values(catSpending).reduce((s, v) => s + v, 0);
    const newCategorySpending = Object.entries(catSpending).map(([category, amount]) => ({ 
        category, 
        amount, 
        percentage: totalCatSpending > 0 ? parseFloat(((amount / totalCatSpending) * 100).toFixed(1)) : 0,
        color: generateRandomColor() // Assign color for charts if needed
    })).sort((a,b) => b.amount - a.amount);
    setCategorySpending(newCategorySpending);
    
    // Daily Spending (for the selected interval, not just one month)
    const dailyData: { [key: string]: number } = {};
    const daysInSelectedInterval = eachDayOfInterval({ start: startDate, end: endDate });
    daysInSelectedInterval.forEach(day => {
      dailyData[format(day, 'yyyy-MM-dd')] = 0;
    });
    currentFilteredExpenses.forEach(exp => {
      const dayKey = format(parseISO(exp.date), 'yyyy-MM-dd');
      if (dailyData.hasOwnProperty(dayKey)) {
        dailyData[dayKey] += exp.amount;
      }
    });
    const newDailySpending = Object.entries(dailyData)
      .map(([fullDate, amount]) => ({ day: format(parseISO(fullDate), 'dd'), fullDate, amount }))
      .sort((a,b) => parseISO(a.fullDate).getTime() - parseISO(b.fullDate).getTime());
    setDailySpending(newDailySpending);
    
    // Expense by Bank
    const expBank: { [key: string]: number } = {};
    currentFilteredExpenses.forEach(exp => {
      if (exp.bank) { expBank[exp.bank] = (expBank[exp.bank] || 0) + exp.amount; }
    });
    const currentTotalBankExpense = Object.values(expBank).reduce((sum, val) => sum + val, 0);
    const newExpenseByBank = Object.entries(expBank).map(([name, value]) => ({
      name, value, color: generateRandomColor(),
      percentage: currentTotalBankExpense > 0 ? parseFloat(((value / currentTotalBankExpense) * 100).toFixed(1)) : 0
    })).sort((a,b) => b.value - a.value);
    setExpenseByBank(newExpenseByBank);
    setTotalSpent(currentTotalBankExpense); // This is total expenses from banks, might need overall total

    // Allowance by Bank
    const allowBank: { [key: string]: number } = {};
    currentFilteredAllowances.forEach(allow => {
      if (allow.bankName) { allowBank[allow.bankName] = (allowBank[allow.bankName] || 0) + allow.amount; }
    });
    const currentTotalBankAllowance = Object.values(allowBank).reduce((sum, val) => sum + val, 0);
    const newAllowanceByBank = Object.entries(allowBank).map(([name, value]) => ({
      name, value, color: generateRandomColor(),
      percentage: currentTotalBankAllowance > 0 ? parseFloat(((value / currentTotalBankAllowance) * 100).toFixed(1)) : 0
    })).sort((a,b) => b.value - a.value);
    setAllowanceByBank(newAllowanceByBank);
    setTotalIncome(currentTotalBankAllowance); // This is total income from allowances

    // Update overall summary stats
    const overallTotalSpent = currentFilteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    setTotalSpent(overallTotalSpent);
    const overallTotalIncome = currentFilteredAllowances.reduce((sum, allow) => sum + allow.amount, 0);
    setTotalIncome(overallTotalIncome);

    const currentNetSavings = overallTotalIncome - overallTotalSpent;
    setNetSavings(currentNetSavings);
    const numberOfDaysInPeriod = differenceInDays(endDate, startDate) + 1;
    setAvgDailySpend(numberOfDaysInPeriod > 0 ? overallTotalSpent / numberOfDaysInPeriod : 0);

    // Savings Chart Data (based on Goals) - This logic remains largely the same
    const monthlySavingsData: SavingsDataPoint[] = goals.map(goal => ({
        period: goal.name || `Goal ${goal.$id?.substring(0,5)}`, // Use optional chaining for $id
        saved: goal.currentAmount,
        target: goal.targetAmount,
        difference: goal.targetAmount - goal.currentAmount, // Calculate the difference
    }));
    // TODO: Implement weekly savings data if needed, for now, it's empty or also calculate difference
    setSavingsChartData({ weekly: [], monthly: monthlySavingsData });

    // Savings Category Chart Data (Spending by category, for chart that shows categories)
    const catMonthlySpendingForChart: { [month: string]: { [category: string]: number } } = {};
    currentFilteredExpenses.forEach(exp => {
        // Use a consistent period label, e.g., 'MMM' if grouping by month for this specific chart
        const monthLabel = format(parseISO(exp.date), 'MMM'); 
        catMonthlySpendingForChart[monthLabel] = catMonthlySpendingForChart[monthLabel] || {};
        catMonthlySpendingForChart[monthLabel][exp.category] = (catMonthlySpendingForChart[monthLabel][exp.category] || 0) + exp.amount;
    });
    const allCategoriesForChart = [...new Set(currentFilteredExpenses.map(e => e.category))];
    const processedSavingsCategoryData = Object.entries(catMonthlySpendingForChart).map(([month, categories]) => {
        const monthData: any = { month }; // 'month' is the period label for the chart
        allCategoriesForChart.forEach(cat => {
            monthData[cat.toLowerCase().replace(/\s+/g, '')] = categories[cat] || 0;
        });
        return monthData;
    });
    setSavingsCategoryData(processedSavingsCategoryData);
    
    setAnalyticsExportData({
      summaryMetrics: [
        { label: 'Total Spent', value: `₹${overallTotalSpent.toLocaleString()}`, description: `For ${timeFilterLabel}` },
        { label: 'Total Income', value: `₹${overallTotalIncome.toLocaleString()}`, description: `For ${timeFilterLabel}` },
        { label: 'Net Savings', value: `₹${currentNetSavings.toLocaleString()}`, description: `For ${timeFilterLabel}` },
        { label: 'Avg Daily Spend', value: `₹${(numberOfDaysInPeriod > 0 ? overallTotalSpent / numberOfDaysInPeriod : 0).toLocaleString(undefined, {maximumFractionDigits: 0})}`, description: `For ${timeFilterLabel}` }
      ],
      monthlyTrends: newMonthlyTrends,
      categorySpending: newCategorySpending,
      dailySpending: newDailySpending,
      expenseByBank: newExpenseByBank,
      allowanceByBank: newAllowanceByBank,
      allExpenses: currentFilteredExpenses,
      timeFilterLabel: timeFilterLabel,
    });

    setLoading(false); // Main analytics data loaded

  }, [combinedExpensesForFilterPeriod, filteredAllowancesForPeriod, dateInterval, user, expenses, recurringExpenses, allowances, goals, loading]); // Dependencies for recalculating analytics

  const earliestYear = useMemo(() => {
    if (loading && expenses.length === 0 && allowances.length === 0) {
      return new Date().getFullYear() - 5;
    }
    const allDates = [
      ...expenses.map(e => e.date),
      ...allowances.map(a => a.nextReceived || a.$createdAt)
    ].map(d => d ? parseISO(d) : null).filter((d): d is Date => d !== null && isValid(d));

    if (allDates.length === 0) {
      return new Date().getFullYear() - 5;
    }

    const earliest = Math.min(...allDates.map(d => d.getFullYear()));
    return isFinite(earliest) ? earliest : new Date().getFullYear() - 5;
  }, [expenses, allowances, loading]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear; y >= earliestYear; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear, earliestYear]);

  const monthOptions = useMemo(() => {
    const isCurrentYearSelected = customDate.year === currentYear;
    const monthsToShow = isCurrentYearSelected ? currentMonth + 1 : 12;

    return Array.from({ length: monthsToShow }, (_, i) => ({
      value: i.toString(),
      label: format(new Date(2000, i, 1), 'MMMM')
    }));
  }, [customDate.year, currentYear, currentMonth]);
  
  // Effect to adjust the month if the year changes and the selected month becomes invalid (i.e., a future month)
  useEffect(() => {
    const isCurrentYearSelected = customDate.year === currentYear;
    if (isCurrentYearSelected && customDate.month > currentMonth) {
      setCustomDate(prev => ({ ...prev, month: currentMonth }));
    }
  }, [customDate.year, currentYear, currentMonth, customDate.month]);

  if (loading && monthlyTrends.length === 0) { // Adjusted loading condition
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Comprehensive insights into your financial health</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40 dark:text-foreground">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
              <SelectItem value="custom">Select Month...</SelectItem>
            </SelectContent>
          </Select>

          {timeFilter === 'custom' && (
            <>
              <Select
                value={customDate.year.toString()}
                onValueChange={(val) => setCustomDate(prev => ({ ...prev, year: parseInt(val) }))}
              >
                <SelectTrigger className="w-[7rem] dark:text-foreground">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={customDate.month.toString()}
                onValueChange={(val) => setCustomDate(prev => ({ ...prev, month: parseInt(val) }))}
              >
                <SelectTrigger className="w-[9rem] dark:text-foreground">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowExportDialog(true)} 
            disabled={!analyticsExportData || loading}
            className="dark:text-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, description: `For selected period` },
          { label: 'Total Income', value: `₹${totalIncome.toLocaleString()}`, description: `For selected period` },
          { label: 'Net Savings', value: `₹${netSavings.toLocaleString()}`, description: `For selected period` },
          { label: 'Avg Daily Spend', value: `₹${avgDailySpend.toLocaleString(undefined, {maximumFractionDigits: 0})}`, description: `For selected period` }
        ].map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4 lg:p-6">
              <div className="text-xs lg:text-sm text-muted-foreground mb-1">{metric.label}</div>
              <div className="text-lg lg:text-2xl font-bold mb-1">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.description}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Expenses by Bank Chart */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Expenses by Bank</CardTitle></CardHeader>
          <CardContent id="analyticsChartExpensesByBank"> {/* ID for export */}
            {expenseByBank.length > 0 ? <BankChart data={expenseByBank} title="" /> : <p className="text-muted-foreground text-center py-8">No bank expense data.</p>}
            {expenseByBank.length > 0 && (
              <div className={`mt-4 grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-x-4 gap-y-2`}>
                {expenseByBank.map((bank) => (
                  <div key={bank.name} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: bank.color }}></div>
                      <span className="truncate flex-grow">{bank.name}</span>
                    </div>
                    <span className="font-medium shrink-0 ml-2">{bank.percentage?.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Allowance by Bank Chart */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Allowance by Bank</CardTitle></CardHeader>
          <CardContent id="analyticsChartAllowanceByBank"> {/* ID for export */}
            {allowanceByBank.length > 0 ? <BankChart data={allowanceByBank} title="" /> : <p className="text-muted-foreground text-center py-8">No bank allowance data.</p>}
             {allowanceByBank.length > 0 && (
                <div className={`mt-4 grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-x-4 gap-y-2`}>
                {allowanceByBank.map((bank) => (
                    <div key={bank.name} className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: bank.color }}></div>
                        <span className="truncate flex-grow">{bank.name}</span>
                    </div>
                    <span className="font-medium shrink-0 ml-2">{bank.percentage?.toFixed(1)}%</span>
                    </div>
                ))}
                </div>
            )}
          </CardContent>
        </Card>
        
        <div className="xl:col-span-2" id="analyticsChartFinancialTrendsWrapper">
            <FinancialTrendsChart data={monthlyTrends} />
        </div>

        <Card className="xl:col-span-2">
          <CardContent className="p-0" id="analyticsChartSavingsTrackingWrapper"> 
            <SavingsTrackingChart weeklyData={savingsChartData.weekly} monthlyData={savingsChartData.monthly} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader><CardTitle className="text-lg">Spending by Category Over Time</CardTitle></CardHeader>
          <CardContent className="p-4" id="analyticsChartSpendingByCategoryWrapper"> 
            {savingsCategoryData.length > 0 && categorySpending.length > 0 ? (
                <SavingsCategoryChart data={savingsCategoryData} categories={categorySpending.map(c => c.category.toLowerCase().replace(/\s+/g, ''))} />
            ) : <p className="text-muted-foreground text-center py-8">No category spending data for trend chart.</p>}
          </CardContent>
        </Card>
      </div>

      <AnalyticsExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        analyticsData={analyticsExportData}
      />
    </div>
  );
};

export default Analytics;