
import React, { useState } from 'react';
import { Calendar, Upload, Scan, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
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
  isEditing?: boolean;
  onDelete?: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onSubmit, 
  isLoading = false, 
  initialData,
  isEditing = false,
  onDelete
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
  const [attachedBill, setAttachedBill] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for potential duplicates only for new expenses
    if (!isEditing) {
      const isDuplicate = checkForDuplicate();
      if (isDuplicate && !duplicateWarning) {
        setDuplicateWarning("A similar expense was added recently. Do you want to continue?");
        return;
      }
    }
    
    const expenseData: Partial<Expense> = {
      ...formData,
      amount: parseFloat(formData.amount as string),
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      paidBy: 'You',
      isSettled: initialData?.isSettled || false,
      currency: 'INR',
    };

    onSubmit(expenseData);
    setDuplicateWarning(null);
    
    if (!isEditing) {
      // Reset form for new expense
      setFormData({
        name: '',
        amount: '',
        category: '',
        paymentApp: '',
        bank: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        isRecurring: false,
        groupId: '',
        splitBetween: [],
      });
      setAttachedBill(null);
    }
  };

  const checkForDuplicate = () => {
    // Mock duplicate detection logic
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
    setAttachedBill('bill-image.jpg'); // Mock bill attachment
    setShowBillScanner(false);
    
    toast({
      title: "Bill Scanned Successfully",
      description: "Expense details have been extracted and bill attached.",
    });
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setDuplicateWarning(null);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      toast({
        title: "Expense Deleted",
        description: "The expense has been successfully deleted.",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6 p-4 lg:p-6">
        {/* Header for editing */}
        {isEditing && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl lg:text-2xl font-bold text-foreground">Edit Expense</h2>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicateWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-orange-50 border border-orange-200 rounded-lg"
          >
            <p className="text-orange-800 text-sm">{duplicateWarning}</p>
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
          </motion.div>
        )}

        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Expense Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Lunch at restaurant"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              required
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="amount" className="text-sm font-medium">Amount *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => updateFormData('amount', e.target.value)}
              required
              className="mt-1"
            />
          </div>
        </div>

        {/* Category and Payment Method */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Category *</Label>
            <div className="mt-1">
              <CategorySelector
                value={formData.category}
                onChange={(value) => updateFormData('category', value)}
              />
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Payment Method *</Label>
            <div className="mt-1">
              <PaymentMethodSelector
                value={formData.paymentApp}
                onChange={(value) => updateFormData('paymentApp', value)}
              />
            </div>
          </div>
        </div>

        {/* Date and Bank */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
            <div className="relative mt-1">
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
            <Label htmlFor="bank" className="text-sm font-medium">Bank Account</Label>
            <Input
              id="bank"
              placeholder="Select bank account"
              value={formData.bank}
              onChange={(e) => updateFormData('bank', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Group Selection */}
        <div>
          <Label className="text-sm font-medium">Split with Group (Optional)</Label>
          <div className="mt-1">
            <GroupSelector
              value={formData.groupId}
              onChange={(value) => updateFormData('groupId', value)}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional details..."
            value={formData.notes}
            onChange={(e) => updateFormData('notes', e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Bill Scanner */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Bill Image (Optional)</Label>
          {attachedBill && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-green-800">✓ Bill attached: {attachedBill}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAttachedBill(null)}
              >
                Remove
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Dialog open={showBillScanner} onOpenChange={setShowBillScanner}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
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
            
            <Button type="button" variant="outline" className="w-full">
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
          <Label htmlFor="recurring" className="text-sm">Make this a recurring expense</Label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Expense' : 'Add Expense')}
          </Button>
          {!isEditing && (
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

export default ExpenseForm;
