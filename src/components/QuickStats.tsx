
import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

const QuickStats = () => {
  const stats = [
    {
      label: 'This Month',
      value: '₹24,580',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-red-600'
    },
    {
      label: 'Savings',
      value: '₹8,240',
      change: '+8.2%',
      trend: 'up',
      icon: Wallet,
      color: 'text-green-600'
    },
    {
      label: 'Goals Progress',
      value: '67%',
      change: '+5.1%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      label: 'Pending Splits',
      value: '₹1,250',
      change: '-2.3%',
      trend: 'down',
      icon: TrendingDown,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-sm font-medium ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QuickStats;
