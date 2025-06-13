import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, ShoppingCart, Utensils, Car, Home, Briefcase, HeartPulse, MoreHorizontal, Banknote, Landmark, Smartphone,CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Expense } from '@/types/expense'; // Make sure this path is correct
import { cn } from '@/lib/utils';

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

const categoryIcons: { [key: string]: React.ElementType } = {
  food: Utensils,
  shopping: ShoppingCart,
  transport: Car,
  utilities: Home,
  entertainment: MoreHorizontal, // Placeholder, replace with a better icon if available
  health: HeartPulse,
  salary: Banknote,
  allowance: Banknote,
  investment: Landmark,
  other: MoreHorizontal,
  // Add more as needed
};

const paymentMethodIcons: { [key: string]: React.ElementType } = {
  cash: Banknote,
  card: CreditCard, // Assuming you have CreditCard icon from lucide-react
  upi: Smartphone, // Placeholder for UPI
  netbanking: Landmark, // Placeholder for Netbanking
  gpay: Smartphone,
  phonepe: Smartphone,
  paytm: Smartphone,
};


const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const CategoryIcon = categoryIcons[expense.category.toLowerCase()] || Briefcase;
  const PaymentIcon = expense.paymentApp ? (paymentMethodIcons[expense.paymentApp.toLowerCase()] || Banknote) : Banknote;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click if any
    onEdit(expense);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(expense.$id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 group">
      <CardContent className="p-3 lg:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
                "w-9 h-9 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center",
                `bg-${expense.category.toLowerCase()}-100 dark:bg-${expense.category.toLowerCase()}-900/30`, // Dynamic background based on category (requires Tailwind JIT or safelisting)
                !categoryIcons[expense.category.toLowerCase()] && "bg-muted" // Fallback background
            )}>
              <CategoryIcon className={cn(
                  "w-4 h-4 lg:w-5 lg:h-5",
                  `text-${expense.category.toLowerCase()}-600 dark:text-${expense.category.toLowerCase()}-400`, // Dynamic text color
                  !categoryIcons[expense.category.toLowerCase()] && "text-muted-foreground" // Fallback text color
              )} />
            </div>
            <div>
              <h4 className="font-medium text-sm lg:text-base text-foreground truncate max-w-[150px] sm:max-w-[200px] lg:max-w-xs">{expense.name}</h4>
              <p className="text-xs text-muted-foreground">
                {format(parseISO(expense.date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-sm lg:text-base font-semibold ${expense.amount > 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
              ₹{Math.abs(expense.amount).toLocaleString()}
            </div>
            {expense.paymentApp && (
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-end gap-1">
                <PaymentIcon className="w-3 h-3" />
                {expense.paymentApp}
              </div>
            )}
            {expense.bank && !expense.paymentApp && ( // Show bank only if paymentApp is not present to avoid redundancy
              <div className="text-xs text-muted-foreground mt-0.5">
                {expense.bank}
              </div>
            )}
            {expense.splitBetween && expense.splitBetween.length > 1 && !expense.isSettled && (
              <Badge variant="outline" className="mt-1.5 text-xs py-0.5 px-1.5">
                Split {expense.splitBetween.length} ways
              </Badge>
            )}
             {expense.isSettled && expense.splitBetween && expense.splitBetween.length > 1 && (
              <Badge variant="default" className="mt-1.5 text-xs py-0.5 px-1.5 bg-success/10 text-success hover:bg-success/20 border border-success/30">
                Settled
              </Badge>
            )}
            
            {(onEdit || onDelete) && (
              <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit</p></TooltipContent>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={handleDelete}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Delete</p></TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseCard;