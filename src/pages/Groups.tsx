
import React, { useState } from 'react';
import { Plus, Users, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Groups = () => {
  // Mock groups data
  const groups = [
    {
      id: 'family',
      name: 'Family',
      description: 'Household expenses and family outings',
      members: ['You', 'Sarah', 'Mom', 'Dad'],
      totalExpenses: 15420,
      pendingSettlements: 2340,
      recentActivity: '2 hours ago'
    },
    {
      id: 'friends',
      name: 'College Friends',
      description: 'Weekend trips and hangouts',
      members: ['You', 'John', 'Mike', 'Alex', 'Emma'],
      totalExpenses: 8950,
      pendingSettlements: 450,
      recentActivity: '1 day ago'
    },
    {
      id: 'roommates',
      name: 'Roommates',
      description: 'Shared apartment expenses',
      members: ['You', 'Chris', 'Jordan'],
      totalExpenses: 12300,
      pendingSettlements: 0,
      recentActivity: '3 days ago'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground">Manage your expense groups and splits</p>
        </div>
        <Button className="gradient-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Groups</p>
                <p className="text-xl font-bold">{groups.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Group Expenses</p>
                <p className="text-xl font-bold">₹{groups.reduce((sum, group) => sum + group.totalExpenses, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Settlements</p>
                <p className="text-xl font-bold">₹{groups.reduce((sum, group) => sum + group.pendingSettlements, 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                  </div>
                  {group.pendingSettlements > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Members */}
                <div>
                  <p className="text-sm font-medium mb-2">Members ({group.members.length})</p>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((member, index) => (
                      <Avatar key={index} className="w-8 h-8 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {member.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">+{group.members.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expenses */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Expenses</span>
                    <span className="font-medium">₹{group.totalExpenses.toLocaleString()}</span>
                  </div>
                  {group.pendingSettlements > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pending Settlements</span>
                      <span className="font-medium text-red-600">₹{group.pendingSettlements.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Activity</span>
                    <span className="text-sm">{group.recentActivity}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Add Expense
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Groups;
