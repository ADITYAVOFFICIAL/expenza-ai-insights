
import React from 'react';
import { Calendar, User, Tag, Banknote } from 'lucide-react';
import { Expense } from '@/types/expense';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expenseId: string) => void;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: expense.currency || 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="expense-card group cursor-pointer" onClick={() => onEdit?.(expense)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-foreground truncate">{expense.name}</h3>
            {expense.isRecurring && (
              <Badge variant="secondary" className="text-xs">
                Recurring
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(expense.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span className="capitalize">{expense.category}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{expense.paidBy}</span>
            </div>
            <div className="flex items-center gap-1">
              <Banknote className="w-4 h-4" />
              <span>{expense.paymentApp}</span>
            </div>
          </div>

          {expense.notes && (
            <p className="mt-2 text-sm text-muted-foreground truncate">
              {expense.notes}
            </p>
          )}
        </div>

        <div className="text-right ml-4">
          <div className={cn(
            "text-lg font-bold",
            expense.amount > 0 ? "text-red-600" : "text-green-600"
          )}>
            {formatCurrency(Math.abs(expense.amount))}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {expense.bank}
          </div>
          {!expense.isSettled && expense.splitBetween.length > 1 && (
            <Badge variant="outline" className="mt-2 text-xs">
              Split {expense.splitBetween.length} ways
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ExpenseCard;
