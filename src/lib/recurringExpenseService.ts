import { databaseService, COLLECTIONS } from './appwrite';
import { addDays, addMonths, addWeeks, addYears, isBefore, isValid, parseISO, startOfToday } from 'date-fns';
import { RecurringExpense } from '@/types/expense';

/**
 * Processes past-due recurring expenses and converts them into actual expense transactions.
 * This function should be called when the app loads (e.g., on the Dashboard).
 * It checks each active recurring expense to see if its `nextDueDate` is in the past.
 * If so, it creates corresponding expense transactions and updates the template's
 * `nextDueDate` to the next future occurrence.
 * 
 * @param recurringExpenses - The list of all recurring expense templates for the user.
 * @param userId - The current user's ID.
 * @param userName - The current user's name (for the 'paidBy' field).
 * @returns A boolean indicating if any expenses were processed and changes were made.
 */
export const processPastDueRecurringExpenses = async (recurringExpenses: RecurringExpense[], userId: string, userName: string): Promise<boolean> => {
  let hasChanges = false;
  const today = startOfToday();

  const processingPromises = recurringExpenses.map(async (re) => {
    if (!re.isActive || !re.nextDueDate) return;

    let nextDueDate;
    try {
      nextDueDate = parseISO(re.nextDueDate);
    } catch (e) {
      console.error(`Invalid date format for recurring expense ${re.$id}: ${re.nextDueDate}`);
      return;
    }

    // If the date is invalid or in the future, skip this expense
    if (!isValid(nextDueDate) || !isBefore(nextDueDate, today)) {
      return;
    }

    hasChanges = true;
    let currentDueDate = nextDueDate;

    // Loop to catch up on all missed payments until the due date is in the future
    while (isBefore(currentDueDate, today)) {
      // 1. Create an actual expense transaction for the due date.
      const expenseTransaction = {
        userId: userId,
        name: re.name,
        amount: re.amount, // Positive amount for an expense
        date: currentDueDate.toISOString(),
        category: re.category,
        paymentMethod: re.paymentMethod,
        bank: re.bank,
        notes: re.notes || `Recurring expense paid for ${re.frequency} period.`,
        isRecurringInstance: true, // Mark it as a generated transaction
        currency: 'INR', // Assuming INR, or could be taken from user profile
        paidBy: userName,
        isSettled: true, // Assume recurring bills are settled by the user
      };

      try {
        await databaseService.createDocument(COLLECTIONS.EXPENSES, expenseTransaction);
      } catch (error) {
        console.error(`Failed to create expense transaction for recurring item ${re.$id}:`, error);
        // If one transaction fails, we should probably stop processing this expense to avoid inconsistent state.
        return; 
      }

      // 2. Calculate the next due date based on the frequency
      switch (re.frequency) {
        case 'daily':
          currentDueDate = addDays(currentDueDate, 1);
          break;
        case 'weekly':
          currentDueDate = addWeeks(currentDueDate, 1);
          break;
        case 'monthly':
          currentDueDate = addMonths(currentDueDate, 1);
          break;
        case 'yearly':
          currentDueDate = addYears(currentDueDate, 1);
          break;
        default:
          // Fallback to monthly to prevent infinite loops on invalid frequency
          currentDueDate = addMonths(currentDueDate, 1);
          break;
      }
    }

    // 3. Update the original recurring expense document with the new nextDueDate and lastPaidDate
    try {
      await databaseService.updateRecurringExpense(re.$id!, {
        nextDueDate: currentDueDate.toISOString(),
        lastPaidDate: today.toISOString(), // Optionally update the last paid date to today
      });
    } catch (error) {
      console.error(`Failed to update nextDueDate for recurring expense ${re.$id}:`, error);
    }
  });

  // Wait for all processing to complete
  await Promise.all(processingPromises);

  return hasChanges;
};