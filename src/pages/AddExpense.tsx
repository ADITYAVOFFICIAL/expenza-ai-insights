import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import ExpenseForm from '@/components/ExpenseForm';
import { Expense } from '@/types/expense';
import { RecurringExpense } from '@/types/expense'; // Import RecurringExpense type
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, GenericDocData } from '@/lib/appwrite';
import { Allowance } from '@/lib/allowanceService';
import banksData from '@/data/banks.json'; // Import the new bank data

interface BankSuggestion {
  name: string;
  icon?: string;
}

const AddExpense = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [bankSuggestions, setBankSuggestions] = useState<BankSuggestion[]>([]); // Use this instead

  useEffect(() => {
    const fetchBankSuggestionsFromAllowances = async () => {
      if (user?.$id) {
        try {
          const allowancesRes = await databaseService.getAllowances(user.$id);
          const allowancesDocs = (allowancesRes.documents as unknown as Allowance[]);
          
          const uniqueBankNames = new Set<string>();
          allowancesDocs.forEach(allowance => {
            if (allowance.bankName) {
              uniqueBankNames.add(allowance.bankName);
            }
          });

          const suggestions: BankSuggestion[] = Array.from(uniqueBankNames).sort().map(name => {
            const bankFromFile = banksData.find(b => b.name.toLowerCase() === name.toLowerCase());
            return { name, icon: bankFromFile?.icon };
          });
          
          setBankSuggestions(suggestions); // Suggestions will now only contain banks from allowances
        } catch (error) {
          console.error("Error fetching bank suggestions:", error);
          toast({
            title: "Error",
            description: "Could not load bank suggestions.",
            variant: "destructive",
          });
        }
      }
    };
    fetchBankSuggestionsFromAllowances();
  }, [user]);

  const handleSubmit = async (expenseFormData: Partial<Expense>) => {
    setIsLoading(true);
    if (!user || !user.$id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to add an expense.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const expenseDataToSave: GenericDocData = {
        userId: user.$id,
        name: expenseFormData.name!,
        amount: expenseFormData.amount!,
        date: expenseFormData.date!,
        category: expenseFormData.category!,
        currency: expenseFormData.currency || 'INR',
        ...(expenseFormData.notes && { notes: expenseFormData.notes }),
        ...(expenseFormData.paymentApp && { paymentMethod: expenseFormData.paymentApp }), // paymentApp from form is paymentMethod in DB
        ...(expenseFormData.bank && { bank: expenseFormData.bank }),
        ...(expenseFormData.billImage && { billImage: expenseFormData.billImage }),
        isRecurring: expenseFormData.isRecurring || false, // This flag remains on the individual expense
        ...(expenseFormData.groupId && { groupId: expenseFormData.groupId }),
        ...(expenseFormData.paidBy && { paidBy: expenseFormData.paidBy }),
        ...(expenseFormData.splitBetween && expenseFormData.splitBetween.length > 0 && { splitBetween: expenseFormData.splitBetween }),
        isSettled: expenseFormData.isSettled || false,
      };
      
      // 1. Create the individual expense instance
      await databaseService.createExpense(expenseDataToSave);
      
      // 2. If marked as recurring, also create a recurring expense template
      if (expenseFormData.isRecurring) {
        const recurringDataToSave: Omit<RecurringExpense, '$id' | '$createdAt' | '$updatedAt' | 'lastPaidDate'> = {
          userId: user.$id,
          name: expenseFormData.name!,
          amount: expenseFormData.amount!,
          category: expenseFormData.category!,
          frequency: 'monthly', // Defaulting to 'monthly'
          nextDueDate: expenseFormData.date!, // Use the expense date as the first due date
          isActive: true,
          bank: expenseFormData.bank || undefined,
          paymentMethod: expenseFormData.paymentApp || undefined, // Use paymentApp from form for paymentMethod
          notes: expenseFormData.notes || `Recurring template created from expense on ${expenseFormData.date}. Default frequency: monthly.`,
        };
        await databaseService.createRecurringExpense(recurringDataToSave);
        toast({
          title: "Recurring Template Created",
          description: `A monthly recurring template for "${expenseFormData.name}" has been created. You can edit its frequency and other details on the 'Recurring Expenses' page.`,
          duration: 8000, // Longer duration for this specific toast
        });
      }
      
      toast({
        title: "Expense Added",
        description: "Your expense has been successfully recorded.",
      });
      
      navigate('/'); 
    } catch (error: any) {
      console.error('Error saving expense and/or recurring template:', error);
      toast({
        title: "Error Processing Expense",
        description: error.message || "Failed to process expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)} // Go back to the previous page
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add New Expense</h1>
          <p className="text-muted-foreground">Record a new transaction or bill split.</p>
        </div>
      </div>

      {/* Quick Actions (Optional - can be removed or adapted) */}
      {/* 
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Quick Add</h3>
              <p className="text-sm text-muted-foreground">Simple expense</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Users className="w-5 h-5" /> 
            </div>
            <div>
              <h3 className="font-medium">Split Bill</h3>
              <p className="text-sm text-muted-foreground">Share with friends</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Recurring</h3>
              <p className="text-sm text-muted-foreground">Set up auto-expense</p>
            </div>
          </div>
        </Card>
      </div>
      */}

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            bankSuggestions={bankSuggestions} // Pass the new prop
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpense;
