import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, Landmark, CreditCard, Repeat, Briefcase, FileText } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Expense } from '@/types/expense'; // Ensure this path and type are correct
import { cn } from '@/lib/utils'; // Ensure this path is correct
import paymentAppsData from '@/data/paymentApps.json'; // Ensure this path is correct
import banksData from '@/data/banks.json'; // Ensure this path is correct
import categoriesData from '@/data/categories.json'; // Ensure this path is correct
import { storageService } from '@/lib/appwrite'; // Ensure this path and service are correct
import { toast } from '@/hooks/use-toast'; // Ensure this path and hook are correct

interface ExpenseCardProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

const getCategoryDetails = (categoryId: string | undefined) => {
  const defaultIcon = LucideIcons.Briefcase;
  const defaultColor = 'hsl(var(--muted-foreground))';

  if (!categoryId) {
    return { IconComponent: defaultIcon, color: defaultColor, name: 'Other' };
  }

  const category = categoriesData.find(cat => cat.id.toLowerCase() === categoryId.toLowerCase());
  if (!category) {
    return { IconComponent: defaultIcon, color: defaultColor, name: categoryId };
  }

  const IconComponent = (LucideIcons as any)[category.icon] || defaultIcon;
  return { IconComponent, color: category.color || defaultColor, name: category.name };
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const { IconComponent: CategoryIcon, color: categoryColor, name: categoryName } = getCategoryDetails(expense.category);
  
  const paymentIdentifier = expense.paymentMethod || (expense as any).paymentApp; // Handle potential legacy field
  const paymentAppDetail = paymentIdentifier ? paymentAppsData.find(app => 
    app.id.toLowerCase() === paymentIdentifier.toLowerCase() || 
    app.name.toLowerCase() === paymentIdentifier.toLowerCase()
  ) : undefined;

  const bankDetail = expense.bank ? banksData.find(bank => 
    bank.id.toLowerCase() === expense.bank!.toLowerCase() || // Assuming bank might be stored as ID
    bank.name.toLowerCase() === expense.bank!.toLowerCase()
  ) : undefined;

  const [showBillModal, setShowBillModal] = useState(false);
  const [billImageUrl, setBillImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(expense);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expense.$id) {
      onDelete(expense.$id);
    } else {
      console.warn("Attempted to delete an expense without an ID.", expense);
      toast({ title: "Error", description: "Cannot delete expense: ID is missing.", variant: "destructive" });
    }
  };

  const handleViewBillClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageError(null); // Reset previous errors
    if (expense.billImage) {
      try {
        const resultFromService = storageService.getFileView(expense.billImage);
        let imageUrl: string | null = null;

        if (typeof resultFromService === 'string' && resultFromService) {
          // Case 1: storageService.getFileView returns a string URL directly
          imageUrl = resultFromService;
          console.log("File view URL (string) from storageService:", imageUrl);
        } else if (resultFromService && typeof (resultFromService as any).href === 'string' && (resultFromService as any).href) {
          // Case 2: storageService.getFileView returns an object with an href property (e.g., URL object)
          imageUrl = (resultFromService as any).href;
          console.log("File view URL (from href) from storageService:", imageUrl);
        }

        if (imageUrl) {
          setBillImageUrl(imageUrl);
          setShowBillModal(true);
        } else {
          console.error(
            "Failed to get a valid image URL. Received:", resultFromService, 
            "Type:", typeof resultFromService
          );
          toast({ title: "Error", description: "Could not generate bill image URL. The URL was invalid or empty.", variant: "destructive" });
          setBillImageUrl(null);
        }
      } catch (error: any) {
        console.error("Error in handleViewBillClick (e.g., from storageService.getFileView or processing its result):", error);
        let description = "Could not load bill image. Check console for details.";
        if (error.message && error.message.includes("plan")) {
            description = "Could not load bill image due to plan restrictions or file access issues. Try viewing the original file.";
        } else if (error.code === 404) { // Appwrite might throw an error with a code for not found
            description = "Bill image not found. It might have been deleted or the ID is incorrect.";
        } else if (error.name === 'AppwriteException' && error.code === 401) { // Unauthorized or permissions issue
            description = "You do not have permission to view this file. Please check file permissions in Appwrite Storage.";
        }
        toast({ title: "Error Loading Bill", description, variant: "destructive" });
        setBillImageUrl(null);
      }
    } else {
      toast({ title: "No Bill Image", description: "There is no bill image associated with this expense.", variant: "info" });
    }
  };
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group bg-card text-card-foreground">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          {/* Left Section: Icon, Name, Date */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0">
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${categoryColor}1A` /* For semi-transparent background */ }}
            >
              <CategoryIcon 
                className="w-4 h-4 sm:w-5 sm:h-5" 
                style={{ color: categoryColor }}
                aria-label={`${categoryName} category icon`}
              />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-semibold text-sm sm:text-base text-foreground truncate" title={expense.name}>
                {expense.name}
              </h4>
              <div className="text-xs sm:text-sm text-muted-foreground flex items-center">
                <span>{expense.date ? format(parseISO(expense.date), 'MMM dd, yyyy') : 'N/A'}</span>
                {(expense.isRecurring || expense.isRecurringInstance) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1.5 cursor-default flex items-center">
                        <Repeat className="w-3.5 h-3.5 text-primary" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent><p>Recurring Expense</p></TooltipContent>
                  </Tooltip>
                )}
                {expense.billImage && !expense.isRecurringInstance && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5" onClick={handleViewBillClick} aria-label="View bill">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>View Bill</p></TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Amount, Payment Details, Actions */}
          <div className="text-right flex flex-col items-end flex-shrink-0 pl-2">
            <div className={`text-base sm:text-lg font-bold ${expense.amount >= 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
              ₹{Math.abs(expense.amount).toLocaleString()}
            </div>
            
            <div className="mt-0.5 space-y-0.5 text-xs text-muted-foreground">
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
              {expense.bank && (
                <div className="flex items-center justify-end gap-1" title={bankDetail?.name || expense.bank}>
                  {bankDetail?.icon ? (
                    <img src={bankDetail.icon} alt={bankDetail.name} className="w-3 h-3 sm:w-4 sm:h-4 object-contain rounded" />
                  ) : (
                    <Landmark className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                  )}
                  <span className="truncate max-w-[80px] sm:max-w-[100px]">{bankDetail?.name || expense.bank}</span>
                </div>
              )}
            </div>
            
            {expense.splitBetween && expense.splitBetween.length > 1 && (
              <Badge 
                variant={expense.isSettled ? "default" : "outline"} 
                className={cn(
                  "mt-1.5 text-xs py-0.5 px-1.5",
                  expense.isSettled ? "bg-green-100 text-green-700 hover:bg-green-200/70 border border-green-200 dark:bg-green-700/20 dark:text-green-300 dark:border-green-600/30" 
                                    : "border-border" // Default outline styling
                )}
              >
                {expense.isSettled ? "Settled" : `Split ${expense.splitBetween.length} ways`}
              </Badge>
            )}

            {(onEdit || onDelete) && !expense.isRecurringInstance && (
              <div className="flex gap-1 mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                {onEdit && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={handleEdit} aria-label="Edit expense">
                        <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Edit</p></TooltipContent>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7 text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={handleDelete} aria-label="Delete expense">
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

     {showBillModal && billImageUrl && (
        <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
          <DialogContent
            className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 border-muted-foreground"
            // REMOVED explicit aria-describedby to let Radix auto-wire
          >
            <DialogHeader className="p-3 sm:p-4 border-transparent">
              <DialogTitle className="text-base sm:text-lg dark:text-foreground">
                {/* Ensure expense.name has a fallback if it can be undefined/null */}
                Bill for {expense.name || 'this item'}
              </DialogTitle>
              {/*
                Ensure DialogDescription is rendered and has content.
                Removed sr-only temporarily for testing; if this works, sr-only can be added back.
                If sr-only was the issue, the checker might be too aggressive.
              */}
              <DialogDescription>
                Viewing the uploaded bill image for {expense.name || 'this item'}.
              </DialogDescription>
            </DialogHeader>
            <div className="p-1 sm:p-2 flex-grow overflow-auto">
              {imageError ? (
                  <div className="text-red-500 p-4 text-center">{imageError}</div>
              ) : (
                <img 
                  src={billImageUrl} 
                  alt={`Bill for ${expense.name || 'this item'}`} 
                  className="max-w-full h-auto max-h-[calc(85vh-70px)] block mx-auto rounded"
                  onLoad={() => setImageError(null)}
                  onError={(e) => {
                    console.error("Error loading image into <img> tag:", billImageUrl, e);
                    const specificError = "Could not display the bill image. The file might be corrupted, inaccessible, or not a valid image format. Please also check file permissions in Appwrite Storage.";
                    setImageError(specificError);
                    toast({ 
                      title: "Image Load Error", 
                      description: specificError, 
                      variant: "destructive" 
                    });
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

    </Card>
  );
};

export default ExpenseCard;