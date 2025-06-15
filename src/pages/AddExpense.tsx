import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import ExpenseForm from '@/components/ExpenseForm';
import { Expense, RecurringExpense } from '@/types/expense';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService, GenericDocData } from '@/lib/appwrite';
import { Allowance } from '@/lib/allowanceService';
import banksData from '@/data/banks.json';

interface BankSuggestion {
  name: string;
  icon?: string;
}

const AddExpense = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [bankSuggestions, setBankSuggestions] = useState<BankSuggestion[]>([]);

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

          // Only use banks from allowances
          const suggestions: BankSuggestion[] = Array.from(uniqueBankNames)
            .sort()
            .map(name => {
              const bankFromFile = banksData.find(b => b.name.toLowerCase() === name.toLowerCase());
              return { name, icon: bankFromFile?.icon };
            });
          
          setBankSuggestions(suggestions);
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
        ...(expenseFormData.paymentApp && { paymentMethod: expenseFormData.paymentApp }),
        ...(expenseFormData.bank && { bank: expenseFormData.bank }),
        ...(expenseFormData.billImage && { billImage: expenseFormData.billImage }),
        isRecurring: expenseFormData.isRecurring || false,
        isRecurringInstance: false, // **FIX:** Explicitly set to false for manual entries
        ...(expenseFormData.groupId && { groupId: expenseFormData.groupId }),
        ...(expenseFormData.paidBy && { paidBy: expenseFormData.paidBy }),
        ...(expenseFormData.splitBetween && expenseFormData.splitBetween.length > 0 && { splitBetween: expenseFormData.splitBetween }),
        isSettled: expenseFormData.isSettled ?? (expenseFormData.splitBetween && expenseFormData.splitBetween.length > 0 ? false : true),
      };
      
      await databaseService.createExpense(expenseDataToSave);
      
      if (expenseFormData.isRecurring) {
        const recurringDataToSave: Omit<RecurringExpense, '$id' | '$createdAt' | '$updatedAt' | 'lastPaidDate'> = {
          userId: user.$id,
          name: expenseFormData.name!,
          amount: expenseFormData.amount!,
          category: expenseFormData.category!,
          frequency: 'monthly',
          nextDueDate: expenseFormData.date!,
          isActive: true,
          bank: expenseFormData.bank || undefined,
          paymentMethod: expenseFormData.paymentApp || undefined,
          notes: expenseFormData.notes || `Recurring template for ${expenseFormData.name}.`,
        };
        await databaseService.createRecurringExpense(recurringDataToSave);
        toast({
          title: "Recurring Template Created",
          description: `A monthly recurring template for "${expenseFormData.name}" has been created. You can edit it on the 'Recurring' page.`,
          duration: 7000,
        });
      }
      
      toast({
        title: "Expense Added",
        description: "Your expense has been successfully recorded.",
      });
      
      navigate('/'); 
    } catch (error: any) {
      console.error('Error saving expense:', error);
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
    <div className="max-w-3xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="shrink-0 h-9 w-9"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Add New Expense</h1>
          <p className="text-muted-foreground">Record a new transaction or bill split.</p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm 
            formId="add-expense-form"
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            bankSuggestions={bankSuggestions} 
          />
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6">
          <Button type="submit" form="add-expense-form" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Add Expense
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddExpense;