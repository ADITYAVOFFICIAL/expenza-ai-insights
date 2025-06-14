import { databaseService, COLLECTIONS } from './appwrite';
import { ID, Query } from 'appwrite';
import { addDays, addMonths, addWeeks, addYears, isBefore, isValid, parseISO, startOfToday } from 'date-fns';

// Interface for an allowance document stored in Appwrite
export interface Allowance {
  $id: string;
  bankName: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextReceived: string; // ISO date string
  isActive: boolean;
  userId: string;
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

// Interface for data used when creating or updating an allowance
export interface AllowanceData {
  bankName: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextReceived: string; // ISO date string
  isActive: boolean;
}

// Service object for handling CRUD operations for allowances
export const allowanceService = {
  async createAllowance(data: Omit<Allowance, '$id' | 'createdAt' | 'updatedAt' | 'userId'> & { userId: string }): Promise<Allowance> {
    const document = await databaseService.createDocument(
      COLLECTIONS.ALLOWANCES,
      {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ID.unique()
    );
    return document as unknown as Allowance;
  },

  async getAllowances(userId: string): Promise<Allowance[]> {
    const response = await databaseService.listDocuments(
      COLLECTIONS.ALLOWANCES,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt')
      ]
    );
    return response.documents as unknown as Allowance[];
  },

  async updateAllowance(allowanceId: string, data: Partial<Omit<Allowance, '$id' | 'createdAt' | 'userId' | 'updatedAt'>>): Promise<Allowance> {
    const document = await databaseService.updateDocument(
      COLLECTIONS.ALLOWANCES,
      allowanceId,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
    return document as unknown as Allowance;
  },

  async deleteAllowance(allowanceId: string): Promise<void> {
    await databaseService.deleteDocument(
      COLLECTIONS.ALLOWANCES,
      allowanceId
    );
  }
};

/**
 * Processes past-due allowances and converts them into income transactions.
 * This function should be called when the app loads (e.g., on the Dashboard).
 * @param allowances - The list of all allowances for the user.
 * @param userId - The current user's ID.
 * @param userName - The current user's name (for the 'paidBy' field).
 * @returns A boolean indicating if any allowances were processed and changes were made.
 */
export const processPastDueAllowances = async (allowances: Allowance[], userId: string, userName: string): Promise<boolean> => {
  let hasChanges = false;
  const today = startOfToday();
  
  const processingPromises = allowances.map(async (allowance) => {
    if (!allowance.isActive) return;

    let nextDueDate;
    try {
      nextDueDate = parseISO(allowance.nextReceived);
    } catch (e) {
      console.error(`Invalid date format for allowance ${allowance.$id}: ${allowance.nextReceived}`);
      return;
    }

    if (!isValid(nextDueDate) || !isBefore(nextDueDate, today)) {
      return;
    }

    hasChanges = true;
    let currentDueDate = nextDueDate;

    while (isBefore(currentDueDate, today)) {
      const incomeTransaction = {
        userId: userId,
        name: `Allowance: ${allowance.bankName}`,
        amount: -allowance.amount,
        date: currentDueDate.toISOString(),
        category: 'allowance',
        paymentMethod: 'Allowance',
        bank: allowance.bankName,
        notes: `Recurring allowance received for ${allowance.frequency} period.`,
        isRecurringInstance: true, // This attribute is causing the error
        currency: 'INR',
        paidBy: userName, 
        isSettled: true,  
      };
      
      try {
        await databaseService.createDocument(COLLECTIONS.EXPENSES, incomeTransaction);
      } catch (error) {
        console.error(`Failed to create income transaction for allowance ${allowance.$id}:`, error);
        return; 
      }

      switch (allowance.frequency) {
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
          currentDueDate = addMonths(currentDueDate, 1);
          break;
      }
    }

    try {
      await allowanceService.updateAllowance(allowance.$id, {
        nextReceived: currentDueDate.toISOString(),
      });
    } catch (error) {
      console.error(`Failed to update nextReceived date for allowance ${allowance.$id}:`, error);
    }
  });

  await Promise.all(processingPromises);

  return hasChanges;
};