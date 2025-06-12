
import React, { useState } from 'react';
import { Users, Plus, Settings, Crown, DollarSign, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Groups = () => {
  const [groups, setGroups] = useState([
    {
      id: '1',
      name: 'Roommates',
      description: 'Shared expenses for apartment',
      members: ['You', 'John', 'Sarah', 'Mike'],
      totalExpenses: 15400,
      yourShare: 3850,
      isAdmin: true,
      recentExpenses: [
        { id: '1', name: 'Electricity Bill', amount: 2400, paidBy: 'You', date: '2024-01-15' },
        { id: '2', name: 'Groceries', amount: 1800, paidBy: 'John', date: '2024-01-14' },
        { id: '3', name: 'Internet Bill', amount: 1200, paidBy: 'Sarah', date: '2024-01-13' },
      ]
    },
    {
      id: '2',
      name: 'Trip to Goa',
      description: 'Weekend trip expenses',
      members: ['You', 'Alex', 'Priya'],
      totalExpenses: 8900,
      yourShare: 2966,
      isAdmin: false,
      recentExpenses: [
        { id: '4', name: 'Hotel Booking', amount: 4500, paidBy: 'Alex', date: '2024-01-12' },
        { id: '5', name: 'Food & Drinks', amount: 2800, paidBy: 'You', date: '2024-01-11' },
        { id: '6', name: 'Transportation', amount: 1600, paidBy: 'Priya', date: '2024-01-10' },
      ]
    }
  ]);

  const [settlements, setSettlements] = useState([
    { id: '1', from: 'You', to: 'John', amount: 450, groupName: 'Roommates', status: 'pending' },
    { id: '2', from: 'Sarah', to: 'You', amount: 300, groupName: 'Roommates', status: 'pending' },
    { id: '3', from: 'Alex', to: 'You', amount: 200, groupName: 'Trip to Goa', status: 'completed' },
  ]);

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', members: '' });

  const handleCreateGroup = () => {
    const members = newGroup.members.split(',').map(m => m.trim()).filter(m => m);
    const group = {
      id: Date.now().toString(),
      name: newGroup.name,
      description: newGroup.description,
      members: ['You', ...members],
      totalExpenses: 0,
      yourShare: 0,
      isAdmin: true,
      recentExpenses: []
    };
    setGroups([...groups, group]);
    setNewGroup({ name: '', description: '', members: '' });
    setShowCreateGroup(false);
  };

  const handleSettlement = (settlementId: string, action: 'accept' | 'reject') => {
    setSettlements(settlements.map(s => 
      s.id === settlementId 
        ? { ...s, status: action === 'accept' ? 'completed' : 'rejected' }
        : s
    ));
  };

  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const totalOwed = pendingSettlements.filter(s => s.from === 'You').reduce((acc, s) => acc + s.amount, 0);
  const totalOwedToYou = pendingSettlements.filter(s => s.to === 'You').reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Groups</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Manage shared expenses with friends</p>
        </div>
        <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Trip to Goa"
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">Description</Label>
                <Textarea
                  id="groupDescription"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Brief description of the group"
                />
              </div>
              <div>
                <Label htmlFor="groupMembers">Members (comma separated)</Label>
                <Input
                  id="groupMembers"
                  value={newGroup.members}
                  onChange={(e) => setNewGroup({ ...newGroup, members: e.target.value })}
                  placeholder="John, Sarah, Mike"
                />
              </div>
              <Button onClick={handleCreateGroup} className="w-full">
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">You Owe</div>
                <div className="text-xl font-bold text-red-600">₹{totalOwed.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Owed to You</div>
                <div className="text-xl font-bold text-green-600">₹{totalOwedToYou.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Groups</div>
                <div className="text-xl font-bold">{groups.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Settlements */}
      {pendingSettlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Settlements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingSettlements.map((settlement) => (
                <div key={settlement.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {settlement.from === 'You' ? 'You owe' : `${settlement.from} owes you`} ₹{settlement.amount}
                    </div>
                    <div className="text-sm text-muted-foreground">{settlement.groupName}</div>
                  </div>
                  {settlement.to === 'You' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600"
                        onClick={() => handleSettlement(settlement.id, 'accept')}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600"
                        onClick={() => handleSettlement(settlement.id, 'reject')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  {group.isAdmin && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{group.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Members */}
                <div>
                  <div className="text-sm font-medium mb-2">Members ({group.members.length})</div>
                  <div className="flex flex-wrap gap-2">
                    {group.members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{member[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expense Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                    <div className="font-semibold">₹{group.totalExpenses.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Your Share</div>
                    <div className="font-semibold">₹{group.yourShare.toLocaleString()}</div>
                  </div>
                </div>

                {/* Recent Expenses */}
                <div>
                  <div className="text-sm font-medium mb-2">Recent Expenses</div>
                  <div className="space-y-2">
                    {group.recentExpenses.slice(0, 3).map((expense) => (
                      <div key={expense.id} className="flex justify-between items-center text-sm">
                        <div>
                          <div className="font-medium">{expense.name}</div>
                          <div className="text-muted-foreground">Paid by {expense.paidBy}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₹{expense.amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{expense.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Add Expense
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Settle Up
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Groups;
