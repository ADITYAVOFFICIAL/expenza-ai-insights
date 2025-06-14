import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Download, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BankChart from '@/components/charts/BankChart';
import SavingsCategoryChart from '@/components/charts/SavingsCategoryChart';
import SavingsTrackingChart from '@/components/charts/SavingsTrackingChart';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/appwrite';
import { Expense, RecurringExpense } from '@/types/expense';
import { Goal } from '@/types/goal';
import { toast } from '@/hooks/use-toast';
import FinancialTrendsChart from '@/components/charts/FinancialTrendsChart';
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
  endOfWeek,
} from 'date-fns';
import AnalyticsExportDialog, { AnalyticsExportableData } from '@/components/AnalyticsExportDialog';
import { useIsMobile } from '@/hooks/use-mobile';

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
  color?: string;
}

interface DailySpending {
  day: string;
  fullDate: string;
  amount: number;
}

interface BankData {
  name: string;
  value: number;
  color: string;
  percentage?: number;
}

interface SavingsDataPoint {
  period: string;
  saved: number;
  target: number;
  difference: number;
}

const Analytics = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [timeFilter, setTimeFilter] = useState('thisMonth');
  const [customDate, setCustomDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);
  const [expenseByBank, setExpenseByBank] = useState<BankData[]>([]);
  const [incomeBySource, setIncomeBySource] = useState<BankData[]>([]);
  const [savingsChartData, setSavingsChartData] = useState<{ weekly: SavingsDataPoint[], monthly: SavingsDataPoint[] }>({ weekly: [], monthly: [] });
  const [savingsCategoryData, setSavingsCategoryData] = useState<any[]>([]);

  const [totalSpent, setTotalSpent] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [avgDailySpend, setAvgDailySpend] = useState(0);

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [analyticsExportData, setAnalyticsExportData] = useState<AnalyticsExportableData | null>(null);

  const generateRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

  const fetchData = useCallback(async () => {
    if (!user?.$id) return;
    setLoading(true);
    setError(null);
    try {
      const [expensesRes, recurringExpensesRes, goalsRes] = await Promise.all([
        databaseService.getExpenses(user.$id, 1000),
        databaseService.getRecurringExpenses(user.$id),
        databaseService.getGoals(user.$id),
      ]);
      setExpenses((expensesRes.documents as unknown as Expense[]) || []);
      setRecurringExpenses((recurringExpensesRes.documents as unknown as RecurringExpense[]) || []);
      setGoals((goalsRes.documents as unknown as Goal[]) || []);
    } catch (err: any) {
      console.error("Error fetching analytics data:", err);
      setError("Failed to load analytics data. Please try again.");
      toast({ title: "Error", description: "Could not load analytics data.", variant: "destructive" });
    }
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
        end = endOfDay(endOfMonth(subMonths(now, 1)));
        label = "Last Month";
        break;
      case 'last3Months':
        start = startOfMonth(subMonths(now, 2));
        end = endOfDay(endOfMonth(now));
        label = "Last 3 Months";
        break;
      case 'thisYear':
        start = startOfYear(now);
        end = endOfDay(endOfYear(now));
        label = "This Year";
        break;
      case 'custom':
        const customSelectedDate = new Date(customDate.year, customDate.month);
        start = startOfMonth(customSelectedDate);
        end = endOfDay(endOfMonth(customSelectedDate));
        label = format(customSelectedDate, 'MMMM yyyy');
        break;
      case 'thisMonth':
      default:
        start = startOfMonth(now);
        end = endOfDay(endOfMonth(now));
        label = "This Month";
    }
    return { start, end, label };
  }, [timeFilter, customDate]);

  const processedRecurringInstances = useMemo(() => {
    const instances: Expense[] = [];
    const { start: intervalStart, end: intervalEnd } = dateInterval;

    recurringExpenses.forEach(re => {
      if (!re.isActive || !re.nextDueDate) return;
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
        if (!advanced || !isValid(currentPaymentDate)) break;
      }
    });
    return instances;
  }, [recurringExpenses, dateInterval]);

  const combinedExpensesForFilterPeriod = useMemo(() => {
    const { start: intervalStart, end: intervalEnd } = dateInterval;
    const filteredRegularExpenses = expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      return isValid(expDate) && isWithinInterval(expDate, { start: intervalStart, end: intervalEnd });
    });
    return [...filteredRegularExpenses, ...processedRecurringInstances].sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
  }, [expenses, processedRecurringInstances, dateInterval]);

  useEffect(() => {
    if (!user?.$id) {
      setLoading(false);
      return;
    }
    if (loading && combinedExpensesForFilterPeriod.length === 0 && goals.length === 0 && expenses.length === 0 && recurringExpenses.length === 0) {
        return;
    }
    
    const { start: startDate, end: endDate, label: timeFilterLabel } = dateInterval;
    const currentFilteredExpenses = combinedExpensesForFilterPeriod;
    const positiveExpenses = currentFilteredExpenses.filter(e => e.amount >= 0);
    const incomeTransactions = currentFilteredExpenses.filter(e => e.amount < 0);

    // Monthly Trends
    const trends: { [key: string]: { expenses: number, income: number } } = {};
    const daysInInterval = differenceInDays(endDate, startDate);
    let trendPeriods: Date[];
    let trendDateFormat: string;

    if (daysInInterval <= 31) {
        trendPeriods = eachDayOfInterval({ start: startDate, end: endDate });
        trendDateFormat = 'MMM dd';
    } else if (daysInInterval <= 93) {
        trendPeriods = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
        trendDateFormat = 'MMM dd';
    } else {
        trendPeriods = eachMonthOfInterval({ start: startDate, end: endDate });
        trendDateFormat = 'MMM yyyy';
    }
    
    trendPeriods.forEach(periodStart => {
        const periodLabel = format(periodStart, trendDateFormat);
        trends[periodLabel] = { expenses: 0, income: 0 };
    });
    
    currentFilteredExpenses.forEach(exp => {
      const expDate = parseISO(exp.date);
      if(!isValid(expDate)) return;
      let periodLabelToUpdate: string | null = null;
      for (const periodStart of trendPeriods.slice().reverse()) {
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
        if (exp.amount >= 0) {
          trends[periodLabelToUpdate].expenses += exp.amount;
        } else {
          trends[periodLabelToUpdate].income += Math.abs(exp.amount);
        }
      }
    });

    const newMonthlyTrends = trendPeriods.map(periodStart => {
        const periodLabel = format(periodStart, trendDateFormat);
        const data = trends[periodLabel] || { expenses: 0, income: 0 };
        return {
            month: periodLabel,
            expenses: data.expenses,
            income: data.income,
            savings: data.income - data.expenses
        };
    });
    setMonthlyTrends(newMonthlyTrends);

    // Category Spending
    const catSpending: { [key: string]: number } = {};
    positiveExpenses.forEach(exp => {
      catSpending[exp.category] = (catSpending[exp.category] || 0) + exp.amount;
    });
    const totalCatSpending = Object.values(catSpending).reduce((s, v) => s + v, 0);
    const newCategorySpending = Object.entries(catSpending).map(([category, amount]) => ({ 
        category, 
        amount, 
        percentage: totalCatSpending > 0 ? parseFloat(((amount / totalCatSpending) * 100).toFixed(1)) : 0,
        color: generateRandomColor()
    })).sort((a,b) => b.amount - a.amount);
    setCategorySpending(newCategorySpending);
    
    // Daily Spending
    const dailyData: { [key: string]: number } = {};
    const daysInSelectedInterval = eachDayOfInterval({ start: startDate, end: endDate });
    daysInSelectedInterval.forEach(day => {
      dailyData[format(day, 'yyyy-MM-dd')] = 0;
    });
    positiveExpenses.forEach(exp => {
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
    positiveExpenses.forEach(exp => {
      if (exp.bank) { expBank[exp.bank] = (expBank[exp.bank] || 0) + exp.amount; }
    });
    const currentTotalBankExpense = Object.values(expBank).reduce((sum, val) => sum + val, 0);
    const newExpenseByBank = Object.entries(expBank).map(([name, value]) => ({
      name, value, color: generateRandomColor(),
      percentage: currentTotalBankExpense > 0 ? parseFloat(((value / currentTotalBankExpense) * 100).toFixed(1)) : 0
    })).sort((a,b) => b.value - a.value);
    setExpenseByBank(newExpenseByBank);

    // Income by Source
    const incomeSourceMap: { [key: string]: number } = {};
    incomeTransactions.forEach(exp => {
      const source = exp.bank || 'Other Income';
      incomeSourceMap[source] = (incomeSourceMap[source] || 0) + Math.abs(exp.amount);
    });
    const totalIncomeBySource = Object.values(incomeSourceMap).reduce((sum, val) => sum + val, 0);
    const newIncomeBySourceData = Object.entries(incomeSourceMap).map(([name, value]) => ({
      name, value, color: generateRandomColor(),
      percentage: totalIncomeBySource > 0 ? parseFloat(((value / totalIncomeBySource) * 100).toFixed(1)) : 0
    })).sort((a,b) => b.value - a.value);
    setIncomeBySource(newIncomeBySourceData);

    // Update overall summary stats
    const overallTotalSpent = positiveExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const overallTotalIncome = incomeTransactions.reduce((sum, exp) => sum + Math.abs(exp.amount), 0);
    setTotalSpent(overallTotalSpent);
    setTotalIncome(overallTotalIncome);
    const currentNetSavings = overallTotalIncome - overallTotalSpent;
    setNetSavings(currentNetSavings);
    const numberOfDaysInPeriod = differenceInDays(endDate, startDate) + 1;
    setAvgDailySpend(numberOfDaysInPeriod > 0 ? overallTotalSpent / numberOfDaysInPeriod : 0);

    // Savings Chart Data (based on Goals)
    const monthlySavingsData: SavingsDataPoint[] = goals.map(goal => ({
        period: goal.name || `Goal ${goal.$id?.substring(0,5)}`,
        saved: goal.currentAmount,
        target: goal.targetAmount,
        difference: goal.targetAmount - goal.currentAmount,
    }));
    setSavingsChartData({ weekly: [], monthly: monthlySavingsData });

    // Spending by Category Over Time Chart Data
    const catMonthlySpendingForChart: { [month: string]: { [category: string]: number } } = {};
    positiveExpenses.forEach(exp => {
        const monthLabel = format(parseISO(exp.date), 'MMM'); 
        catMonthlySpendingForChart[monthLabel] = catMonthlySpendingForChart[monthLabel] || {};
        catMonthlySpendingForChart[monthLabel][exp.category] = (catMonthlySpendingForChart[monthLabel][exp.category] || 0) + exp.amount;
    });
    const allCategoriesForChart = [...new Set(positiveExpenses.map(e => e.category))];
    const processedSavingsCategoryData = Object.entries(catMonthlySpendingForChart).map(([month, categories]) => {
        const monthData: any = { month };
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
      allowanceByBank: newIncomeBySourceData,
      allExpenses: currentFilteredExpenses,
      timeFilterLabel: timeFilterLabel,
    });

    setLoading(false);

  }, [combinedExpensesForFilterPeriod, dateInterval, user, expenses, recurringExpenses, goals, loading]);

  const earliestYear = useMemo(() => {
    if (loading && expenses.length === 0) {
      return new Date().getFullYear() - 5;
    }
    const allDates = expenses.map(e => e.date ? parseISO(e.date) : null).filter((d): d is Date => d !== null && isValid(d));
    if (allDates.length === 0) return new Date().getFullYear() - 5;
    const earliest = Math.min(...allDates.map(d => d.getFullYear()));
    return isFinite(earliest) ? earliest : new Date().getFullYear() - 5;
  }, [expenses, loading]);

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
  
  useEffect(() => {
    const isCurrentYearSelected = customDate.year === currentYear;
    if (isCurrentYearSelected && customDate.month > currentMonth) {
      setCustomDate(prev => ({ ...prev, month: currentMonth }));
    }
  }, [customDate.year, currentYear, currentMonth, customDate.month]);

  if (loading && monthlyTrends.length === 0) {
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Expenses by Bank</CardTitle></CardHeader>
          <CardContent id="analyticsChartExpensesByBank">
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

        <Card>
          <CardHeader><CardTitle className="text-lg">Income by Source</CardTitle></CardHeader>
          <CardContent id="analyticsChartAllowanceByBank">
            {incomeBySource.length > 0 ? <BankChart data={incomeBySource} title="" /> : <p className="text-muted-foreground text-center py-8">No income data.</p>}
             {incomeBySource.length > 0 && (
                <div className={`mt-4 grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-x-4 gap-y-2`}>
                {incomeBySource.map((bank) => (
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