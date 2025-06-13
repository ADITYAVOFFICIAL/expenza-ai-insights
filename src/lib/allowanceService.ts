import { databaseService, COLLECTIONS } from './appwrite';
import { ID, Query } from 'appwrite';

export interface Allowance {
  $id: string; // Changed from id to $id
  bankName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextReceived: string;
  isActive: boolean;
  userId: string;
  createdAt: string; // This is your custom createdAt field
  updatedAt?: string; // This is your custom updatedAt field
}

export interface AllowanceData { // Assuming AllowanceData is for creation/update and might not need $id
  bankName: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextReceived: string;
  isActive: boolean;
  // userId is typically added by the service/backend
}


export const allowanceService = {
  async createAllowance(data: Omit<Allowance, '$id' | 'createdAt' | 'updatedAt' | 'userId'> & { userId: string }): Promise<Allowance> { // Changed 'id' to '$id' in Omit, ensure userId is part of input for creation if not handled by higher level service
    const document = await databaseService.createDocument(
      COLLECTIONS.ALLOWANCES,
      {
        ...data, // userId should be in data here
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
        Query.orderDesc('createdAt') // Using your custom 'createdAt'
      ]
    );
    return response.documents as unknown as Allowance[];
  },

  async updateAllowance(allowanceId: string, data: Partial<Omit<Allowance, '$id' | 'createdAt' | 'userId' | 'updatedAt'>>): Promise<Allowance> { // Changed 'id' to '$id' in Omit
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
