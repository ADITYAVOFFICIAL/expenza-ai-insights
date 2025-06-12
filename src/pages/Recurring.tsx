import React, { useState } from 'react';
import { Calendar, Plus, Edit, Trash2, Pause, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const Recurring = () => {
  const [recurringExpenses, setRecurringExpenses] = useState([
    {
      id: '1',
      name: 'Rent',
      amount: 25000,
      category: 'housing',
      frequency: 'monthly',
      nextDue: '2024-02-01',
      isActive: true,
      bank: 'HDFC Bank',
      paymentApp: 'UPI',
      lastPaid: '2024-01-01'
    },
    {
      id: '2',
      name: 'Internet Bill',
      amount: 1200,
      category: 'utilities',
      frequency: 'monthly',
      nextDue: '2024-01-25',
      isActive: true,
      bank: 'SBI',
      paymentApp: 'Net Banking',
      lastPaid: '2023-12-25'
    },
    {
      id: '3',
      name: 'Spotify Premium',
      amount: 119,
      category: 'entertainment',
      frequency: 'monthly',
      nextDue: '2024-01-20',
      isActive: true,
      bank: 'ICICI Bank',
      paymentApp: 'Card',
      lastPaid: '2023-12-20'
    },
    {
      id: '4',
      name: 'Gym Membership',
      amount: 2500,
      category: 'health',
      frequency: 'monthly',
      nextDue: '2024-01-15',
      isActive: false,
      bank: 'Axis Bank',
      paymentApp: 'UPI',
      lastPaid: '2023-11-15'
    },
    {
      id: '5',
      name: 'Car Insurance',
      amount: 12000,
      category: 'insurance',
      frequency: 'yearly',
      nextDue: '2024-06-15',
      isActive: true,
      bank: 'HDFC Bank',
      paymentApp: 'Net Banking',
      lastPaid: '2023-06-15'
    }
  ]);

  const [showCreateRecurring, setShowCreateRecurring] = useState(false);
  const [newRecurring, setNewRecurring] = useState({
    name: '',
    amount: '',
    category: 'utilities',
    frequency: 'monthly',
    nextDue: '',
    bank: 'HDFC Bank',
    paymentApp: 'UPI'
  });

  const handleCreateRecurring = () => {
    const recurring = {
      id: Date.now().toString(),
      name: newRecurring.name,
      amount: parseFloat(newRecurring.amount),
      category: newRecurring.category,
      frequency: newRecurring.frequency,
      nextDue: newRecurring.nextDue,
      isActive: true,
      bank: newRecurring.bank,
      paymentApp: newRecurring.paymentApp,
      lastPaid: ''
    };
    setRecurringExpenses([...recurringExpenses, recurring]);
    setNewRecurring({
      name: '', amount: '', category: 'utilities', frequency: 'monthly',
      nextDue: '', bank: 'HDFC Bank', paymentApp: 'UPI'
    });
    setShowCreateRecurring(false);
  };

  const toggleRecurring = (id: string) => {
    setRecurringExpenses(recurringExpenses.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const deleteRecurring = (id: string) => {
    setRecurringExpenses(recurringExpenses.filter(r => r.id !== id));
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-red-100 text-red-800';
      case 'weekly': return 'bg-yellow-100 text-yellow-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'yearly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilDue = (nextDue: string) => {
    const days = Math.ceil((new Date(nextDue).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const activeExpenses = recurringExpenses.filter(r => r.isActive);
  const totalMonthlyAmount = activeExpenses
    .filter(r => r.frequency === 'monthly')
    .reduce((acc, r) => acc + r.amount, 0);
  const dueThisWeek = activeExpenses.filter(r => getDaysUntilDue(r.nextDue) <= 7);

  return (
    <div className="space-y-4 lg:space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Recurring Expenses</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Manage your regular bills and subscriptions</p>
        </div>
        <Dialog open={showCreateRecurring} onOpenChange={setShowCreateRecurring}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Recurring Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recurringName">Expense Name</Label>
                <Input
                  id="recurringName"
                  value={newRecurring.name}
                  onChange={(e) => setNewRecurring({ ...newRecurring, name: e.target.value })}
                  placeholder="e.g., Netflix Subscription"
                />
              </div>
              <div>
                <Label htmlFor="recurringAmount">Amount (₹)</Label>
                <Input
                  id="recurringAmount"
                  type="number"
                  value={newRecurring.amount}
                  onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                  placeholder="599"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recurringCategory">Category</Label>
                  <Select value={newRecurring.category} onValueChange={(value) => setNewRecurring({ ...newRecurring, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utilities">Utilities</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="housing">Housing</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recurringFrequency">Frequency</Label>
                  <Select value={newRecurring.frequency} onValueChange={(value) => setNewRecurring({ ...newRecurring, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="recurringNextDue">Next Due Date</Label>
                <Input
                  id="recurringNextDue"
                  type="date"
                  value={newRecurring.nextDue}
                  onChange={(e) => setNewRecurring({ ...newRecurring, nextDue: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recurringBank">Bank</Label>
                  <Select value={newRecurring.bank} onValueChange={(value) => setNewRecurring({ ...newRecurring, bank: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HDFC Bank">HDFC Bank</SelectItem>
                      <SelectItem value="SBI">SBI</SelectItem>
                      <SelectItem value="ICICI Bank">ICICI Bank</SelectItem>
                      <SelectItem value="Axis Bank">Axis Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recurringPaymentApp">Payment Method</Label>
                  <Select value={newRecurring.paymentApp} onValueChange={(value) => setNewRecurring({ ...newRecurring, paymentApp: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Net Banking">Net Banking</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                      <SelectItem value="Auto Debit">Auto Debit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateRecurring} className="w-full">
                Add Recurring Expense
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
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Monthly Total</div>
                <div className="text-xl font-bold">₹{totalMonthlyAmount.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-xl font-bold">{activeExpenses.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Due This Week</div>
                <div className="text-xl font-bold">{dueThisWeek.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Due This Week */}
      {dueThisWeek.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Due This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dueThisWeek.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <div className="font-medium">{expense.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Due in {getDaysUntilDue(expense.nextDue)} days • ₹{expense.amount.toLocaleString()}
                    </div>
                  </div>
                  <Button size="sm">Pay Now</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Expenses List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {recurringExpenses.map((expense) => {
          const daysUntilDue = getDaysUntilDue(expense.nextDue);
          
          return (
            <Card key={expense.id} className={expense.isActive ? '' : 'opacity-60'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{expense.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getFrequencyColor(expense.frequency)}>
                      {expense.frequency}
                    </Badge>
                    <Switch
                      checked={expense.isActive}
                      onCheckedChange={() => toggleRecurring(expense.id)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Amount and Due Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Amount</div>
                      <div className="text-xl font-bold">₹{expense.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Next Due</div>
                      <div className="font-medium">{expense.nextDue}</div>
                      <div className="text-xs text-muted-foreground">
                        {daysUntilDue > 0 ? `in ${daysUntilDue} days` : 'Overdue'}
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Bank</div>
                      <div className="font-medium">{expense.bank}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Payment Method</div>
                      <div className="font-medium">{expense.paymentApp}</div>
                    </div>
                  </div>

                  {/* Category and Last Paid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <Badge variant="outline" className="capitalize">
                        {expense.category}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Last Paid</div>
                      <div className="text-sm">{expense.lastPaid || 'Never'}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {expense.isActive ? (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="w-4 h-4 mr-1" />
                        Pause
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => deleteRecurring(expense.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Recurring;
