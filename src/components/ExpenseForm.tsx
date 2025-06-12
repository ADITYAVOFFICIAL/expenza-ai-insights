
import React, { useState } from 'react';
import { Calendar, Upload, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CategorySelector from './CategorySelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import GroupSelector from './GroupSelector';
import BillScanner from './BillScanner';
import { Expense } from '@/types/expense';
import { toast } from '@/hooks/use-toast';

interface ExpenseFormProps {
  onSubmit: (expense: Partial<Expense>) => void;
  isLoading?: boolean;
  initialData?: Partial<Expense>;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onSubmit, 
  isLoading = false, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    amount: initialData?.amount || '',
    category: initialData?.category || '',
    paymentApp: initialData?.paymentApp || '',
    bank: initialData?.bank || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    notes: initialData?.notes || '',
    isRecurring: initialData?.isRecurring || false,
    groupId: initialData?.groupId || '',
    splitBetween: initialData?.splitBetween || [],
  });

  const [showBillScanner, setShowBillScanner] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for potential duplicates
    const isDuplicate = checkForDuplicate();
    if (isDuplicate && !duplicateWarning) {
      setDuplicateWarning("A similar expense was added recently. Do you want to continue?");
      return;
    }
    
    const expenseData: Partial<Expense> = {
      ...formData,
      amount: parseFloat(formData.amount as string),
      id: Math.random().toString(36).substr(2, 9),
      paidBy: 'You',
      isSettled: false,
      currency: 'INR',
    };

    onSubmit(expenseData);
    setDuplicateWarning(null);
  };

  const checkForDuplicate = () => {
    // Mock duplicate detection logic
    // In real app, this would check against existing expenses
    return formData.name.toLowerCase().includes('lunch') && formData.amount === '450';
  };

  const handleBillScan = (scannedData: any) => {
    setFormData(prev => ({
      ...prev,
      name: scannedData.vendor || prev.name,
      amount: scannedData.amount?.toString() || prev.amount,
      date: scannedData.date || prev.date,
      category: scannedData.category || prev.category,
    }));
    setShowBillScanner(false);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setDuplicateWarning(null); // Clear duplicate warning when form changes
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Duplicate Warning */}
      {duplicateWarning && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-orange-800">{duplicateWarning}</p>
          <div className="flex gap-2 mt-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setDuplicateWarning(null)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm"
              variant="default"
            >
              Add Anyway
            </Button>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Expense Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Lunch at restaurant"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => updateFormData('amount', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Category and Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Category *</Label>
          <CategorySelector
            value={formData.category}
            onChange={(value) => updateFormData('category', value)}
          />
        </div>
        
        <div>
          <Label>Payment Method *</Label>
          <PaymentMethodSelector
            value={formData.paymentApp}
            onChange={(value) => updateFormData('paymentApp', value)}
          />
        </div>
      </div>

      {/* Date and Bank */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date *</Label>
          <div className="relative">
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => updateFormData('date', e.target.value)}
              required
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        
        <div>
          <Label htmlFor="bank">Bank Account</Label>
          <Input
            id="bank"
            placeholder="Select bank account"
            value={formData.bank}
            onChange={(e) => updateFormData('bank', e.target.value)}
          />
        </div>
      </div>

      {/* Group Selection */}
      <div>
        <Label>Split with Group (Optional)</Label>
        <GroupSelector
          value={formData.groupId}
          onChange={(value) => updateFormData('groupId', value)}
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional details..."
          value={formData.notes}
          onChange={(e) => updateFormData('notes', e.target.value)}
          rows={3}
        />
      </div>

      {/* Bill Scanner */}
      <div className="space-y-4">
        <Label>Bill Image (Optional)</Label>
        <div className="flex gap-2">
          <Dialog open={showBillScanner} onOpenChange={setShowBillScanner}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" className="flex-1">
                <Scan className="w-4 h-4 mr-2" />
                Scan Bill (OCR)
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <BillScanner 
                onScanComplete={handleBillScan}
                onClose={() => setShowBillScanner(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Button type="button" variant="outline" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            Upload Manually
          </Button>
        </div>
      </div>

      {/* Recurring Option */}
      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={formData.isRecurring}
          onCheckedChange={(checked) => updateFormData('isRecurring', checked)}
        />
        <Label htmlFor="recurring">Make this a recurring expense</Label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? 'Adding...' : 'Add Expense'}
        </Button>
        <Button type="button" variant="outline">
          Save as Draft
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
