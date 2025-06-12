
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import ExpenseForm from '@/components/ExpenseForm';
import { Expense } from '@/types/expense';

const AddExpense = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (expenseData: Partial<Expense>) => {
    setIsLoading(true);
    try {
      // For now, we'll simulate saving the expense
      // In a real app, this would save to a database
      console.log('Saving expense:', expenseData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Expense Added",
        description: "Your expense has been successfully recorded.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Expense</h1>
          <p className="text-muted-foreground">Record a new expense or split</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
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
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Split Bill</h3>
              <p className="text-sm text-muted-foreground">Share with friends</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">Recurring</h3>
              <p className="text-sm text-muted-foreground">Set up auto-expense</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AddExpense;
