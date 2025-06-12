
import { databaseService, DATABASE_ID } from './appwrite';
import { ID } from 'appwrite';

export interface Allowance {
  id: string;
  bankName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextReceived: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
}

export const allowanceService = {
  async createAllowance(data: Omit<Allowance, 'id' | 'createdAt'>) {
    try {
      return await databaseService.createDocument(
        DATABASE_ID,
        'allowances',
        ID.unique(),
        {
          ...data,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      throw error;
    }
  },

  async getAllowances(userId: string) {
    try {
      return await databaseService.listDocuments(
        DATABASE_ID,
        'allowances',
        [
          // Add query filters for user
        ]
      );
    } catch (error) {
      throw error;
    }
  },

  async updateAllowance(allowanceId: string, data: Partial<Allowance>) {
    try {
      return await databaseService.updateDocument(
        DATABASE_ID,
        'allowances',
        allowanceId,
        data
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteAllowance(allowanceId: string) {
    try {
      return await databaseService.deleteDocument(
        DATABASE_ID,
        'allowances',
        allowanceId
      );
    } catch (error) {
      throw error;
    }
  }
};
