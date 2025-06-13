import { databaseService, COLLECTIONS } from './appwrite';
import { ID, Query } from 'appwrite';

export interface Allowance {
  id: string;
  bankName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextReceived: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt?: string; // Added for consistency if Appwrite auto-updates this
}

export const allowanceService = {
  async createAllowance(data: Omit<Allowance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Allowance> {
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

  async updateAllowance(allowanceId: string, data: Partial<Omit<Allowance, 'id' | 'createdAt' | 'userId'>>): Promise<Allowance> {
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
