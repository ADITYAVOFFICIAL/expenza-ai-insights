import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { TrendingUp, UserPlus, Goal, Users, AlertCircle } from 'lucide-react';

export interface ActivityItem {
  id: string;
  type: 'expense_added' | 'goal_created' | 'group_joined' | 'allowance_updated' | 'system_alert' | string;
  description: string;
  timestamp: string;
  user?: string;
  avatarUrl?: string;
  icon?: React.ElementType;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

const typeIcons: { [key: string]: React.ElementType } = {
  expense_added: TrendingUp,
  goal_created: Goal,
  group_joined: UserPlus,
  allowance_updated: TrendingUp,
  system_alert: AlertCircle,
  default: Users,
};

const ActivityFeed: React.FC<ActivityFeedProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {items.map((item) => {
          const IconComponent = item.icon || typeIcons[item.type] || typeIcons.default;
          return (
            <div key={item.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 border">
                {item.avatarUrl && <AvatarImage src={item.avatarUrl} alt={item.user || 'Activity'} />}
                <AvatarFallback className="text-xs">
                  {item.user ? item.user.substring(0, 2).toUpperCase() : <IconComponent className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-tight break-words" dangerouslySetInnerHTML={{ __html: item.description }} />
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
