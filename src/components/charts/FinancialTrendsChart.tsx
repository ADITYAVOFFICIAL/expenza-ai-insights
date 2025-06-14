import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus,
  PiggyBank,
  CreditCard,
  Wallet,
  BarChart3,
  Activity,
  Shield,
  Zap
} from 'lucide-react';

interface FinancialTrendData {
  month: string;
  expenses: number;
  income: number;
  savings: number;
}

interface FinancialTrendsChartProps {
  data: FinancialTrendData[];
}

interface FinancialInsight {
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: React.ReactNode;
  title: string;
  message: string;
  actionable?: string;
  priority?: 'high' | 'medium' | 'low';
}

const FinancialTrendsChart: React.FC<FinancialTrendsChartProps> = ({ data }) => {
  const [viewMode, setViewMode] = React.useState<'trends' | 'analysis' | 'comparison'>('trends');
  const [chartType, setChartType] = React.useState<'line' | 'area' | 'composed'>('line');
  const [seriesDisplay, setSeriesDisplay] = React.useState<'all' | 'income' | 'expenses' | 'savings'>('all'); // New state for series display

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalSavings = data.reduce((sum, item) => sum + item.savings, 0);
  const avgIncome = data.length > 0 ? totalIncome / data.length : 0;
  const avgExpenses = data.length > 0 ? totalExpenses / data.length : 0;
  const avgSavings = data.length > 0 ? totalSavings / data.length : 0;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  const generateFinancialInsights = (): FinancialInsight[] => {
    const insights: FinancialInsight[] = [];
    if (data.length === 0) {
      insights.push({
        type: 'info',
        icon: <BarChart3 className="w-4 h-4" />,
        title: 'No Financial Data',
        message: 'Start tracking your income and expenses to get comprehensive financial insights.',
        actionable: 'Add your first expense or income entry to begin building your financial profile.',
        priority: 'high'
      });
      return insights;
    }
    const cashFlowInsight = analyzeCashFlow();
    if (cashFlowInsight) insights.push(cashFlowInsight);
    const savingsInsight = analyzeSavingsPerformance();
    if (savingsInsight) insights.push(savingsInsight);
    const expenseInsight = analyzeExpenseTrends();
    if (expenseInsight) insights.push(expenseInsight);
    const incomeInsight = analyzeIncomeStability();
    if (incomeInsight) insights.push(incomeInsight);
    const healthInsight = calculateFinancialHealth();
    if (healthInsight) insights.push(healthInsight);
    const seasonalInsight = analyzeSeasonalPatterns();
    if (seasonalInsight) insights.push(seasonalInsight);
    const riskInsight = assessFinancialRisk();
    if (riskInsight) insights.push(riskInsight);
    const goalInsight = analyzeGoalPotential();
    if (goalInsight) insights.push(goalInsight);
    const budgetInsight = analyzeBudgetEfficiency();
    if (budgetInsight) insights.push(budgetInsight);
    const projectionInsight = generateProjections();
    if (projectionInsight) insights.push(projectionInsight);
    return insights.sort((a, b) => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority || 'low'] || 3) - (priorityOrder[b.priority || 'low'] || 3);
    }).slice(0, 6);
  };

  const analyzeCashFlow = (): FinancialInsight | null => {
    if (data.length === 0) return null;
    const positiveMonths = data.filter(item => item.savings > 0).length;
    const negativeMonths = data.filter(item => item.savings < 0).length;
    const positiveRate = (positiveMonths / data.length) * 100;
    if (positiveRate >= 90) return { type: 'success', icon: <CheckCircle className="w-4 h-4" />, title: 'Excellent Cash Flow', message: `${positiveMonths}/${data.length} months with positive cash flow.`, actionable: 'Outstanding financial discipline! Consider increasing investment allocation.', priority: 'low' };
    if (positiveRate >= 70) return { type: 'success', icon: <TrendingUp className="w-4 h-4" />, title: 'Strong Cash Flow', message: `${positiveRate.toFixed(1)}% of months show positive savings.`, actionable: 'Good progress! Focus on consistency in the remaining months.', priority: 'medium' };
    if (positiveRate >= 50) return { type: 'warning', icon: <Target className="w-4 h-4" />, title: 'Moderate Cash Flow', message: `${negativeMonths} months with negative cash flow need attention.`, actionable: 'Review expenses in deficit months and create contingency plans.', priority: 'medium' };
    return { type: 'danger', icon: <AlertTriangle className="w-4 h-4" />, title: 'Critical Cash Flow Issues', message: `${negativeMonths}/${data.length} months with negative savings.`, actionable: 'Urgent: Implement strict budgeting and consider additional income sources.', priority: 'high' };
  };

  const analyzeSavingsPerformance = (): FinancialInsight | null => {
    if (data.length === 0) return null;
    if (savingsRate >= 30) return { type: 'success', icon: <PiggyBank className="w-4 h-4" />, title: 'Exceptional Saver', message: `${savingsRate.toFixed(1)}% savings rate exceeds expert recommendations.`, actionable: 'Consider diversifying into investments for wealth building.', priority: 'low' };
    if (savingsRate >= 20) return { type: 'success', icon: <Target className="w-4 h-4" />, title: 'Strong Savings Rate', message: `${savingsRate.toFixed(1)}% savings rate meets the 20% rule.`, actionable: 'Excellent! Maintain this rate and explore investment options.', priority: 'low' };
    if (savingsRate >= 10) return { type: 'warning', icon: <ArrowUp className="w-4 h-4" />, title: 'Moderate Savings Rate', message: `${savingsRate.toFixed(1)}% savings rate is below optimal 20%.`, actionable: 'Aim to increase savings by ₹' + Math.round((totalIncome * 0.2 - totalSavings) / Math.max(data.length,1)).toLocaleString() + '/month.', priority: 'medium' };
    if (savingsRate > 0) return { type: 'danger', icon: <AlertTriangle className="w-4 h-4" />, title: 'Low Savings Rate', message: `${savingsRate.toFixed(1)}% savings rate requires immediate attention.`, actionable: 'Critical: Review all expenses and implement the 50/30/20 budgeting rule.', priority: 'high' };
    return { type: 'danger', icon: <CreditCard className="w-4 h-4" />, title: 'No Savings Accumulation', message: 'Negative or zero savings indicate financial vulnerability.', actionable: 'Emergency action needed: Create a bare-minimum budget and seek financial counseling.', priority: 'high' };
  };

  const analyzeExpenseTrends = (): FinancialInsight | null => {
    if (data.length < 3) return null;
    const recentExpenses = data.slice(-3).reduce((sum, item) => sum + item.expenses, 0) / 3;
    const earlierExpenses = data.slice(0, Math.max(0, data.length - 3)).reduce((sum, item) => sum + item.expenses, 0) / Math.max(1, data.length - 3);
    const trendPercentage = earlierExpenses > 0 ? ((recentExpenses - earlierExpenses) / earlierExpenses) * 100 : (recentExpenses > 0 ? 100 : 0);
    if (trendPercentage > 15) return { type: 'danger', icon: <TrendingUp className="w-4 h-4" />, title: 'Rising Expense Trend', message: `Expenses increased by ${trendPercentage.toFixed(1)}% recently.`, actionable: 'Identify expense categories driving the increase and implement controls.', priority: 'high' };
    if (trendPercentage > 5) return { type: 'warning', icon: <ArrowUp className="w-4 h-4" />, title: 'Moderate Expense Increase', message: `${trendPercentage.toFixed(1)}% increase in recent spending.`, actionable: 'Monitor spending patterns and adjust budget allocations.', priority: 'medium' };
    if (trendPercentage < -10) return { type: 'success', icon: <TrendingDown className="w-4 h-4" />, title: 'Excellent Expense Control', message: `Expenses reduced by ${Math.abs(trendPercentage).toFixed(1)}% recently.`, actionable: 'Great discipline! Channel savings into emergency fund or investments.', priority: 'low' };
    if (trendPercentage < -5) return { type: 'success', icon: <ArrowDown className="w-4 h-4" />, title: 'Good Expense Management', message: `${Math.abs(trendPercentage).toFixed(1)}% reduction in spending.`, actionable: 'Positive trend! Continue optimizing and reinvest savings.', priority: 'low' };
    return { type: 'info', icon: <Minus className="w-4 h-4" />, title: 'Stable Expense Pattern', message: 'Expenses remain relatively consistent.', actionable: 'Consistency is good. Look for optimization opportunities.', priority: 'low' };
  };
  
  const analyzeIncomeStability = (): FinancialInsight | null => {
    if (data.length < 2) return null;
    const incomes = data.map(item => item.income);
    const avgIncomeVal = incomes.reduce((sum, val) => sum + val, 0) / incomes.length;
    if (avgIncomeVal === 0 && incomes.every(inc => inc === 0)) return { type: 'info', icon: <Wallet className="w-4 h-4" />, title: 'No Income Tracked', message: 'Income data is not available for stability analysis.', actionable: 'Start tracking your income sources to get a clearer financial picture.', priority: 'medium' };
    const variance = incomes.reduce((sum, val) => sum + Math.pow(val - avgIncomeVal, 2), 0) / incomes.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgIncomeVal > 0 ? (stdDev / avgIncomeVal) * 100 : 0;
    if (coefficientOfVariation < 10) return { type: 'success', icon: <Shield className="w-4 h-4" />, title: 'Highly Stable Income', message: 'Your income shows excellent consistency.', actionable: 'Leverage stability for long-term financial planning and investments.', priority: 'low' };
    if (coefficientOfVariation < 25) return { type: 'info', icon: <Activity className="w-4 h-4" />, title: 'Moderately Stable Income', message: 'Income shows reasonable consistency with some variation.', actionable: 'Build a larger emergency fund to handle income fluctuations.', priority: 'medium' };
    if (coefficientOfVariation < 50) return { type: 'warning', icon: <Zap className="w-4 h-4" />, title: 'Variable Income Pattern', message: 'Income fluctuates significantly between periods.', actionable: 'Create a variable income budget and save more during high-income months.', priority: 'medium' };
    return { type: 'danger', icon: <AlertTriangle className="w-4 h-4" />, title: 'Highly Volatile Income', message: 'Income varies dramatically, creating financial instability.', actionable: 'Priority: Diversify income sources and maintain 6-12 months emergency fund.', priority: 'high' };
  };

  const calculateFinancialHealth = (): FinancialInsight | null => {
    if (data.length === 0) return null;
    let score = 0; const maxScore = 100;
    if (savingsRate >= 20) score += 30; else if (savingsRate >= 10) score += 20; else if (savingsRate > 0) score += 10;
    const positiveMonths = data.filter(item => item.savings > 0).length;
    const consistencyRate = (positiveMonths / data.length) * 100;
    if (consistencyRate >= 90) score += 25; else if (consistencyRate >= 70) score += 15; else if (consistencyRate >= 50) score += 10;
    const incomeToExpenseRatio = avgIncome > 0 ? avgExpenses / avgIncome : 1;
    if (incomeToExpenseRatio <= 0.7) score += 25; else if (incomeToExpenseRatio <= 0.85) score += 15; else if (incomeToExpenseRatio <= 1.0) score += 5;
    if (data.length >= 3) { const recentSavingsAvg = data.slice(-2).reduce((sum, item) => sum + item.savings, 0) / 2; const earlierSavingsAvg = data.slice(0, Math.max(0,data.length-2)).reduce((sum, item) => sum + item.savings, 0) / Math.max(1, data.length-2); if (recentSavingsAvg > earlierSavingsAvg && recentSavingsAvg > 0) score += 20; else if (recentSavingsAvg > 0) score += 10; } else if (avgSavings > 0) score += 10;
    const healthPercentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
    if (healthPercentage >= 85) return { type: 'success', icon: <CheckCircle className="w-4 h-4" />, title: 'Excellent Financial Health', message: `Financial health score: ${healthPercentage.toFixed(0)}/100`, actionable: 'Outstanding! Focus on wealth building and investment diversification.', priority: 'low' };
    if (healthPercentage >= 70) return { type: 'success', icon: <TrendingUp className="w-4 h-4" />, title: 'Good Financial Health', message: `Financial health score: ${healthPercentage.toFixed(0)}/100`, actionable: 'Strong foundation! Work on consistency and growth.', priority: 'low' };
    if (healthPercentage >= 50) return { type: 'warning', icon: <Target className="w-4 h-4" />, title: 'Moderate Financial Health', message: `Financial health score: ${healthPercentage.toFixed(0)}/100`, actionable: 'Room for improvement. Focus on increasing savings rate and consistency.', priority: 'medium' };
    return { type: 'danger', icon: <AlertTriangle className="w-4 h-4" />, title: 'Poor Financial Health', message: `Financial health score: ${healthPercentage.toFixed(0)}/100`, actionable: 'Urgent attention needed. Implement strict budgeting and seek financial advice.', priority: 'high' };
  };
  
  const analyzeSeasonalPatterns = (): FinancialInsight | null => {
    if (data.length < 4) return null;
    const monthlyPattern: { [key: string]: { expenses: number[], income: number[], count: number } } = {};
    data.forEach(item => { const monthName = item.month.split(' ')[0]; if (!monthlyPattern[monthName]) monthlyPattern[monthName] = { expenses: [], income: [], count: 0 }; monthlyPattern[monthName].expenses.push(item.expenses); monthlyPattern[monthName].income.push(item.income); monthlyPattern[monthName].count++; });
    const monthlyAverages = Object.entries(monthlyPattern).map(([month, d]) => ({ month, avgExpenses: d.expenses.reduce((s, v) => s + v, 0) / d.count, avgIncome: d.income.reduce((s, v) => s + v, 0) / d.count, count: d.count }));
    const expenseVariance = monthlyAverages.reduce((max, curr, _, arr) => Math.max(max, curr.avgExpenses) - Math.min(...arr.map(m => m.avgExpenses)), 0);
    const avgMonthlyExpenseTotal = monthlyAverages.reduce((sum, m) => sum + m.avgExpenses, 0) / monthlyAverages.length;
    const variancePercentage = avgMonthlyExpenseTotal > 0 ? (expenseVariance / avgMonthlyExpenseTotal) * 100 : 0;
    if (variancePercentage > 30) { const highestMonth = monthlyAverages.reduce((max, curr) => curr.avgExpenses > max.avgExpenses ? curr : max); const lowestMonth = monthlyAverages.reduce((min, curr) => curr.avgExpenses < min.avgExpenses ? curr : min); return { type: 'info', icon: <Calendar className="w-4 h-4" />, title: 'Strong Seasonal Patterns', message: `${highestMonth.month} expenses are typically ${((highestMonth.avgExpenses / Math.max(1,lowestMonth.avgExpenses) - 1) * 100).toFixed(0)}% higher than ${lowestMonth.month}.`, actionable: `Plan for higher expenses in ${highestMonth.month} by saving extra during ${lowestMonth.month}.`, priority: 'medium' }; }
    if (variancePercentage > 15) return { type: 'info', icon: <Calendar className="w-4 h-4" />, title: 'Moderate Seasonal Variance', message: 'Some months show consistently different spending patterns.', actionable: 'Consider seasonal budgeting to optimize cash flow.', priority: 'low' };
    return null;
  };

  const assessFinancialRisk = (): FinancialInsight | null => {
    if (data.length === 0) return null;
    let riskScore = 0; const incomes = data.map(d => d.income); const avgIncomeVal = incomes.reduce((sum, val) => sum + val, 0) / incomes.length;
    if (avgIncomeVal > 0) { const incomeStdDev = Math.sqrt(incomes.reduce((sum, val) => sum + Math.pow(val - avgIncomeVal, 2), 0) / incomes.length); const incomeCV = (incomeStdDev / avgIncomeVal) * 100; if (incomeCV > 30) riskScore += 3; else if (incomeCV > 15) riskScore += 1; } else riskScore += 2;
    const negativeMonthsCount = data.filter(d => d.savings < 0).length; const negativeMonthsPercentage = (negativeMonthsCount / data.length) * 100; if (negativeMonthsPercentage > 40) riskScore += 3; else if (negativeMonthsPercentage > 20) riskScore += 2; else if (negativeMonthsPercentage > 0) riskScore +=1;
    const emergencyFundMonths = avgExpenses > 0 && totalSavings > 0 ? totalSavings / avgExpenses : 0; if (emergencyFundMonths < 1) riskScore += 3; else if (emergencyFundMonths < 3) riskScore += 2;
    if (riskScore >= 7) return { type: 'danger', icon: <AlertTriangle className="w-4 h-4" />, title: 'High Financial Risk', message: 'Multiple risk factors detected in your financial profile.', actionable: 'Immediate action: Stabilize income, reduce expenses, build emergency fund.', priority: 'high' };
    if (riskScore >= 4) return { type: 'warning', icon: <Shield className="w-4 h-4" />, title: 'Moderate Financial Risk', message: 'Some financial risks identified that need attention.', actionable: 'Focus on building financial buffers and stabilizing cash flow.', priority: 'medium' };
    return null;
  };

  const analyzeGoalPotential = (): FinancialInsight | null => {
    if (avgSavings <= 0 || data.length === 0) return null;
    const yearlyPotential = avgSavings * 12; const milestones = [ { amount: 50000, name: '₹50K Emergency Fund' }, { amount: 100000, name: '₹1L Milestone' }, { amount: 500000, name: '₹5L Investment Goal' }];
    const achievableMilestone = milestones.find(m => yearlyPotential >= m.amount * 0.8);
    if (achievableMilestone) { const timeToAchieve = Math.ceil(achievableMilestone.amount / Math.max(1,avgSavings)); return { type: 'success', icon: <Target className="w-4 h-4" />, title: 'Strong Goal Achievement Potential', message: `At current pace, ${achievableMilestone.name} achievable in ~${timeToAchieve} months.`, actionable: 'Set this as your next financial milestone and track progress monthly.', priority: 'low' }; }
    return null;
  };

  const analyzeBudgetEfficiency = (): FinancialInsight | null => {
    if (avgIncome <= 0 && avgExpenses <= 0) return null;
    const expenseToIncomeRatio = avgIncome > 0 ? (avgExpenses / avgIncome) * 100 : (avgExpenses > 0 ? Infinity : 0);
    if (expenseToIncomeRatio === Infinity) return { type: 'danger', icon: <CreditCard className="w-4 h-4" />, title: 'Expenses with No Income', message: 'Expenses are recorded, but no income is tracked for this period.', actionable: 'Ensure all income sources are logged to accurately assess budget efficiency.', priority: 'high' };
    if (expenseToIncomeRatio <= 50 && avgIncome > 0) return { type: 'success', icon: <CheckCircle className="w-4 h-4" />, title: 'Highly Efficient Budget', message: `Only ${expenseToIncomeRatio.toFixed(1)}% of income goes to expenses.`, actionable: 'Exceptional efficiency! Consider aggressive wealth-building strategies.', priority: 'low' };
    if (expenseToIncomeRatio <= 70 && avgIncome > 0) return { type: 'success', icon: <TrendingUp className="w-4 h-4" />, title: 'Efficient Budget Management', message: `${expenseToIncomeRatio.toFixed(1)}% expense ratio is within optimal range.`, actionable: 'Good control! Look for opportunities to optimize further.', priority: 'low' };
    if (expenseToIncomeRatio <= 90 && avgIncome > 0) return { type: 'warning', icon: <Target className="w-4 h-4" />, title: 'Moderate Budget Efficiency', message: `${expenseToIncomeRatio.toFixed(1)}% expense ratio leaves limited savings room.`, actionable: 'Review discretionary spending categories for optimization opportunities.', priority: 'medium' };
    if (avgIncome > 0) return { type: 'danger', icon: <AlertTriangle className="w-4 h-4" />, title: 'Tight Budget Situation', message: `${expenseToIncomeRatio.toFixed(1)}% expense ratio. Little room for savings.`, actionable: 'Critical review needed. Consider both expense reduction and income increase.', priority: 'high' };
    return null;
  };

  const generateProjections = (): FinancialInsight | null => {
    if (data.length < 2) return null;
    const recentPeriods = Math.min(3, data.length); const recentData = data.slice(-recentPeriods); const avgRecentSavings = recentData.reduce((sum, item) => sum + item.savings, 0) / recentPeriods; const yearProjection = avgRecentSavings * 12;
    if (avgRecentSavings > 0) return { type: 'info', icon: <TrendingUp className="w-4 h-4" />, title: 'Positive Savings Projection', message: `Projected annual savings: ₹${yearProjection.toLocaleString()}`, actionable: 'Maintain momentum to achieve significant growth.', priority: 'low' };
    if (avgRecentSavings < 0 && totalIncome > 0) return { type: 'danger', icon: <TrendingDown className="w-4 h-4" />, title: 'Negative Projection Trend', message: `Current pattern suggests an annual deficit of ₹${Math.abs(yearProjection).toLocaleString()}.`, actionable: 'Immediate intervention required to reverse negative trajectory.', priority: 'high' };
    return null;
  };
  
  const insights = generateFinancialInsights();

  const renderChart = () => {
    const chartData = data.map(item => ({
        ...item,
        income: Number(item.income) || 0,
        expenses: Number(item.expenses) || 0,
        savings: Number(item.savings) || 0,
    }));

    const responsiveContainerProps = {
      width: "100%",
      height: 350,
    };
    
    const chartBaseProps = {
      margin: { top: 5, right: 20, left: -10, bottom: 5 }
    };
    
    const tickStyle = { fontSize: 12, fill: 'hsl(var(--muted-foreground))' };
    const axisLineStyle = { stroke: 'hsl(var(--border))' };
    const gridStyle = { stroke: 'hsl(var(--border))', strokeDasharray: "3 3" };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="p-2 bg-background border border-border rounded-lg shadow-lg">
            <p className="label text-sm font-medium text-foreground">{`${label}`}</p>
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} style={{ color: entry.color }} className="text-xs">
                {`${entry.name}: ₹${Number(entry.value).toLocaleString()}`}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer {...responsiveContainerProps}>
            <ComposedChart data={chartData} {...chartBaseProps}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={axisLineStyle} tickLine={axisLineStyle} />
              <YAxis tick={tickStyle} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} axisLine={axisLineStyle} tickLine={axisLineStyle}/>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize: "12px"}}/>
              {(seriesDisplay === 'all' || seriesDisplay === 'income') && 
                <Area type="monotone" dataKey="income" stackId={seriesDisplay === 'all' ? "1" : undefined} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Income" />}
              {(seriesDisplay === 'all' || seriesDisplay === 'expenses') && 
                <Area type="monotone" dataKey="expenses" stackId={seriesDisplay === 'all' ? "2" : undefined} stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Expenses" />}
              {(seriesDisplay === 'all' || seriesDisplay === 'savings') && 
                <Line type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} name="Net Savings" dot={{ r: 3 }} activeDot={{ r: 5 }} />}
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer {...responsiveContainerProps}>
            <ComposedChart data={chartData} {...chartBaseProps}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={axisLineStyle} tickLine={axisLineStyle} />
              <YAxis tick={tickStyle} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} axisLine={axisLineStyle} tickLine={axisLineStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize: "12px"}}/>
              {(seriesDisplay === 'all' || seriesDisplay === 'income') && 
                <Bar dataKey="income" fill="#3b82f6" name="Income" barSize={20} opacity={0.7} />}
              {(seriesDisplay === 'all' || seriesDisplay === 'expenses') && 
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" barSize={20} opacity={0.7} />}
              {(seriesDisplay === 'all' || seriesDisplay === 'savings') && 
                <Line type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} name="Net Savings" dot={{ r: 3 }} activeDot={{ r: 5 }} />}
            </ComposedChart>
          </ResponsiveContainer>
        );

      default: // line chart
        return (
          <ResponsiveContainer {...responsiveContainerProps}>
            <LineChart data={chartData} {...chartBaseProps}>
              <CartesianGrid {...gridStyle} />
              <XAxis dataKey="month" tick={tickStyle} axisLine={axisLineStyle} tickLine={axisLineStyle} />
              <YAxis tick={tickStyle} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} axisLine={axisLineStyle} tickLine={axisLineStyle} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{fontSize: "12px"}} />
              {(seriesDisplay === 'all' || seriesDisplay === 'income') && 
                <Line type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} name="Income" dot={{ r: 3 }} activeDot={{ r: 5 }} />}
              {(seriesDisplay === 'all' || seriesDisplay === 'expenses') && 
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" dot={{ r: 3 }} activeDot={{ r: 5 }} />}
              {(seriesDisplay === 'all' || seriesDisplay === 'savings') && 
                <Line type="monotone" dataKey="savings" stroke="#22c55e" strokeWidth={2} name="Net Savings" dot={{ r: 3 }} activeDot={{ r: 5 }} />}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Financial Trends Over Time</CardTitle>
          <CardDescription>View your income, expenses, and savings patterns.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-2" />
            <p>No financial trend data available for the selected period.</p>
            <p className="text-xs mt-1">Add transactions to see your trends.</p>
          </div>
          {insights.length > 0 && insights[0].title === 'No Financial Data' && (
             <div className={`mt-4 p-3 rounded-md border-l-4 ${
                insights[0].type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300' : ''
              }`}>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{insights[0].icon}</div>
                  <div>
                    <h5 className="font-medium text-sm">{insights[0].title}</h5>
                    <p className="text-xs">{insights[0].message}</p>
                    {insights[0].actionable && <p className="text-xs mt-1 opacity-80">💡 {insights[0].actionable}</p>}
                  </div>
                </div>
              </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const summaryStats = [
    { label: "Avg Income", value: avgIncome, color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-900/30", isCurrency: true },
    { label: "Avg Expenses", value: avgExpenses, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-900/30", isCurrency: true },
    { label: "Avg Savings", value: avgSavings, color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-900/30", isCurrency: true },
    { label: "Savings Rate", value: savingsRate, unit: "%", fixed: 1, color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-50 dark:bg-purple-900/30", isCurrency: false },
    { label: "Periods", value: data.length, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-900/30", isCurrency: false }
  ];


  return (
    <Card className="w-full" id="financialTrendsChartContainer">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg font-semibold">Financial Trends Over Time</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Comprehensive analysis of your income, expenses, and savings.</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"> {/* Adjusted for responsiveness */}
            <Select value={seriesDisplay} onValueChange={(value: 'all' | 'income' | 'expenses' | 'savings') => setSeriesDisplay(value)}>
              <SelectTrigger className="w-full sm:w-[110px] h-9 text-xs"> {/* Adjusted width */}
                <SelectValue placeholder="Display" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Series</SelectItem>
                <SelectItem value="income" className="text-xs">Income Only</SelectItem>
                <SelectItem value="expenses" className="text-xs">Expenses Only</SelectItem>
                <SelectItem value="savings" className="text-xs">Savings Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(value: 'line' | 'area' | 'composed') => setChartType(value)}>
              <SelectTrigger className="w-full sm:w-[110px] h-9 text-xs"> {/* Adjusted width */}
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line" className="text-xs">Line</SelectItem>
                <SelectItem value="area" className="text-xs">Area</SelectItem>
                <SelectItem value="composed" className="text-xs">Combined</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viewMode} onValueChange={(value: 'trends' | 'analysis' | 'comparison') => setViewMode(value)}>
              <SelectTrigger className="w-full sm:w-[110px] h-9 text-xs"> {/* Adjusted width */}
                <SelectValue placeholder="View Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trends" className="text-xs">Trends</SelectItem>
                <SelectItem value="analysis" className="text-xs">Analysis</SelectItem>
                <SelectItem value="comparison" className="text-xs">Compare</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
          {summaryStats.map(stat => (
            <div key={stat.label} className={`p-2 rounded-lg ${stat.bgColor}`}>
              <div className="text-muted-foreground truncate">{stat.label}</div>
              <div className={`font-bold truncate ${stat.color}`}>
                {stat.unit === "%" 
                  ? `${stat.value.toFixed(stat.fixed || 0)}%` 
                  : stat.isCurrency
                    ? `₹${Math.round(stat.value).toLocaleString()}`
                    : stat.value.toLocaleString()
                }
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 min-h-[350px]">
          {renderChart()}
        </div>

        {viewMode === 'analysis' && insights.length > 0 && (
          <>
            <h4 className="font-semibold text-md mb-3 mt-6">💡 Financial Insights</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.map((insight, index) => (
                <div key={index} className={`p-3 rounded-md border-l-4 ${
                  insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300' :
                  insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-700 dark:text-yellow-300' :
                  insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                } ${insight.priority === 'high' ? 'ring-1 ring-offset-1 ring-red-400 dark:ring-red-600' : ''}`}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex-shrink-0">{insight.icon}</div>
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <h5 className="font-medium text-sm">{insight.title}</h5>
                        {insight.priority === 'high' && <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-fit">High</Badge>}
                      </div>
                      <p className="text-xs mt-0.5">{insight.message}</p>
                      {insight.actionable && <p className="text-xs mt-1 opacity-80">💡 {insight.actionable}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {viewMode === 'comparison' && data.length >=2 && (
             <div className="space-y-4 mt-6">
                <h4 className="font-semibold text-md mb-3">📊 Period Comparison</h4>
                <p className="text-xs text-muted-foreground">Comparison view can show best/worst months, or period-over-period changes. (UI for this view to be implemented)</p>
             </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialTrendsChart;