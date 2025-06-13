import React from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, ShoppingCart, Utensils, Car, Home, Briefcase, HeartPulse, MoreHorizontal, Banknote, Landmark, Smartphone,CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Expense } from '@/types/expense';
import { cn } from '@/lib/utils';
import paymentAppsData from '@/data/paymentApps.json';
import banksData from '@/data/banks.json';

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
  entertainment: MoreHorizontal, 
  health: HeartPulse,
  salary: Banknote, // Assuming income might be shown as negative expense or similar
  allowance: Banknote,
  investment: Landmark,
  education: Briefcase, // Example, adjust as needed
  personal: Briefcase,  // Example
  loan: Landmark,       // Example
  subscription: CreditCard, // Example
  other: MoreHorizontal,
};


const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const CategoryIcon = categoryIcons[expense.category?.toLowerCase()] || Briefcase;
  
  const paymentIdentifier = expense.paymentMethod || (expense as any).paymentApp; // Fallback for older data
  const paymentAppDetail = paymentIdentifier ? paymentAppsData.find(app => 
    app.id.toLowerCase() === paymentIdentifier.toLowerCase() || 
    app.name.toLowerCase() === paymentIdentifier.toLowerCase()
  ) : undefined;

  const bankDetail = expense.bank ? banksData.find(bank => 
    bank.name.toLowerCase() === expense.bank!.toLowerCase()
  ) : undefined;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(expense);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expense.$id) {
      onDelete(expense.$id);
    } else {
      // Handle cases where $id might be missing for virtual recurring instances if needed
      // For now, we assume onDelete expects a valid ID for actual deletable expenses
      console.warn("Attempted to delete an expense without an ID.", expense);
    }
  };

  const categorySafelistKey = expense.category?.toLowerCase() || 'other';
  // Ensure these dynamic classes are picked up by Tailwind JIT or safelisted
  // e.g., bg-food-100, text-food-600, dark:bg-food-900/30, dark:text-food-400 etc. for all categories

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group bg-card text-card-foreground">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Left Section: Icon, Name, Date */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0">
            <div className={cn(
                "w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0",
                `bg-${categorySafelistKey}-100 dark:bg-${categorySafelistKey}-900/30`,
                !categoryIcons[categorySafelistKey] && "bg-muted dark:bg-muted/30"
            )}>
              <CategoryIcon className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5",
                  `text-${categorySafelistKey}-600 dark:text-${categorySafelistKey}-400`,
                  !categoryIcons[categorySafelistKey] && "text-muted-foreground"
              )} />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-foreground truncate" title={expense.name}>
                {expense.name}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {expense.date ? format(parseISO(expense.date), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          {/* Right Section: Amount, Payment Details, Actions */}
          <div className="text-right flex flex-col items-end flex-shrink-0 pl-2">
            <div className={`text-base sm:text-lg font-bold ${expense.amount >= 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
              ₹{Math.abs(expense.amount).toLocaleString()}
            </div>

            {/* Payment Details Container */}
            <div className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
              {/* Payment Method Display */}
              {paymentIdentifier && (
                <div className="flex items-center justify-end gap-1" title={paymentAppDetail?.name || paymentIdentifier}>
                  {paymentAppDetail?.icon ? (
                    <img src={paymentAppDetail.icon} alt={paymentAppDetail.name} className="w-3 h-3 sm:w-4 sm:h-4 object-contain rounded" />
                  ) : (
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  )}
                  <span className="truncate max-w-[80px] sm:max-w-[100px]">{paymentAppDetail?.name || paymentIdentifier}</span>
                </div>
              )}

              {/* Bank Display */}
              {expense.bank && (
                <div className="flex items-center justify-end gap-1" title={expense.bank}>
                  {bankDetail?.icon ? (
                    <img src={bankDetail.icon} alt={bankDetail.name} className="w-3 h-3 sm:w-4 sm:h-4 object-contain rounded" />
                  ) : (
                    <Landmark className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  )}
                  <span className="truncate max-w-[80px] sm:max-w-[100px]">{expense.bank}</span>
                </div>
              )}
            </div>
            
            {/* Split Info Badge */}
            {expense.splitBetween && expense.splitBetween.length > 1 && (
              <Badge 
                variant={expense.isSettled ? "default" : "outline"} 
                className={cn(
                  "mt-1.5 text-xs py-0.5 px-1.5",
                  expense.isSettled && "bg-success/10 text-success hover:bg-success/20 border border-success/30"
                )}
              >
                {expense.isSettled ? "Settled" : `Split ${expense.splitBetween.length} ways`}
              </Badge>
            )}

            {/* Action Buttons - Appear on Hover */}
            {(onEdit || onDelete) && !expense.isRecurringInstance && ( // Do not show edit/delete for virtual recurring instances
              <div className="flex gap-1 mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={handleEdit}>
                        <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit</p></TooltipContent>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={handleDelete}>
                        <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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