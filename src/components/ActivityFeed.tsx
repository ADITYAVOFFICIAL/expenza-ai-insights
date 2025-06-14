import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { TrendingUp, UserPlus, Goal, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { storageService } from '@/lib/appwrite';

export interface ActivityItem {
  id: string;
  type: 'expense_added' | 'goal_created' | 'group_joined' | 'allowance_updated' | 'system_alert' | string;
  description: string;
  timestamp: string;
  user?: string;
  userId?: string; // Add userId to identify which user performed the activity
  avatarUrl?: string;
  avatarId?: string; // Add avatarId for storage service lookups
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
  const { user } = useAuth();

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

  const getUserAvatar = (item: ActivityItem) => {
    // If the activity has a specific avatarUrl (already resolved), use it
    if (item.avatarUrl) {
      return item.avatarUrl;
    }

    // If the activity has an avatarId, resolve it using storageService
    if (item.avatarId && storageService) {
      try {
        return storageService.getFileView(item.avatarId).toString();
      } catch (error) {
        console.warn('Failed to get avatar from storage service:', error);
      }
    }

    // If the activity is from the current user, use their avatar
    if (user && (item.userId === user.$id || item.user === user.name)) {
      // First try the avatarUrl from user context (already resolved)
      if (user.avatarUrl) {
        return user.avatarUrl;
      }
      
      // Fallback to prefs profileImageId (like in Header component)
      if (user.prefs?.profileImageId && storageService) {
        try {
          return storageService.getFilePreview(user.prefs.profileImageId).toString();
        } catch (error) {
          console.warn('Failed to get profile image from prefs:', error);
        }
      }

      // If user has avatarUrl as an ID (not resolved URL), resolve it
      if ((user as any).avatarId && storageService) {
        try {
          return storageService.getFileView((user as any).avatarId).toString();
        } catch (error) {
          console.warn('Failed to resolve user avatar ID:', error);
        }
      }
    }

    return null;
  };

  const getUserInitials = (item: ActivityItem) => {
    if (item.user) {
      return item.user
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    if (user && (item.userId === user.$id)) {
      return user.name 
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        : 'U';
    }
    return 'U';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {items.map((item) => {
          const IconComponent = item.icon || typeIcons[item.type] || typeIcons.default;
          const avatarUrl = getUserAvatar(item);
          const userInitials = getUserInitials(item);

          return (
            <div key={item.id} className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 border">
                {avatarUrl ? (
                  <AvatarImage 
                    src={avatarUrl} 
                    alt={item.user || user?.name || 'User'}
                    onError={(e) => {
                      console.warn('Failed to load avatar image:', avatarUrl);
                      // Hide the image on error so fallback shows
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <AvatarFallback className="text-xs bg-gradient-to-br from-primary/70 to-accent/70 text-primary-foreground">
                  {avatarUrl ? userInitials : <IconComponent className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p 
                  className="text-sm text-foreground leading-tight break-words" 
                  dangerouslySetInnerHTML={{ __html: item.description }} 
                />
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
