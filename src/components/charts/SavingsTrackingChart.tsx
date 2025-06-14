import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, Calendar, DollarSign } from 'lucide-react';

interface SavingsDataPoint {
  period: string;
  saved: number;
  target: number;
  difference: number;
}

interface SavingsTrackingChartProps {
  weeklyData: SavingsDataPoint[];
  monthlyData: SavingsDataPoint[];
}

interface SavingsInsight {
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: React.ReactNode;
  title: string;
  message: string;
  actionable?: string;
}

const SavingsTrackingChart: React.FC<SavingsTrackingChartProps> = ({ weeklyData, monthlyData }) => {
  const [viewMode, setViewMode] = React.useState<'weekly' | 'monthly'>('monthly');

  const currentData = viewMode === 'weekly' ? weeklyData : monthlyData;
  
  const totalSaved = currentData.reduce((sum, item) => sum + item.saved, 0);
  const totalTarget = currentData.reduce((sum, item) => sum + item.target, 0);
  const avgSavings = currentData.length > 0 ? totalSaved / currentData.length : 0;
  const savingsRate = totalTarget > 0 ? ((totalSaved / totalTarget) * 100) : 0;

  // Enhanced savings insights algorithm
  const generateAdvancedSavingsInsights = (): SavingsInsight[] => {
    const insights: SavingsInsight[] = [];
    
    if (currentData.length === 0) {
      insights.push({
        type: 'info',
        icon: <Target className="w-4 h-4" />,
        title: 'No Savings Data',
        message: 'Start tracking your savings goals to get personalized insights.',
        actionable: 'Create your first savings goal to begin building wealth systematically.'
      });
      return insights;
    }

    // Performance Analysis
    const performanceInsight = analyzePerformance();
    if (performanceInsight) insights.push(performanceInsight);

    // Trend Analysis
    const trendInsight = analyzeTrends();
    if (trendInsight) insights.push(trendInsight);

    // Consistency Analysis
    const consistencyInsight = analyzeConsistency();
    if (consistencyInsight) insights.push(consistencyInsight);

    // Goal Achievement Prediction
    const predictionInsight = predictGoalAchievement();
    if (predictionInsight) insights.push(predictionInsight);

    // Optimization Suggestions
    const optimizationInsight = suggestOptimizations();
    if (optimizationInsight) insights.push(optimizationInsight);

    // Risk Assessment
    const riskInsight = assessSavingsRisk();
    if (riskInsight) insights.push(riskInsight);

    // Milestone Recognition
    const milestoneInsight = recognizeMilestones();
    if (milestoneInsight) insights.push(milestoneInsight);

    return insights.slice(0, 6); // Limit to 6 most relevant insights
  };

  const analyzePerformance = (): SavingsInsight | null => {
    if (savingsRate >= 100) {
      return {
        type: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        title: 'Exceptional Performance',
        message: `Outstanding! You've achieved ${savingsRate.toFixed(1)}% of your savings target.`,
        actionable: 'Consider increasing your goals or exploring investment opportunities for excess savings.'
      };
    } else if (savingsRate >= 80) {
      return {
        type: 'success',
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Strong Savings Performance',
        message: `Excellent progress at ${savingsRate.toFixed(1)}% of your target.`,
        actionable: 'You\'re on track! Consider automating savings to maintain this momentum.'
      };
    } else if (savingsRate >= 50) {
      return {
        type: 'warning',
        icon: <Target className="w-4 h-4" />,
        title: 'Moderate Progress',
        message: `You're at ${savingsRate.toFixed(1)}% of your savings target.`,
        actionable: 'Consider reviewing your budget to find additional savings opportunities.'
      };
    } else if (savingsRate > 0) {
      return {
        type: 'danger',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Below Target Performance',
        message: `Currently at ${savingsRate.toFixed(1)}% of your savings goal.`,
        actionable: 'Review your expenses and consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.'
      };
    } else {
      return {
        type: 'danger',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'No Savings Recorded',
        message: 'No savings activity detected in the selected period.',
        actionable: 'Start small - even ₹500 per month can build a significant emergency fund over time.'
      };
    }
  };

  const analyzeTrends = (): SavingsInsight | null => {
    if (currentData.length < 2) return null;

    const recentPeriods = currentData.slice(-3);
    const earlierPeriods = currentData.slice(0, -3);
    
    if (earlierPeriods.length === 0) return null;

    const recentAvg = recentPeriods.reduce((sum, item) => sum + item.saved, 0) / recentPeriods.length;
    const earlierAvg = earlierPeriods.reduce((sum, item) => sum + item.saved, 0) / earlierPeriods.length;
    
    const trendPercentage = earlierAvg > 0 ? ((recentAvg - earlierAvg) / earlierAvg) * 100 : 0;

    if (trendPercentage > 20) {
      return {
        type: 'success',
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Accelerating Savings',
        message: `Your savings have increased by ${trendPercentage.toFixed(1)}% recently.`,
        actionable: 'Fantastic momentum! Consider increasing your goals to match this improved capacity.'
      };
    } else if (trendPercentage > 5) {
      return {
        type: 'success',
        icon: <TrendingUp className="w-4 h-4" />,
        title: 'Positive Trend',
        message: `Steady improvement with ${trendPercentage.toFixed(1)}% increase in recent savings.`,
        actionable: 'Great progress! Keep building on these positive habits.'
      };
    } else if (trendPercentage < -20) {
      return {
        type: 'danger',
        icon: <TrendingDown className="w-4 h-4" />,
        title: 'Declining Savings',
        message: `Your savings have decreased by ${Math.abs(trendPercentage).toFixed(1)}% recently.`,
        actionable: 'Review recent expenses and identify what changed. Consider automating savings to prevent further decline.'
      };
    } else if (trendPercentage < -5) {
      return {
        type: 'warning',
        icon: <TrendingDown className="w-4 h-4" />,
        title: 'Slight Decline',
        message: `Recent savings have decreased by ${Math.abs(trendPercentage).toFixed(1)}%.`,
        actionable: 'Monitor your spending patterns and consider adjusting your budget allocation.'
      };
    }

    return {
      type: 'info',
      icon: <Target className="w-4 h-4" />,
      title: 'Stable Savings Pattern',
      message: 'Your savings rate remains relatively consistent.',
      actionable: 'Consider challenging yourself with a slightly higher savings target to accelerate wealth building.'
    };
  };

  const analyzeConsistency = (): SavingsInsight | null => {
    if (currentData.length < 3) return null;

    const savedAmounts = currentData.map(item => item.saved);
    const mean = savedAmounts.reduce((sum, val) => sum + val, 0) / savedAmounts.length;
    const variance = savedAmounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / savedAmounts.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = mean > 0 ? (standardDeviation / mean) * 100 : 0;

    if (coefficientOfVariation < 20) {
      return {
        type: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        title: 'Highly Consistent Savings',
        message: 'Your savings pattern shows excellent consistency.',
        actionable: 'Your disciplined approach is building strong financial habits. Consider gradually increasing the amount.'
      };
    } else if (coefficientOfVariation < 40) {
      return {
        type: 'info',
        icon: <Target className="w-4 h-4" />,
        title: 'Moderately Consistent',
        message: 'Your savings show some variation but maintain a reasonable pattern.',
        actionable: 'Try setting up automatic transfers to improve consistency.'
      };
    } else {
      return {
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Irregular Savings Pattern',
        message: 'Your savings amounts vary significantly between periods.',
        actionable: 'Consider budgeting tools and automatic savings to create more predictable patterns.'
      };
    }
  };

  const predictGoalAchievement = (): SavingsInsight | null => {
    if (currentData.length < 2) return null;

    const totalDeficit = currentData.reduce((sum, item) => sum + Math.max(0, item.difference), 0);
    const avgSavingsRate = savingsRate;
    
    if (totalDeficit === 0) {
      return {
        type: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        title: 'Goals Achieved',
        message: 'Congratulations! You\'ve met all your savings targets.',
        actionable: 'Time to set new, more ambitious goals or explore investment opportunities.'
      };
    }

    const periodsToGoal = avgSavings > 0 ? Math.ceil(totalDeficit / avgSavings) : Infinity;
    const timeframe = viewMode === 'weekly' ? 'weeks' : 'months';

    if (periodsToGoal <= 2) {
      return {
        type: 'success',
        icon: <Calendar className="w-4 h-4" />,
        title: 'Goals Within Reach',
        message: `At your current pace, you'll reach your goals in approximately ${periodsToGoal} ${timeframe}.`,
        actionable: 'You\'re almost there! Stay focused and maintain your current savings discipline.'
      };
    } else if (periodsToGoal <= 6) {
      return {
        type: 'info',
        icon: <Calendar className="w-4 h-4" />,
        title: 'Steady Progress to Goals',
        message: `Estimated ${periodsToGoal} ${timeframe} to reach your savings targets.`,
        actionable: 'Consider small lifestyle adjustments to accelerate your timeline.'
      };
    } else if (periodsToGoal < Infinity) {
      return {
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Long Timeline to Goals',
        message: `At current rates, it may take ${periodsToGoal} ${timeframe} to reach your goals.`,
        actionable: 'Review your goals for realism or find ways to increase your savings rate significantly.'
      };
    } else {
      return {
        type: 'danger',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Goals May Be Unreachable',
        message: 'Current savings patterns won\'t achieve your set goals.',
        actionable: 'Either adjust your goals to be more realistic or dramatically increase your savings efforts.'
      };
    }
  };

  const suggestOptimizations = (): SavingsInsight | null => {
    const avgMonthlyTarget = totalTarget / Math.max(currentData.length, 1);
    const avgMonthlySaved = totalSaved / Math.max(currentData.length, 1);
    const monthlyGap = avgMonthlyTarget - avgMonthlySaved;

    if (monthlyGap <= 0) {
      return {
        type: 'success',
        icon: <DollarSign className="w-4 h-4" />,
        title: 'Optimization Opportunity',
        message: 'You\'re exceeding targets! Consider optimizing for higher returns.',
        actionable: 'Explore high-yield savings accounts, FDs, or SIPs to maximize your surplus savings.'
      };
    }

    const dailyEquivalent = monthlyGap / 30;
    const weeklyEquivalent = monthlyGap / 4;

    if (dailyEquivalent < 100) {
      return {
        type: 'info',
        icon: <DollarSign className="w-4 h-4" />,
        title: 'Small Daily Changes',
        message: `You need just ₹${Math.round(dailyEquivalent)} more per day to meet your goals.`,
        actionable: 'Try skipping one expensive coffee or cooking one more meal at home per day.'
      };
    } else if (weeklyEquivalent < 1000) {
      return {
        type: 'info',
        icon: <DollarSign className="w-4 h-4" />,
        title: 'Weekly Optimization',
        message: `Bridge the gap with ₹${Math.round(weeklyEquivalent)} more per week.`,
        actionable: 'Consider reducing one entertainment expense or finding a small side income weekly.'
      };
    } else {
      return {
        type: 'warning',
        icon: <DollarSign className="w-4 h-4" />,
        title: 'Significant Gap to Close',
        message: `You need ₹${Math.round(monthlyGap)} more monthly to meet your targets.`,
        actionable: 'Review major expense categories: housing, food, transportation. Consider the envelope budgeting method.'
      };
    }
  };

  const assessSavingsRisk = (): SavingsInsight | null => {
    const zeroSavingsPeriods = currentData.filter(item => item.saved === 0).length;
    const riskPercentage = (zeroSavingsPeriods / currentData.length) * 100;

    if (riskPercentage === 0) {
      return {
        type: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        title: 'Low Savings Risk',
        message: 'You\'ve maintained savings in every tracked period.',
        actionable: 'Excellent discipline! Consider building 6-12 months of emergency fund as your foundation.'
      };
    } else if (riskPercentage < 20) {
      return {
        type: 'info',
        icon: <Target className="w-4 h-4" />,
        title: 'Manageable Risk Profile',
        message: `${riskPercentage.toFixed(1)}% of periods had no savings.`,
        actionable: 'Create an emergency buffer to handle irregular income or unexpected expenses.'
      };
    } else if (riskPercentage < 50) {
      return {
        type: 'warning',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'Moderate Savings Risk',
        message: `${riskPercentage.toFixed(1)}% of periods had zero savings.`,
        actionable: 'Focus on building consistent savings habits before increasing amounts. Start with micro-investments.'
      };
    } else {
      return {
        type: 'danger',
        icon: <AlertTriangle className="w-4 h-4" />,
        title: 'High Savings Risk',
        message: `${riskPercentage.toFixed(1)}% of periods had no savings recorded.`,
        actionable: 'Priority: establish an emergency fund. Use the pay-yourself-first principle - save before spending.'
      };
    }
  };

  const recognizeMilestones = (): SavingsInsight | null => {
    const milestones = [
      { amount: 10000, title: 'First ₹10K Milestone' },
      { amount: 50000, title: '₹50K Achievement' },
      { amount: 100000, title: 'Lakh Club Member' },
      { amount: 500000, title: '₹5 Lakh Milestone' },
      { amount: 1000000, title: 'Millionaire Status' }
    ];

    const nextMilestone = milestones.find(m => totalSaved < m.amount);
    const lastAchieved = milestones.filter(m => totalSaved >= m.amount).pop();

    if (lastAchieved) {
      return {
        type: 'success',
        icon: <CheckCircle className="w-4 h-4" />,
        title: `🎉 ${lastAchieved.title}`,
        message: `Congratulations on reaching ₹${totalSaved.toLocaleString()}!`,
        actionable: nextMilestone 
          ? `Next target: ${nextMilestone.title} (₹${(nextMilestone.amount - totalSaved).toLocaleString()} to go)`
          : 'Consider setting custom milestones to maintain motivation.'
      };
    } else if (nextMilestone) {
      const progress = (totalSaved / nextMilestone.amount) * 100;
      return {
        type: 'info',
        icon: <Target className="w-4 h-4" />,
        title: `Progress to ${nextMilestone.title}`,
        message: `You're ${progress.toFixed(1)}% of the way to ₹${nextMilestone.amount.toLocaleString()}.`,
        actionable: `Just ₹${(nextMilestone.amount - totalSaved).toLocaleString()} more to reach this milestone!`
      };
    }

    return null;
  };

  const insights = generateAdvancedSavingsInsights();

  if (!currentData || currentData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Savings Tracking</CardTitle>
            <Select value={viewMode} onValueChange={(value: 'weekly' | 'monthly') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            Track your explicit savings vs targets over time
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
              }`}>
                <div className={`flex items-start gap-3 ${
                  insight.type === 'success' ? 'text-green-800 dark:text-green-200' :
                  insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                  insight.type === 'danger' ? 'text-red-800 dark:text-red-200' :
                  'text-blue-800 dark:text-blue-200'
                }`}>
                  <div className="mt-0.5">{insight.icon}</div>
                  <div>
                    <h4 className="font-medium mb-1">{insight.title}</h4>
                    <p className="text-sm mb-2">{insight.message}</p>
                    {insight.actionable && (
                      <p className="text-xs opacity-80 font-medium">💡 {insight.actionable}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Savings Tracking</CardTitle>
          <Select value={viewMode} onValueChange={(value: 'weekly' | 'monthly') => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Track your explicit savings vs targets over time
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Saved</div>
            <div className="text-lg font-bold text-green-600">₹{totalSaved.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Target</div>
            <div className="text-lg font-bold text-blue-600">₹{totalTarget.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Avg {viewMode.slice(0, -2)}ly</div>
            <div className="text-lg font-bold text-purple-600">₹{Math.round(avgSavings).toLocaleString()}</div>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Savings Rate</div>
            <div className="text-lg font-bold text-orange-600">{savingsRate.toFixed(1)}%</div>
          </div>
        </div>

        {currentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="period" 
                className="text-xs" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `₹${value.toLocaleString()}`, 
                  name === 'saved' ? 'Actual Saved' : 'Target'
                ]}
                labelClassName="text-sm font-medium"
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="saved" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Actual Saved"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#6b7280" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
                dot={{ fill: '#6b7280', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground text-center py-10">No data for this view.</p>
        )}

        {currentData.length > 0 && (
          <>
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
              {currentData.slice(-3).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.period}</div>
                    <div className="text-sm text-muted-foreground">
                      ₹{item.saved.toLocaleString()} saved
                    </div>
                  </div>
                  <Badge 
                    variant={item.difference > 0 ? "destructive" : "default"}
                    className={item.difference <= 0 ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    {item.difference > 0 ? '-' : '+'}₹{Math.abs(item.difference).toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Enhanced Insights Section */}
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-lg mb-4">💡 Savings Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' :
                    insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
                    insight.type === 'danger' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
                    'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                  }`}>
                    <div className={`flex items-start gap-3 ${
                      insight.type === 'success' ? 'text-green-800 dark:text-green-200' :
                      insight.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
                      insight.type === 'danger' ? 'text-red-800 dark:text-red-200' :
                      'text-blue-800 dark:text-blue-200'
                    }`}>
                      <div className="mt-0.5">{insight.icon}</div>
                      <div>
                        <h5 className="font-medium mb-1">{insight.title}</h5>
                        <p className="text-sm mb-2">{insight.message}</p>
                        {insight.actionable && (
                          <p className="text-xs opacity-80 font-medium">💡 {insight.actionable}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsTrackingChart;
