
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Upload, Save, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    bank: '',
    paymentApp: '',
    notes: '',
    date: new Date(),
  });
  const [billFile, setBillFile] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel',
    'Groceries', 'Gas', 'Rent', 'Insurance', 'Other'
  ];

  const banks = [
    'HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank',
    'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
    'Yes Bank', 'IDFC First Bank', 'IndusInd Bank', 'Cash'
  ];

  const paymentApps = [
    'Google Pay', 'PhonePe', 'Paytm', 'Amazon Pay', 'BHIM UPI',
    'MobiKwik', 'Freecharge', 'JioMoney', 'Airtel Money', 'Credit Card',
    'Debit Card', 'Net Banking', 'Cash'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBillFile(file);
      toast({
        title: "File uploaded",
        description: `${file.name} has been attached successfully.`,
      });
    }
  };

  const checkDuplicate = (newExpense) => {
    const savedExpenses = localStorage.getItem('expenza-expenses');
    if (!savedExpenses) return false;
    
    const expenses = JSON.parse(savedExpenses);
    return expenses.some(expense => 
      expense.name.toLowerCase() === newExpense.name.toLowerCase() &&
      expense.amount === newExpense.amount &&
      expense.category === newExpense.category &&
      Math.abs(new Date(expense.date) - new Date(newExpense.date)) < 24 * 60 * 60 * 1000 // Same day
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.category) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const newExpense = {
      id: Date.now(),
      ...formData,
      date: formData.date.toISOString(),
      billFile: billFile ? billFile.name : null,
    };

    // Check for duplicates
    const isDuplicate = checkDuplicate(newExpense);
    
    if (isDuplicate) {
      const confirmAdd = window.confirm(
        `A similar expense "${formData.name}" for ₹${formData.amount} already exists. Do you still want to add this expense?`
      );
      
      if (!confirmAdd) {
        return;
      }
    }

    // Save to localStorage
    const savedExpenses = localStorage.getItem('expenza-expenses');
    const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
    expenses.push(newExpense);
    localStorage.setItem('expenza-expenses', JSON.stringify(expenses));

    toast({
      title: "Expense added",
      description: `₹${formData.amount} expense for ${formData.name} has been recorded.`,
    });

    // Reset form
    setFormData({
      name: '',
      amount: '',
      category: '',
      bank: '',
      paymentApp: '',
      notes: '',
      date: new Date(),
    });
    setBillFile(null);
    
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Add Expense</h1>
          <p className="text-slate-600">Record a new expense to track your spending</p>
        </div>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-slate-800">Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 font-medium">Expense Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Lunch at Restaurant"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="rounded-xl border-slate-300"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-slate-700 font-medium">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className="rounded-xl border-slate-300"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="rounded-xl border-slate-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal rounded-xl border-slate-300",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => handleInputChange('date', date)}
                      initialFocus
                      className="rounded-xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Bank/Source</Label>
                <Select value={formData.bank} onValueChange={(value) => handleInputChange('bank', value)}>
                  <SelectTrigger className="rounded-xl border-slate-300">
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Payment Method</Label>
                <Select value={formData.paymentApp} onValueChange={(value) => handleInputChange('paymentApp', value)}>
                  <SelectTrigger className="rounded-xl border-slate-300">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentApps.map((app) => (
                      <SelectItem key={app} value={app}>{app}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bill" className="text-slate-700 font-medium">Attach Bill/Receipt</Label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <input
                  id="bill"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => document.getElementById('bill').click()}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {billFile ? billFile.name : 'Upload bill or receipt'}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-slate-700 font-medium">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="rounded-xl border-slate-300"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Expense
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;
