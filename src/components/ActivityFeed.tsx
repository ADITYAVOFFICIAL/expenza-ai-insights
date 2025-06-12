
import React from 'react';
import { Clock, DollarSign, Users, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  type: 'expense' | 'payment' | 'goal' | 'group' | 'split';
  title: string;
  description: string;
  amount?: number;
  timestamp: string;
  status?: 'completed' | 'pending' | 'settled';
}

const ActivityFeed: React.FC = () => {
  // Mock activity data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'expense',
      title: 'Lunch at Café Coffee Day',
      description: 'Added new expense',
      amount: 450,
      timestamp: '2024-01-15T14:30:00Z',
      status: 'completed'
    },
    {
      id: '2',
      type: 'split',
      title: 'Dinner split with friends',
      description: 'Split ₹2,400 among 4 people',
      amount: 600,
      timestamp: '2024-01-14T20:15:00Z',
      status: 'pending'
    },
    {
      id: '3',
      type: 'goal',
      title: 'Emergency Fund Goal',
      description: 'Added ₹5,000 to goal',
      amount: 5000,
      timestamp: '2024-01-14T10:00:00Z',
      status: 'completed'
    },
    {
      id: '4',
      type: 'payment',
      title: 'Rent Payment',
      description: 'Settled group expense',
      amount: 25000,
      timestamp: '2024-01-13T09:00:00Z',
      status: 'settled'
    }
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'expense':
        return DollarSign;
      case 'payment':
        return TrendingUp;
      case 'goal':
        return Target;
      case 'group':
      case 'split':
        return Users;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status?: Activity['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'settled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-background">
                <IconComponent className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-between">
                  {activity.amount && (
                    <span className="font-medium text-sm">
                      ₹{activity.amount.toLocaleString()}
                    </span>
                  )}
                  {activity.status && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getStatusColor(activity.status)}`}
                    >
                      {activity.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
