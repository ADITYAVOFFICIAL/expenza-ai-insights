
import { Client, Account, Databases, Storage, Functions, ID, Query } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '684b3fe10028096d94d1');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Database and Collection IDs
export const DATABASE_ID = 'expenza-db';
export const COLLECTIONS = {
  EXPENSES: 'expenses',
  GROUPS: 'groups',
  GOALS: 'goals',
  CATEGORIES: 'categories',
  USERS: 'users',
  GROUP_MEMBERS: 'group-members',
  SPLITS: 'splits',
  ALLOWANCES: 'allowances',
  RECURRING_EXPENSES: 'recurring-expenses'
};

// Storage
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || '684b4546002529c93d14';

// Authentication functions
export const authService = {
  async createAccount(email: string, password: string, name: string) {
    try {
      const userAccount = await account.create(ID.unique(), email, password, name);
      if (userAccount) {
        // Create user profile document
        await this.createUserProfile(userAccount.$id, {
          name,
          email,
          currency: 'INR',
          parentAccess: false
        });
        return this.login(email, password);
      }
      return userAccount;
    } catch (error) {
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password);
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const user = await account.get();
      // Get user profile
      const profile = await this.getUserProfile(user.$id);
      return { ...user, profile };
    } catch (error) {
      return null;
    }
  },

  async logout() {
    try {
      return await account.deleteSessions();
    } catch (error) {
      throw error;
    }
  },

  async logoutCurrent() {
    try {
      return await account.deleteSession('current');
    } catch (error) {
      throw error;
    }
  },

  async createUserProfile(userId: string, data: any) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          ...data,
          userId,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      throw error;
    }
  },

  async getUserProfile(userId: string) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );
    } catch (error) {
      return null;
    }
  },

  async updateUserProfile(userId: string, data: any) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        data
      );
    } catch (error) {
      throw error;
    }
  }
};

// Database functions
export const databaseService = {
  // Expenses
  async createExpense(data: any) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
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

  async getExpenses(userId: string, limit = 50) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt'),
          Query.limit(limit)
        ]
      );
    } catch (error) {
      throw error;
    }
  },

  async updateExpense(documentId: string, data: any) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        documentId,
        data
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteExpense(documentId: string) {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        documentId
      );
    } catch (error) {
      throw error;
    }
  },

  // Groups
  async createGroup(data: any) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
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

  async getGroups(userId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        [
          Query.search('members', userId),
          Query.orderDesc('createdAt')
        ]
      );
    } catch (error) {
      throw error;
    }
  },

  // Goals
  async createGoal(data: any) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.GOALS,
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

  async getGoals(userId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GOALS,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      );
    } catch (error) {
      throw error;
    }
  },

  async updateGoal(documentId: string, data: any) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.GOALS,
        documentId,
        data
      );
    } catch (error) {
      throw error;
    }
  },

  // Allowances
  async createAllowance(data: any) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ALLOWANCES,
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
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ALLOWANCES,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      );
    } catch (error) {
      throw error;
    }
  },

  async updateAllowance(documentId: string, data: any) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ALLOWANCES,
        documentId,
        data
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteAllowance(documentId: string) {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.ALLOWANCES,
        documentId
      );
    } catch (error) {
      throw error;
    }
  },

  // Recurring Expenses
  async createRecurringExpense(data: any) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.RECURRING_EXPENSES,
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

  async getRecurringExpenses(userId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RECURRING_EXPENSES,
        [
          Query.equal('userId', userId),
          Query.orderDesc('createdAt')
        ]
      );
    } catch (error) {
      throw error;
    }
  },

  // Generic CRUD operations
  async createDocument(collectionId: string, data: any, documentId?: string) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        collectionId,
        documentId || ID.unique(),
        data
      );
    } catch (error) {
      throw error;
    }
  },

  async getDocument(collectionId: string, documentId: string) {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        collectionId,
        documentId
      );
    } catch (error) {
      throw error;
    }
  },

  async listDocuments(collectionId: string, queries: string[] = []) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        queries
      );
    } catch (error) {
      throw error;
    }
  },

  async updateDocument(collectionId: string, documentId: string, data: any) {
    try {
      return await databases.updateDocument(
        DATABASE_ID,
        collectionId,
        documentId,
        data
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteDocument(collectionId: string, documentId: string) {
    try {
      return await databases.deleteDocument(
        DATABASE_ID,
        collectionId,
        documentId
      );
    } catch (error) {
      throw error;
    }
  }
};

// Storage functions
export const storageService = {
  async uploadFile(file: File) {
    try {
      return await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(),
        file
      );
    } catch (error) {
      throw error;
    }
  },

  async deleteFile(fileId: string) {
    try {
      return await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
    } catch (error) {
      throw error;
    }
  },

  getFilePreview(fileId: string, width = 400, height = 400) {
    return storage.getFilePreview(STORAGE_BUCKET_ID, fileId, width, height);
  },

  getFileDownload(fileId: string) {
    return storage.getFileDownload(STORAGE_BUCKET_ID, fileId);
  },

  getFileView(fileId: string) {
    return storage.getFileView(STORAGE_BUCKET_ID, fileId);
  }
};

export default client;
