// src/components/ExpenseForm.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Upload, Scan, Trash2, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import CategorySelector from './CategorySelector';
import PaymentMethodSelector from './PaymentMethodSelector';
import GroupSelector from './GroupSelector';
import { Expense } from '@/types/expense';
import { toast } from '@/hooks/use-toast';
import { storageService } from '@/lib/appwrite';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import { scanBillWithGemini } from '@/lib/gemini';

// --- FIX: Import missing data files ---
import categoriesData from '@/data/categories.json';
import paymentAppsData from '@/data/paymentApps.json';

interface BankSuggestion {
  name: string;
  icon?: string;
}

interface ExpenseFormProps {
  onSubmit: (expense: Partial<Expense>) => void;
  isLoading?: boolean;
  initialData?: Partial<Expense>;
  isEditing?: boolean;
  onDelete?: (expenseId: string) => void;
  bankSuggestions?: BankSuggestion[];
  formId?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  onSubmit, 
  isLoading = false, 
  initialData,
  isEditing = false,
  onDelete,
  bankSuggestions = [],
  formId
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    paymentApp: '',
    bank: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    groupId: '',
    splitBetween: [] as string[],
    paidBy: user?.name || 'You',
    billImage: null as string | null,
    currency: 'INR',
  });

  const [isScanning, setIsScanning] = useState(false);
  const scanBillInputRef = useRef<HTMLInputElement>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [billFileToUpload, setBillFileToUpload] = useState<File | null>(null);
  const manualBillUploadRef = useRef<HTMLInputElement>(null);
  const [bankPopoverOpen, setBankPopoverOpen] = React.useState(false);

  const internalHandleDelete = () => {
    if (onDelete && initialData?.$id) {
      if (window.confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
        onDelete(initialData.$id);
      }
    }
  };

  useEffect(() => {
    if (initialData) {
      let dateToSet = new Date().toISOString().split('T')[0];
      if (initialData.date) {
        const parsedDate = parseISO(initialData.date);
        if (isValid(parsedDate)) {
          dateToSet = format(parsedDate, 'yyyy-MM-dd');
        } else {
          console.warn(`Invalid date string received in initialData.date: ${initialData.date}`);
        }
      }
      setFormData({
        name: initialData.name || '',
        amount: initialData.amount?.toString() || '',
        category: initialData.category || '',
        paymentApp: initialData.paymentMethod || (initialData as any).paymentApp || '', 
        bank: initialData.bank || '',
        date: dateToSet,
        notes: initialData.notes || '',
        isRecurring: initialData.isRecurring || false,
        groupId: initialData.groupId || '',
        splitBetween: initialData.splitBetween || [],
        paidBy: initialData.paidBy || user?.name || 'You',
        billImage: initialData.billImage || null,
        currency: initialData.currency || 'INR',
      });
      if (initialData.billImage) {
        setBillFileToUpload(null);
      }
    }
  }, [initialData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let billImageValueForSubmit: string | null = formData.billImage;

    if (billFileToUpload) {
      try {
        const uploadedFile = await storageService.uploadFile(billFileToUpload);
        billImageValueForSubmit = uploadedFile.$id;
        toast({ title: "Bill Image Uploaded", description: "Receipt image saved." });
      } catch (error) {
        console.error("Error uploading bill image:", error);
        toast({ title: "Bill Upload Failed", description: "Could not upload bill image.", variant: "destructive" });
        return;
      }
    }

    const expenseData: Partial<Expense> = {
      name: formData.name,
      amount: parseFloat(formData.amount as string),
      category: formData.category,
      paymentMethod: formData.paymentApp || undefined,
      bank: formData.bank || undefined,
      date: formData.date,
      notes: formData.notes || undefined,
      isRecurring: formData.isRecurring,
      groupId: formData.groupId || undefined,
      splitBetween: formData.splitBetween,
      paidBy: formData.paidBy,
      isSettled: initialData?.isSettled ?? (formData.splitBetween && formData.splitBetween.length > 0 ? false : true),
      currency: formData.currency, 
      billImage: billImageValueForSubmit,
    };
    
    if (isEditing && initialData?.$id) {
      onSubmit({ ...expenseData, $id: initialData.$id });
    } else {
      onSubmit(expenseData);
    }

    setDuplicateWarning(null);
    
    if (!isEditing) {
      setFormData({
        name: '', amount: '', category: '', paymentApp: '', bank: '',
        date: new Date().toISOString().split('T')[0],
        notes: '', isRecurring: false, groupId: '', splitBetween: [],
        paidBy: user?.name || 'You', billImage: null, currency: 'INR',
      });
      setBillFileToUpload(null);
      if(manualBillUploadRef.current) manualBillUploadRef.current.value = "";
    }
  };

  const handleBillFileSelectedForScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast({ title: "Scanning Bill...", description: "The AI is analyzing your receipt. Please wait." });

    try {
      const scannedData = await scanBillWithGemini(file);
      
      const suggestedCategory = categoriesData.find(c => c.name === scannedData.category);
      const suggestedPaymentApp = paymentAppsData.find(app => app.name.toLowerCase() === scannedData.paymentApp?.toLowerCase());

      setFormData(prev => ({
        ...prev,
        name: scannedData.name || prev.name,
        amount: scannedData.amount?.toString() || prev.amount,
        date: scannedData.date || prev.date,
        category: suggestedCategory?.id || prev.category,
        paymentApp: suggestedPaymentApp?.id || prev.paymentApp,
        bank: scannedData.bankName || prev.bank,
      }));

      setBillFileToUpload(file);
      toast({ title: "Scan Complete!", description: "Please review the extracted details." });

    } catch (error: any) {
      toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsScanning(false);
      if (event.target) event.target.value = "";
    }
  };
  
  const updateFormData = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setDuplicateWarning(null);
  };
  
  const handleManualBillUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Please select an image smaller than 10MB", variant: "destructive" });
        return;
      }
      setBillFileToUpload(file);
      setFormData(prev => ({ ...prev, billImage: null }));
      toast({ title: "Bill Selected", description: `${file.name} will be uploaded on submit.` });
    }
  };
  
  const removeBill = () => {
    setBillFileToUpload(null);
    setFormData(prev => ({ ...prev, billImage: null }));
    if(manualBillUploadRef.current) manualBillUploadRef.current.value = "";
  };

  const selectedBankData = bankSuggestions.find(b => b.name === formData.bank);

  return (
    <div className="space-y-4 lg:space-y-6">
      <form id={formId || "expense-form"} onSubmit={handleSubmit} className="space-y-4">
        {isEditing && initialData?.$id && onDelete && (
          <div className="flex items-center justify-end mb-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={internalHandleDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        )}

        {duplicateWarning && (
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg">
            <p className="text-orange-800 dark:text-orange-300 text-sm">{duplicateWarning}</p>
            <div className="flex gap-2 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDuplicateWarning(null)}>Cancel</Button>
              <Button type="submit" size="sm" variant="default">Add Anyway</Button>
            </div>
          </div>
        )}

        {/* Expense Name and Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Expense Name *</Label>
            <Input id="name" placeholder="e.g., Lunch at restaurant" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="amount" className="text-sm font-medium">Amount ({formData.currency || 'INR'}) *</Label>
            <Input id="amount" type="number" step="0.01" placeholder="0.00" value={formData.amount} onChange={(e) => updateFormData('amount', e.target.value)} required className="mt-1" />
          </div>
        </div>

        {/* Category and Payment Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Category *</Label>
            <div className="mt-1">
              <CategorySelector value={formData.category} onChange={(value) => updateFormData('category', value)} />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Payment Method</Label>
            <div className="mt-1">
              <PaymentMethodSelector value={formData.paymentApp} onChange={(value) => updateFormData('paymentApp', value)} />
            </div>
          </div>
        </div>

        {/* Date and Bank Account */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
            <div className="relative mt-1">
              <Input id="date" type="date" value={formData.date} onChange={(e) => updateFormData('date', e.target.value)} required />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <Label htmlFor="bank" className="text-sm font-medium">Bank Account</Label>
            <Popover open={bankPopoverOpen} onOpenChange={setBankPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={bankPopoverOpen} className="w-full justify-between mt-1 font-normal h-10">
                  <div className="flex items-center gap-2 truncate">
                    {selectedBankData?.icon && (<img src={selectedBankData.icon} alt={selectedBankData.name} className="w-4 h-4 object-contain flex-shrink-0" />)}
                    <span className="truncate">{formData.bank || "Select or type bank..."}</span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search bank or type new..." value={formData.bank} onValueChange={(searchValue) => updateFormData('bank', searchValue)} />
                  <CommandList className="max-h-[250px] overflow-y-auto">
                    <CommandEmpty>{formData.bank ? `Add "${formData.bank}" as new bank` : "No bank found. Type to add."}</CommandEmpty>
                    <CommandGroup>
                      {bankSuggestions.map((suggestion) => (
                        <CommandItem key={suggestion.name} value={suggestion.name} onSelect={(currentValue) => { updateFormData('bank', currentValue); setBankPopoverOpen(false); }}>
                          <Check className={cn("mr-2 h-4 w-4", formData.bank === suggestion.name ? "opacity-100" : "opacity-0")} />
                          {suggestion.icon && (<img src={suggestion.icon} alt={suggestion.name} className="w-4 h-4 object-contain mr-2" />)}
                          {suggestion.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Split with Group (Optional)</Label>
          <div className="mt-1">
            <GroupSelector value={formData.groupId} onChange={(value) => updateFormData('groupId', value)} />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
          <Textarea id="notes" placeholder="Add any additional details..." value={formData.notes} onChange={(e) => updateFormData('notes', e.target.value)} rows={3} className="mt-1" />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Bill Image (Optional)</Label>
          {(formData.billImage || billFileToUpload) && (
            <div className="p-3 bg-muted/30 border rounded-lg flex items-center justify-between">
              <span className="text-sm text-foreground truncate max-w-[calc(100%-5rem)]">
                {billFileToUpload ? billFileToUpload.name : (formData.billImage ? 'Uploaded bill' : '')}
              </span>
              <Button type="button" variant="ghost" size="sm" onClick={removeBill}>Remove</Button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button type="button" variant="outline" className="w-full" onClick={() => scanBillInputRef.current?.click()} disabled={isScanning}>
              <Scan className="w-4 h-4 mr-2" />
              {isScanning ? 'Scanning...' : 'Scan with AI'}
            </Button>
            <input ref={scanBillInputRef} type="file" accept="image/*" className="hidden" onChange={handleBillFileSelectedForScan} />
            <Button type="button" variant="outline" className="w-full asChild">
              <Label htmlFor="manual-bill-upload" className="cursor-pointer flex items-center justify-center w-full h-full m-0">
                <Upload className="w-4 h-4 mr-2" />
                Upload Manually
              </Label>
            </Button>
            <input id="manual-bill-upload" ref={manualBillUploadRef} type="file" accept="image/*" className="hidden" onChange={handleManualBillUpload} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;