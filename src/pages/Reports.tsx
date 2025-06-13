import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign, AlertTriangle, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/lib/appwrite';
import { Expense, RecurringExpense } from '@/types/expense'; // Ensure RecurringExpense is defined in your types
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
import paymentAppsData from '@/data/paymentApps.json'; // Import payment apps data
import banksData from '@/data/banks.json'; // Import bank data

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280', '#ec4899', '#6366f1'];

interface BankSuggestion {
  name: string;
  icon?: string;
  label: string; // For display, e.g., "All Banks"
}

// Ensure your Expense type can accommodate isRecurringInstance
// Example:
// interface Expense {
//   // ... other fields
//   isRecurringInstance?: boolean;
//   paymentApp?: string; // Make sure this exists if mapping from recurring.paymentMethod
// }

const Reports = () => {
  const { user } = useAuth();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [allRecurringExpenses, setAllRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState('thisMonth');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');

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
        databaseService.getExpenses(user.$id, 2000), // Fetch a good number of regular expenses
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
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'lastMonth':
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        return { start: lastMonthStart, end: endOfMonth(lastMonthStart) };
      case 'last3Months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      case 'thisYear':
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [dateRange]);

  const processedRecurringInstances = useMemo(() => {
    const instances: Expense[] = [];
    allRecurringExpenses.forEach(re => {
      if (!re.isActive || !re.nextDueDate) return;

      let currentPaymentDate = parseISO(re.nextDueDate);
      if (!isValid(currentPaymentDate)) return;

      const intervalEnd = dateInterval.end;
      const intervalStart = dateInterval.start;

      // Advance currentPaymentDate to the first occurrence within or after intervalStart
      // This ensures we capture recurring payments whose nextDueDate might be in the past
      // but whose cycle falls into the current interval.
      while (currentPaymentDate < intervalStart) {
        let advanced = false;
        if (re.frequency === 'daily') { currentPaymentDate = addDays(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'weekly') { currentPaymentDate = addWeeks(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'monthly') { currentPaymentDate = addMonths(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'yearly') { currentPaymentDate = addYears(currentPaymentDate, 1); advanced = true; }
        
        if (!advanced || !isValid(currentPaymentDate)) return; // Break if unknown frequency or invalid date
      }

      while (isValid(currentPaymentDate) && currentPaymentDate <= intervalEnd) {
        // Only add if it's also on or after intervalStart (already handled by the loop above for the first one)
        instances.push({
          $id: `rec-${re.$id}-${format(currentPaymentDate, 'yyyyMMdd')}`,
          userId: re.userId,
          name: re.name, // Using re.name directly, add suffix if preferred: `${re.name} (Recurring)`
          amount: re.amount,
          category: re.category,
          date: format(currentPaymentDate, 'yyyy-MM-dd'),
          bank: re.bank,
          paymentApp: re.paymentMethod, // Map from RecurringExpense.paymentMethod
          notes: re.notes || `Recurring schedule: ${re.frequency}`,
          isRecurringInstance: true,
          currency: 'INR', // Assuming INR, make dynamic if needed
          $createdAt: currentPaymentDate.toISOString(),
          $updatedAt: currentPaymentDate.toISOString(),
        } as Expense); // Cast, ensure Expense type compatibility

        let advanced = false;
        if (re.frequency === 'daily') { currentPaymentDate = addDays(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'weekly') { currentPaymentDate = addWeeks(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'monthly') { currentPaymentDate = addMonths(currentPaymentDate, 1); advanced = true; }
        else if (re.frequency === 'yearly') { currentPaymentDate = addYears(currentPaymentDate, 1); advanced = true; }

        if (!advanced) break; // Break if unknown frequency or date becomes invalid
      }
    });
    return instances;
  }, [allRecurringExpenses, dateInterval]);

  const combinedExpenses = useMemo(() => {
    return [...allExpenses, ...processedRecurringInstances];
  }, [allExpenses, processedRecurringInstances]);
  
  const filteredExpenses = useMemo(() => {
    return combinedExpenses.filter(expense => {
      if (!expense.date) return false;
      const expenseDate = parseISO(expense.date);
      if (!isValid(expenseDate)) return false;

      const inDateRange = isWithinInterval(expenseDate, dateInterval);
      const categoryMatch = categoryFilter === 'all' || expense.category === categoryFilter;
      const bankMatch = bankFilter === 'all' || expense.bank === bankFilter;
      
      return inDateRange && categoryMatch && bankMatch;
    });
  }, [combinedExpenses, dateInterval, categoryFilter, bankFilter]);

  const expensesByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
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

    if (daysInInterval <= 0) return []; // Avoid issues with single day or invalid interval

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

    filteredExpenses.forEach(expense => {
        const expenseDate = parseISO(expense.date);
        if (!isValid(expenseDate)) return;

        let periodLabelToUpdate: string | null = null;

        for (const pObj of periodObjects.slice().reverse()) { // Check from latest period backwards
            let periodStartCheck = pObj.date;
            let periodEndCheck: Date;

            if (daysInInterval <= 31) periodEndCheck = endOfDay(periodStartCheck);
            else if (daysInInterval <= 93) periodEndCheck = endOfWeek(periodStartCheck, { weekStartsOn: 1 });
            else periodEndCheck = endOfMonth(periodStartCheck);
            
            if (isWithinInterval(expenseDate, { start: periodStartCheck, end: periodEndCheck })) {
                periodLabelToUpdate = pObj.label;
                break;
            }
        }
        if (periodLabelToUpdate && trendMap.hasOwnProperty(periodLabelToUpdate)) {
            trendMap[periodLabelToUpdate] += expense.amount;
        }
    });
    
    // Sort by actual date of the period for correct chronological order
    return periodObjects
        .map(pObj => ({ period: pObj.label, amount: trendMap[pObj.label] || 0, date: pObj.date}))
        .sort((a,b) => a.date.getTime() - b.date.getTime())
        .map(({period, amount}) => ({period, amount})); // Return to original structure

  }, [filteredExpenses, dateInterval]);

  const topExpensesList = useMemo(() => {
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
    filteredExpenses.forEach(expense => {
      const appName = expense.paymentApp || 'Other/Cash';
      if (!appMap[appName]) {
        appMap[appName] = { app: appName, amount: 0, count: 0 };
      }
      appMap[appName].amount += expense.amount;
      appMap[appName].count += 1;
    });
    return Object.values(appMap).sort((a,b) => b.amount - a.amount);
  }, [filteredExpenses]);
  
  const summaryStats = useMemo(() => {
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

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    allExpenses.forEach(e => { if (e.category) categories.add(e.category); });
    allRecurringExpenses.forEach(re => { if (re.category) categories.add(re.category); });
    return ['all', ...Array.from(categories).sort()];
  }, [allExpenses, allRecurringExpenses]);

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
        <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Reports</h2>
        <p className="text-muted-foreground mb-4 text-center">{error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Detailed financial reports and insights</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="last3Months">Last 3 Months</SelectItem>
                <SelectItem value="thisYear">This Year</SelectItem>
                <SelectItem value="allTime">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category === 'all' ? 'All Categories' : category}</SelectItem>
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
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
                <div className="text-xl font-bold">₹{summaryStats.totalExpenses.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Daily</div>
                <div className="text-xl font-bold">₹{summaryStats.avgDailyExpense.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Transactions</div>
                <div className="text-xl font-bold">{summaryStats.totalTransactions}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days Tracked</div>
                <div className="text-xl font-bold">{summaryStats.daysTracked}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="name"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + (radius + 15) * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + (radius + 15) * Math.sin(-midAngle * (Math.PI / 180));
                        return (percent * 100) > 3 ? (
                          <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12">
                            {`${expensesByCategory[index].name} (${(percent * 100).toFixed(0)}%)`}
                          </text>
                        ) : null;
                      }}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`₹${value.toLocaleString()}`, name]} 
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))', 
                        borderRadius: 'var(--radius)',
                        color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-muted-foreground text-center py-10">No data for selected filters.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={expenseTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} tick={{fontSize: 12}}/>
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
            ) : <p className="text-muted-foreground text-center py-10">No data for selected filters.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {topExpensesList.length > 0 ? (
              <div className="space-y-3">
                {topExpensesList.map((expense, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                    <div>
                      <div className="font-medium">{expense.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{expense.date}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {expense.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{expense.amount.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
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
                        <Banknote className="w-5 h-5 text-muted-foreground" /> 
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
    </div>
  );
};

export default Reports;
