import { databaseService, COLLECTIONS } from './appwrite';
import { Query } from 'appwrite';
import { addDays, addMonths, addWeeks, addYears, isBefore, isValid, parseISO, startOfToday, format } from 'date-fns';
import { RecurringExpense } from '@/types/expense';

/**
 * Creates a unique, predictable ID for a generated recurring transaction.
 * This is the key to preventing duplicate entries.
 * @param recurringExpenseId - The ID of the parent recurring template.
 * @param date - The specific due date for this instance.
 * @returns A unique string ID, e.g., "rec_65a5b..._20250601".
 */
const generateRecurringInstanceId = (recurringExpenseId: string, date: Date): string => {
  return `rec_${recurringExpenseId}_${format(date, 'yyyyMMdd')}`;
};

/**
 * Processes past-due recurring expenses and converts them into actual expense transactions.
 * This function is now idempotent, meaning it's safe to run multiple times without creating duplicates.
 * 
 * @param recurringExpenses - The list of all recurring expense templates for the user.
 * @param userId - The current user's ID.
 * @param userName - The current user's name (for the 'paidBy' field).
 * @returns A boolean indicating if any expenses were processed.
 */
export const processPastDueRecurringExpenses = async (recurringExpenses: RecurringExpense[], userId: string, userName: string): Promise<boolean> => {
  let hasChanges = false;
  const today = startOfToday();

  const processingPromises = recurringExpenses.map(async (re) => {
    if (!re.isActive || !re.nextDueDate || !re.$id) return;

    let nextDueDate;
    try {
      nextDueDate = parseISO(re.nextDueDate);
    } catch (e) {
      console.error(`Invalid date format for recurring expense ${re.$id}: ${re.nextDueDate}`);
      return;
    }

    // If the date is valid and in the past, we need to process it.
    if (!isValid(nextDueDate) || !isBefore(nextDueDate, today)) {
      return;
    }

    hasChanges = true;
    let currentDueDate = nextDueDate;

    // Loop to catch up on all missed payments until the due date is in the future.
    while (isBefore(currentDueDate, today)) {
      const instanceId = generateRecurringInstanceId(re.$id, currentDueDate);

      try {
        // IDEMPOTENCY CHECK: See if a document with this ID already exists.
        await databaseService.getDocument(COLLECTIONS.EXPENSES, instanceId);
        // If the above line does not throw an error, it means the document exists.
        // We log this and skip creating a duplicate.
        console.log(`Skipping duplicate creation for ${re.name} on ${format(currentDueDate, 'yyyy-MM-dd')}`);
      } catch (error: any) {
        // A 404 error is EXPECTED if the transaction hasn't been created yet.
        if (error.code === 404) {
          // The transaction does NOT exist, so we can safely create it.
          const expenseTransaction = {
            userId: userId,
            name: re.name,
            amount: re.amount,
            date: currentDueDate.toISOString(),
            category: re.category,
            paymentMethod: re.paymentMethod,
            bank: re.bank,
            notes: re.notes || `Recurring expense paid for ${re.frequency} period.`,
            isRecurringInstance: true,
            currency: 'INR',
            paidBy: userName,
            isSettled: true,
          };

          try {
            // Create the document with our predictable, unique ID.
            await databaseService.createDocument(COLLECTIONS.EXPENSES, expenseTransaction, instanceId);
          } catch (createError) {
            console.error(`Failed to create expense transaction for recurring item ${re.$id}:`, createError);
            return; // Stop processing this item on failure.
          }
        } else {
          // A different error occurred (e.g., network issue). Log it and stop.
          console.error(`Error checking for existing transaction ${instanceId}:`, error);
          return;
        }
      }

      // Always calculate the next due date to move forward.
      switch (re.frequency) {
        case 'daily': currentDueDate = addDays(currentDueDate, 1); break;
        case 'weekly': currentDueDate = addWeeks(currentDueDate, 1); break;
        case 'monthly': currentDueDate = addMonths(currentDueDate, 1); break;
        case 'yearly': currentDueDate = addYears(currentDueDate, 1); break;
        default: currentDueDate = addMonths(currentDueDate, 1); break;
      }
    }

    // After the loop, `currentDueDate` is the next future due date.
    // Update the original recurring expense document with this new date.
    try {
      await databaseService.updateRecurringExpense(re.$id, {
        nextDueDate: currentDueDate.toISOString(),
        lastPaidDate: today.toISOString(), // Optionally update the last paid date
      });
    } catch (error) {
      console.error(`Failed to update nextDueDate for recurring expense ${re.$id}:`, error);
    }
  });

  // Wait for all the individual expense processing promises to resolve.
  await Promise.all(processingPromises);

  return hasChanges;
};