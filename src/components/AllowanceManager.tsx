import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign, ToggleLeft, ToggleRight, AlertCircle, ChevronsUpDown, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Allowance, AllowanceData } from '@/lib/allowanceService';
import { format, parseISO, isValid } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import banksData from '@/data/banks.json';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandList, CommandGroup, CommandItem } from '@/components/ui/command';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile

interface BankOption {
  name: string;
  icon?: string;
}

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
  const [amountInput, setAmountInput] = useState<string>('');
  const [bankPopoverOpen, setBankPopoverOpen] = useState(false);
  const isMobile = useIsMobile(); // Use the hook

  const bankOptions: BankOption[] = banksData.map(b => ({ name: b.name, icon: b.icon }));
  const selectedBankForDisplay = bankOptions.find(bank => bank.name === currentAllowance.bankName);


  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmountInput(value);
    const parsedAmount = parseFloat(value);
    if (!isNaN(parsedAmount)) {
      setCurrentAllowance(prev => ({ ...prev, amount: parsedAmount }));
    } else if (value === '') {
      setCurrentAllowance(prev => ({ ...prev, amount: 0 }));
    }
  };

  const handleOpenDialog = (allowance?: Allowance) => {
    if (allowance) {
      setIsEditing(true);
      setCurrentAllowanceId(allowance.$id);
      const nextReceivedDate = allowance.nextReceived && isValid(parseISO(allowance.nextReceived))
        ? format(parseISO(allowance.nextReceived), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd');
      const allowanceData = {
        bankName: allowance.bankName || '',
        amount: allowance.amount || 0,
        frequency: allowance.frequency || 'monthly',
        nextReceived: nextReceivedDate,
        isActive: allowance.isActive === undefined ? true : allowance.isActive,
      };
      setCurrentAllowance(allowanceData);
      setAmountInput((allowance.amount || 0).toString());
    } else {
      setIsEditing(false);
      setCurrentAllowanceId(null);
      setCurrentAllowance(initialAllowanceState);
      setAmountInput(initialAllowanceState.amount.toString());
    }
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setBankPopoverOpen(false);
    setTimeout(() => {
        setIsEditing(false);
        setCurrentAllowanceId(null);
        setCurrentAllowance(initialAllowanceState);
        setAmountInput(initialAllowanceState.amount.toString());
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
      const dataToSubmit = { ...currentAllowance };
      if (isEditing && currentAllowanceId) {
        await onEdit(currentAllowanceId, dataToSubmit);
      } else {
        await onAdd(dataToSubmit);
      }
      handleDialogClose();
    } catch (error) {
      console.error("Failed to save allowance", error);
      toast({ title: "Error", description: `Could not ${isEditing ? 'update' : 'add'} allowance.`, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this allowance?")) {
      setProcessing(true);
      try {
        await onDelete(id);
        toast({ title: "Allowance Deleted", description: "Allowance has been successfully deleted." });
      } catch (error) {
        console.error("Failed to delete allowance", error);
        toast({ title: "Error", description: "Could not delete the allowance.", variant: "destructive" });
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Allowance Manager
        </CardTitle>
        <Button size="sm" onClick={() => handleOpenDialog()} disabled={processing}>
          <Plus className="w-4 h-4 mr-2" />
          {isMobile ? 'Add' : 'Add New'}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {allowances.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 flex flex-col items-center justify-center h-full">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p>No allowances set up yet.</p>
            <p className="text-xs">Click "Add New" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allowances.map((allowance) => {
              const bankDetails = bankOptions.find(b => b.name === allowance.bankName);
              const nextReceivedDate = allowance.nextReceived && isValid(parseISO(allowance.nextReceived))
                ? parseISO(allowance.nextReceived)
                : null;

              return (
                <Card key={allowance.$id} className="p-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5 flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        {bankDetails?.icon && <img src={bankDetails.icon} alt={bankDetails.name} className="w-5 h-5 object-contain rounded-sm" />}
                        <span className="font-medium truncate text-sm">{allowance.bankName || 'N/A'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        ₹{allowance.amount.toLocaleString()} / {allowance.frequency}
                      </div>
                      {nextReceivedDate && (
                        <div className="text-xs text-muted-foreground">
                          Next: {format(nextReceivedDate, 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <Badge variant={allowance.isActive ? "default" : "secondary"} className={cn("text-xs mb-1 shrink-0", allowance.isActive ? "bg-success text-success-foreground hover:bg-success/90" : "bg-muted text-muted-foreground")}>
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
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={(open) => { if (!processing) { setShowDialog(open); if(!open) handleDialogClose(); } }}>
        <DialogContent className="sm:max-w-[450px] text-foreground" onInteractOutside={(e) => { if (processing) e.preventDefault(); }}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'Add New'} Allowance</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-foreground">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bankName" className="text-right">Bank</Label>
              <Popover open={bankPopoverOpen} onOpenChange={setBankPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={bankPopoverOpen}
                    className="col-span-3 justify-between font-normal h-10"
                  >
                    <div className="flex items-center gap-2 truncate">
                      {selectedBankForDisplay?.icon && (
                        <img src={selectedBankForDisplay.icon} alt={selectedBankForDisplay.name} className="w-4 h-4 object-contain flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {currentAllowance.bankName || "Select or type bank..."}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput 
                      placeholder="Search bank or type new..."
                      value={currentAllowance.bankName}
                      onValueChange={(searchValue) => setCurrentAllowance({ ...currentAllowance, bankName: searchValue })}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {currentAllowance.bankName ? `Add "${currentAllowance.bankName}" as new bank` : "No bank found. Type to add."}
                      </CommandEmpty>
                      <CommandGroup>
                        {bankOptions.map((bank) => (
                          <CommandItem
                            key={bank.name}
                            value={bank.name}
                            onSelect={(currentValue) => {
                              setCurrentAllowance({ ...currentAllowance, bankName: currentValue });
                              setBankPopoverOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                currentAllowance.bankName === bank.name ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {bank.icon && (
                              <img src={bank.icon} alt={bank.name} className="w-4 h-4 object-contain mr-2" />
                            )}
                            {bank.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amountInput}
                onChange={handleAmountInputChange}
                placeholder="e.g., 5000"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">Frequency</Label>
              <Select
                value={currentAllowance.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setCurrentAllowance({ ...currentAllowance, frequency: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
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
                    className="col-span-3 flex items-center justify-start gap-2 h-10"
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