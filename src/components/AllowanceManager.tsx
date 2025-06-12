
import React, { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Allowance } from '@/lib/allowanceService';

interface AllowanceManagerProps {
  allowances: Allowance[];
  onAdd: (allowance: Omit<Allowance, 'id' | 'createdAt'>) => void;
  onEdit: (id: string, allowance: Partial<Allowance>) => void;
  onDelete: (id: string) => void;
}

const AllowanceManager: React.FC<AllowanceManagerProps> = ({
  allowances,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [newAllowance, setNewAllowance] = useState({
    bankName: '',
    amount: '',
    frequency: 'monthly' as const,
    nextReceived: '',
    isActive: true
  });

  const bankOptions = [
    'HDFC Bank',
    'SBI',
    'ICICI Bank',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank',
    'Bank of Baroda',
    'Canara Bank'
  ];

  const handleAdd = () => {
    if (newAllowance.bankName && newAllowance.amount && newAllowance.nextReceived) {
      onAdd({
        bankName: newAllowance.bankName,
        amount: parseFloat(newAllowance.amount),
        frequency: newAllowance.frequency,
        nextReceived: newAllowance.nextReceived,
        isActive: true,
        userId: '', // Will be set by parent component
      });
      setNewAllowance({
        bankName: '',
        amount: '',
        frequency: 'monthly',
        nextReceived: '',
        isActive: true
      });
      setShowDialog(false);
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'bg-green-100 text-green-800';
      case 'monthly': return 'bg-blue-100 text-blue-800';
      case 'yearly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMonthlyAllowance = allowances
    .filter(a => a.isActive && a.frequency === 'monthly')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Monthly Allowance</div>
              <div className="text-xl font-bold">₹{totalMonthlyAllowance.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Allowances</h3>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Allowance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Allowance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Select 
                  value={newAllowance.bankName} 
                  onValueChange={(value) => setNewAllowance({ ...newAllowance, bankName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankOptions.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newAllowance.amount}
                  onChange={(e) => setNewAllowance({ ...newAllowance, amount: e.target.value })}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={newAllowance.frequency} 
                  onValueChange={(value: any) => setNewAllowance({ ...newAllowance, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nextReceived">Next Received Date</Label>
                <Input
                  id="nextReceived"
                  type="date"
                  value={newAllowance.nextReceived}
                  onChange={(e) => setNewAllowance({ ...newAllowance, nextReceived: e.target.value })}
                />
              </div>
              <Button onClick={handleAdd} className="w-full">
                Add Allowance
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Allowances List */}
      <div className="space-y-3">
        {allowances.map((allowance) => (
          <Card key={allowance.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{allowance.bankName}</h4>
                    <Badge className={getFrequencyColor(allowance.frequency)}>
                      {allowance.frequency}
                    </Badge>
                    {!allowance.isActive && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-medium">₹{allowance.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next: </span>
                      <span className="font-medium">{allowance.nextReceived}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-600"
                    onClick={() => onDelete(allowance.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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

export default AllowanceManager;
