import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Edit, Trash2, Landmark, CreditCard, Repeat, Briefcase, FileText, ExternalLink } from 'lucide-react'; // Added ExternalLink
import * as LucideIcons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Expense } from '@/types/expense';
import { cn } from '@/lib/utils';
import paymentAppsData from '@/data/paymentApps.json';
import banksData from '@/data/banks.json';
import categoriesData from '@/data/categories.json';
import { storageService } from '@/lib/appwrite';
import { toast } from '@/hooks/use-toast';

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
    // Try to find by name if ID match fails (for legacy or display name cases)
    const categoryByName = categoriesData.find(cat => cat.name.toLowerCase() === categoryId.toLowerCase());
    if (categoryByName) {
        const IconComp = (LucideIcons as unknown)[categoryByName.icon] || defaultIcon;
        return { IconComponent: IconComp, color: categoryByName.color || defaultColor, name: categoryByName.name };
    }
    return { IconComponent: defaultIcon, color: defaultColor, name: categoryId };
  }

  const IconComponent = (LucideIcons as unknown)[category.icon] || defaultIcon;
  return { IconComponent, color: category.color || defaultColor, name: category.name };
};

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onEdit, onDelete }) => {
  const { IconComponent: CategoryIcon, color: categoryColor, name: categoryName } = getCategoryDetails(expense.category);
  
  const paymentIdentifier = expense.paymentMethod || (expense as any).paymentApp;
  const paymentAppDetail = paymentIdentifier ? paymentAppsData.find(app => 
    app.id.toLowerCase() === paymentIdentifier.toLowerCase() || 
    app.name.toLowerCase() === paymentIdentifier.toLowerCase()
  ) : undefined;

  const bankDetail = expense.bank ? banksData.find(bank => 
    bank.id.toLowerCase() === expense.bank!.toLowerCase() ||
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
    setImageError(null);
    if (expense.billImage) {
      try {
        const resultFromService = storageService.getFileView(expense.billImage);
        let imageUrl: string | null = null;

        if (typeof resultFromService === 'string' && resultFromService) {
          imageUrl = resultFromService;
        } else if (resultFromService && typeof (resultFromService as any).href === 'string' && (resultFromService as any).href) {
          imageUrl = (resultFromService as any).href;
        }

        if (imageUrl) {
          setBillImageUrl(imageUrl);
          setShowBillModal(true);
        } else {
          toast({ title: "Error", description: "Could not generate bill image URL.", variant: "destructive" });
          setBillImageUrl(null);
        }
      } catch (error: any) {
        let description = "Could not load bill image.";
        if (error.message && error.message.includes("plan")) {
            description = "Could not load bill image due to plan restrictions or file access issues.";
        } else if (error.code === 404) {
            description = "Bill image not found.";
        } else if (error.name === 'AppwriteException' && error.code === 401) {
            description = "You do not have permission to view this file.";
        }
        toast({ title: "Error Loading Bill", description, variant: "destructive" });
        setBillImageUrl(null);
      }
    } else {
      toast({ title: "No Bill Image", description: "There is no bill image associated with this expense.", variant: "info" });
    }
  };

  const canEdit = onEdit && !expense.isRecurringInstance;
  const canDelete = onDelete && !expense.isRecurringInstance;
  const canViewBill = expense.billImage && !expense.isRecurringInstance;
  const showActionBar = canViewBill || canEdit || canDelete;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 group bg-card text-card-foreground overflow-hidden">
      <CardContent className="p-4">
        {/* Top Section: Main Info */}
        <div className="flex justify-between items-start gap-3">
          {/* Left: Icon, Name, Category */}
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <div 
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${categoryColor}20` /* Softer background */ }}
            >
              <CategoryIcon 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ color: categoryColor }}
                aria-label={`${categoryName} category icon`}
              />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-semibold text-md text-foreground truncate" title={expense.name}>
                {expense.name}
              </h4>
              <p className="text-xs text-muted-foreground capitalize">
                {categoryName}
              </p>
            </div>
          </div>
          {/* Right: Amount, Date */}
          <div className="text-right flex-shrink-0">
            <div className={`text-md font-bold ${expense.amount >= 0 ? 'text-red-600 dark:text-red-500' : 'text-green-600 dark:text-green-500'}`}>
              ₹{Math.abs(expense.amount).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {expense.date ? format(parseISO(expense.date), 'MMM dd, yyyy') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Middle Section: Details (Payment, Bank, Badges) */}
        {(paymentIdentifier || expense.bank || expense.isRecurring || expense.isRecurringInstance || (expense.splitBetween && expense.splitBetween.length > 1)) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            {paymentIdentifier && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-default">
                    {paymentAppDetail?.icon ? (
                      <img src={paymentAppDetail.icon} alt={paymentAppDetail.name} className="w-3.5 h-3.5 object-contain rounded" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate max-w-[100px]">{paymentAppDetail?.name || paymentIdentifier}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p>{paymentAppDetail?.name || paymentIdentifier}</p></TooltipContent>
              </Tooltip>
            )}
            {expense.bank && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-default">
                    {bankDetail?.icon ? (
                      <img src={bankDetail.icon} alt={bankDetail.name} className="w-3.5 h-3.5 object-contain rounded" />
                    ) : (
                      <Landmark className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="truncate max-w-[100px]">{bankDetail?.name || expense.bank}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent><p>{bankDetail?.name || expense.bank}</p></TooltipContent>
              </Tooltip>
            )}
            {(expense.isRecurring || expense.isRecurringInstance) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="py-0.5 px-1.5 border-primary/50 text-primary/90 bg-primary/10 cursor-default">
                    <Repeat className="w-3 h-3 mr-1" /> Recurring
                  </Badge>
                </TooltipTrigger>
                <TooltipContent><p>This is a recurring expense</p></TooltipContent>
              </Tooltip>
            )}
            {expense.splitBetween && expense.splitBetween.length > 1 && (
              <Badge 
                variant={expense.isSettled ? "default" : "outline"} 
                className={cn(
                  "py-0.5 px-1.5 cursor-default",
                  expense.isSettled ? "bg-green-100 text-green-700 hover:bg-green-200/70 border-green-200 dark:bg-green-700/20 dark:text-green-300 dark:border-green-600/30" 
                                    : "border-border"
                )}
              >
                {expense.isSettled ? "Settled" : `Split ${expense.splitBetween.length} ways`}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Action Bar - Conditionally rendered with a border */}
      {showActionBar && (
        <div className="bg-muted/30 dark:bg-muted/10 px-4 py-2 border-t border-border/60 flex justify-end items-center gap-1">
          {canViewBill && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="default" size="sm" className="gap-1.5" onClick={handleViewBillClick} aria-label="View Bill">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs sm:text-sm">View Bill</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>View Bill</p></TooltipContent>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit} aria-label="Edit expense">
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Edit</p></TooltipContent>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={handleDelete} aria-label="Delete expense">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Delete</p></TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

     {showBillModal && billImageUrl && (
        <Dialog open={showBillModal} onOpenChange={setShowBillModal}>
          <DialogContent
            className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-0 border-muted-foreground"
          >
            <DialogHeader className="p-3 sm:p-4 border-transparent">
              <DialogTitle className="text-base sm:text-lg dark:text-foreground">
                Bill for {expense.name || 'this item'}
              </DialogTitle>
              <DialogDescription className="sr-only">
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
                    const specificError = "Could not display the bill image. The file might be corrupted, inaccessible, or not a valid image format.";
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