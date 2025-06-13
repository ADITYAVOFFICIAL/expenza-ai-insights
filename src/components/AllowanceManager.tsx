import React, { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Allowance, AllowanceData } from '@/lib/allowanceService';
import { format, parseISO } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils'; // Import cn utility

interface AllowanceManagerProps {
  allowances: Allowance[];
  onAdd: (data: AllowanceData) => Promise<void>;
  onEdit: (id: string, data: Partial<AllowanceData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const initialAllowanceState: AllowanceData = {
  bankName: '',
  amount: 0,
  frequency: 'monthly',
  nextReceived: format(new Date(), 'yyyy-MM-dd'),
  isActive: true,
};

const bankOptions = ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Other'];

const AllowanceManager: React.FC<AllowanceManagerProps> = ({
  allowances,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<AllowanceData>(initialAllowanceState);
  const [currentAllowanceId, setCurrentAllowanceId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleOpenDialog = (allowance?: Allowance) => {
    if (allowance) {
      setIsEditing(true);
      setCurrentAllowanceId(allowance.$id);
      setCurrentAllowance({
        bankName: allowance.bankName,
        amount: allowance.amount,
        frequency: allowance.frequency,
        nextReceived: allowance.nextReceived ? format(parseISO(allowance.nextReceived), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        isActive: allowance.isActive,
      });
    } else {
      setIsEditing(false);
      setCurrentAllowanceId(null);
      setCurrentAllowance(initialAllowanceState);
    }
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setTimeout(() => {
        setIsEditing(false);
        setCurrentAllowanceId(null);
        setCurrentAllowance(initialAllowanceState);
    }, 300);
  }

  const handleSubmit = async () => {
    if (currentAllowance.amount <= 0) {
        toast({ title: "Invalid Amount", description: "Amount must be greater than zero.", variant: "destructive"});
        return;
    }
    if (!currentAllowance.bankName) {
        toast({ title: "Bank Name Required", description: "Please select or enter a bank name.", variant: "destructive"});
        return;
    }
    setProcessing(true);
    try {
      if (isEditing && currentAllowanceId) {
        await onEdit(currentAllowanceId, currentAllowance);
      } else {
        await onAdd(currentAllowance);
      }
      handleDialogClose();
    } catch (error) {
      console.error("Failed to save allowance", error);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this allowance?")) {
      setProcessing(true);
      try {
        await onDelete(id);
      } finally {
        setProcessing(false);
      }
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'monthly': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'yearly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Allowances
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {allowances.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            No allowances set up yet.
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {allowances.map((allowance) => (
              <Card key={allowance.$id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{allowance.bankName}</h4>
                      <Badge className={cn("text-xs", getFrequencyColor(allowance.frequency))}>
                        {allowance.frequency.charAt(0).toUpperCase() + allowance.frequency.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Amount: <span className="font-medium text-foreground">₹{allowance.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Next: <span className="font-medium text-foreground">{format(parseISO(allowance.nextReceived), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <Badge variant={allowance.isActive ? "default" : "secondary"} className={cn("text-xs mb-1", allowance.isActive ? "bg-success text-success-foreground" : "")}>
                        {allowance.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenDialog(allowance)} disabled={processing}>
                            <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => handleDelete(allowance.$id)}
                            disabled={processing}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { if (processing) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'Add New'} Allowance</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bankName" className="text-right">Bank</Label>
              <Select
                value={currentAllowance.bankName}
                onValueChange={(value) => setCurrentAllowance({ ...currentAllowance, bankName: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Bank" />
                </SelectTrigger>
                <SelectContent>
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={currentAllowance.amount}
                onChange={(e) => setCurrentAllowance({ ...currentAllowance, amount: parseFloat(e.target.value) || 0 })}
                placeholder="5000"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">Frequency</Label>
              <Select
                value={currentAllowance.frequency}
                onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setCurrentAllowance({ ...currentAllowance, frequency: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextReceived" className="text-right">Next Date</Label>
              <Input
                id="nextReceived"
                type="date"
                value={currentAllowance.nextReceived}
                onChange={(e) => setCurrentAllowance({ ...currentAllowance, nextReceived: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isActive" className="text-right">Status</Label>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentAllowance(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className="col-span-3 flex items-center justify-start gap-2"
                >
                    {currentAllowance.isActive ? <ToggleRight className="text-success" /> : <ToggleLeft />}
                    {currentAllowance.isActive ? 'Active' : 'Inactive'}
                </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" disabled={processing}>Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit} disabled={processing}>
              {processing ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Allowance')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AllowanceManager;
