import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface QuickStatProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  description?: string;
}

interface QuickStatsProps {
  stats: QuickStatProps[];
}

const TrendIcon = ({ trend }: { trend?: 'up' | 'down' | 'neutral' }) => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const QuickStats: React.FC<QuickStatsProps> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {[...Array(4)].map((_, index) => (
                 <Card key={index} className="p-3 lg:p-4">
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-10 w-10"></div>
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded col-span-2"></div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded col-span-1"></div>
                                </div>
                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-1 lg:mb-2">
              <p className="text-xs lg:text-sm text-muted-foreground">{stat.title}</p>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="text-lg lg:text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
            {stat.change && (
              <div className="flex items-center text-xs">
                <TrendIcon trend={stat.trend} />
                <span className={`ml-1 ${
                  stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {stat.change}
                </span>
              </div>
            )}
            {!stat.change && stat.description && (
                 <p className="text-xs text-muted-foreground">{stat.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;