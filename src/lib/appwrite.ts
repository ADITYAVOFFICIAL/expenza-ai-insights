
import { Client, Account, Databases, Storage, Functions, ID } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('684b3fe10028096d94d1');

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
  SPLITS: 'splits'
};

// Storage
export const STORAGE_BUCKET_ID = '684b4546002529c93d14';

// Authentication functions
export const authService = {
  async createAccount(email: string, password: string, name: string) {
    try {
      const userAccount = await account.create(ID.unique(), email, password, name);
      if (userAccount) {
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
      return await account.get();
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
  }
};

// Database functions
export const databaseService = {
  async createExpense(data: any) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        ID.unique(),
        data
      );
    } catch (error) {
      throw error;
    }
  },

  async getExpenses(userId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.EXPENSES,
        [
          // Add query filters as needed
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

  async createGroup(data: any) {
    try {
      return await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.GROUPS,
        ID.unique(),
        data
      );
    } catch (error) {
      throw error;
    }
  },

  async getGroups(userId: string) {
    try {
      return await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.GROUPS
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

  getFilePreview(fileId: string) {
    return storage.getFilePreview(STORAGE_BUCKET_ID, fileId);
  },

  getFileDownload(fileId: string) {
    return storage.getFileDownload(STORAGE_BUCKET_ID, fileId);
  }
};

export default client;
