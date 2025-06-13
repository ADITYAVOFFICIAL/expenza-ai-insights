import { Client, Account, Databases, Storage, Functions, ID, Query, Models, Permission, Role } from 'appwrite';
const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client); // This is the Databases service instance
export const storage = new Storage(client);   // This is the Storage service instance, defined once
export const functions = new Functions(client);

// Define these constants once using environment variables
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const COLLECTIONS = {
  USERS: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
  EXPENSES: import.meta.env.VITE_APPWRITE_EXPENSES_COLLECTION_ID,
  ALLOWANCES: import.meta.env.VITE_APPWRITE_ALLOWANCES_COLLECTION_ID,
  CATEGORIES: import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID, // Ensure this env var exists if used
  RECURRING_EXPENSES: import.meta.env.VITE_APPWRITE_RECURRING_EXPENSES_COLLECTION_ID,
  GROUPS: import.meta.env.VITE_APPWRITE_GROUPS_COLLECTION_ID,
  GOALS: import.meta.env.VITE_APPWRITE_GOALS_COLLECTION_ID,
  GROUP_MEMBERS: import.meta.env.VITE_APPWRITE_GROUP_MEMBERS_COLLECTION_ID, 
  SPLITS: import.meta.env.VITE_APPWRITE_SPLITS_COLLECTION_ID, 
  // Add other collection IDs as needed
  USER_PROFILES: import.meta.env.VITE_APPWRITE_USER_PROFILES_COLLECTION_ID, // Assuming this is the correct name for user profiles
};
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID;

interface UserProfileCreationData {
  name: string;
  email: string;
}
interface UserProfileUpdateData {
  name?: string;
  currency?: string;
  avatarUrl?: string;
  age?: number;
  occupation?: string;
  incomeLevel?: string; // e.g., "low", "medium", "high" or a numeric range string
  financialKnowledge?: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance?: 'low' | 'medium' | 'high';
  primaryBank?: string;
}

export interface GenericDocData { // Made exportable for use in other files if needed
  [key: string]: unknown;
}

export interface PartialGenericDocData { // Made exportable
  [key: string]: unknown | undefined;
}

interface GroupCreationData {
  name: string;
  description?: string;
  adminUserIds: string[]; // Changed from adminId to adminUserIds (array)
  members: string[];      // Changed from memberIds to members (array)
  createdBy: string;      // Changed from createdByUserId to createdBy
  currency?: string;      // Added currency
  avatarUrl?: string;     // Added avatarUrl
}

export const authService = {
  async createAccount(email: string, password: string, name: string) {
    return account.create(ID.unique(), email, password, name);
  },

  async login(email: string, password: string) {
    return account.createEmailPasswordSession(email, password);
  },

  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get();
    } catch (error) {
      // console.error("Failed to get current user:", error);
      return null;
    }
  },

  async logout() {
    return account.deleteSessions();
  },

  async logoutCurrent() {
    return account.deleteSession('current');
  },

  async updatePassword(newPassword: string, oldPassword?: string) {
    // oldPassword is required when user updates their own password
    // It's optional if an admin is resetting a password (not applicable here)
    return account.updatePassword(newPassword, oldPassword);
  },

  async createUserProfile(userId: string, data: UserProfileCreationData) {
    const now = new Date().toISOString();
    return databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId, // Using userId as documentId for user profiles
      {
        name: data.name,
        email: data.email,
        userId: userId, // Storing userId also as a field for easier querying if needed
        createdAt: now,
        updatedAt: now,
        currency: "INR", // Default currency
        avatarUrl: undefined,
        profilePictureUrl: undefined,
        age: undefined,
        occupation: undefined,
        incomeLevel: undefined,
        financialKnowledge: undefined,
        riskTolerance: undefined,
        primaryBank: undefined,
        idealRetirementAge: undefined,
        country: undefined,
        themePreference: 'system', // Default theme preference
        themeColorsPrimary: undefined, // Default theme colors
        themeColorsAccent: undefined,  // Default theme colors
      }
    );
  },

  async getUserProfile(userId: string): Promise<Models.Document | null> {
    try {
      return await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId
      );
    } catch (error) {
      // console.error(`Failed to get user profile for ${userId}:`, error);
      return null; // Return null if profile doesn't exist or other error
    }
  },

  async updateUserProfile(userId: string, data: UserProfileUpdateData) {
    return databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
  }
};

export const databaseService = {
  // Expenses
  async createExpense(data: GenericDocData) {
    const now = new Date().toISOString();
    return databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.EXPENSES,
      ID.unique(),
      { ...data, createdAt: now, updatedAt: now }
    );
  },
  async getExpenses(userId: string, limit: number = 100, offset: number = 0) { // Default limit
    const queries: any[] = [
      Query.equal('userId', userId),
      Query.orderDesc('date'), // Or $createdAt
      Query.limit(limit),
      Query.offset(offset)
    ];
    return databases.listDocuments(DATABASE_ID, COLLECTIONS.EXPENSES, queries);
  },
  async getGroupExpenses(groupId: string, limit = 5) { // New function
    return databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.EXPENSES,
      [
        Query.equal('groupId', groupId),
        Query.limit(limit),
        Query.orderDesc('$createdAt')
      ]
    );
  },
  async updateExpense(documentId: string, data: PartialGenericDocData) {
    return databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.EXPENSES,
      documentId,
      { ...data, updatedAt: new Date().toISOString() }
    );
  },
  async deleteExpense(documentId: string) {
    return databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.EXPENSES,
      documentId
    );
  },

  // Groups
  async createGroup(data: GroupCreationData) {
    return databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      ID.unique(),
      {
        ...data,
        currency: data.currency || 'INR', // Default currency if not provided
      }
    );
  },
  async getGroups(userId: string) {
    return databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUPS,
      [
        Query.contains('members', userId), // Changed from 'memberIds' to 'members'
        Query.orderDesc('$createdAt')
      ]
    );
  },
  // updateGroup and deleteGroup are handled by generic updateDocument/deleteDocument
  // but you might want specific functions if complex logic is needed before/after.

  // Goals
  async createGoal(data: GenericDocData) {
    const now = new Date().toISOString();
    // Ensure userId is included in the data payload passed to this function
    return databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      ID.unique(),
      { ...data, createdAt: now, updatedAt: now }
    );
  },
  async getGoals(userId: string) {
    return databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );
  },
  async updateGoal(documentId: string, data: PartialGenericDocData) {
    return databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      documentId,
      { ...data, updatedAt: new Date().toISOString() }
    );
  },
  async deleteGoal(documentId: string) {
    return databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.GOALS,
      documentId
    );
  },

  // Allowances
  async createAllowance(data: GenericDocData) {
    const now = new Date().toISOString();
    return databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ALLOWANCES,
      ID.unique(),
      { ...data, createdAt: now, updatedAt: now }
    );
  },
  async getAllowances(userId: string) {
    return databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ALLOWANCES,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );
  },
  async updateAllowance(documentId: string, data: PartialGenericDocData) {
    return databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.ALLOWANCES,
      documentId,
      { ...data, updatedAt: new Date().toISOString() }
    );
  },
  async deleteAllowance(documentId: string) {
    return databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.ALLOWANCES,
      documentId
    );
  },

  // Recurring Expenses
  async createRecurringExpense(data: GenericDocData) {
    const now = new Date().toISOString();
    return databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.RECURRING_EXPENSES,
      ID.unique(),
      { ...data, createdAt: now, updatedAt: now }
    );
  },
  async getRecurringExpenses(userId: string) {
    return databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RECURRING_EXPENSES,
      [
        Query.equal('userId', userId),
        Query.orderDesc('nextDueDate') // Or $createdAt, depending on desired sort
      ]
    );
  },
  async updateRecurringExpense(documentId: string, data: PartialGenericDocData) {
    return databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.RECURRING_EXPENSES,
      documentId,
      { ...data, updatedAt: new Date().toISOString() }
    );
  },
  async deleteRecurringExpense(documentId: string) {
    return databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.RECURRING_EXPENSES,
      documentId
    );
  },

  // Generic CRUD
  async createDocument(collectionId: string, data: GenericDocData, documentId?: string) {
    const now = new Date().toISOString();
    return databases.createDocument(
      DATABASE_ID,
      collectionId,
      documentId || ID.unique(),
      { ...data, createdAt: now, updatedAt: now }
    );
  },
  async getDocument(collectionId: string, documentId: string) {
    return databases.getDocument(
      DATABASE_ID,
      collectionId,
      documentId
    );
  },
  async listDocuments(collectionId: string, queries: string[] = []) {
    return databases.listDocuments(
      DATABASE_ID,
      collectionId,
      queries
    );
  },
  async updateDocument(collectionId: string, documentId: string, data: PartialGenericDocData) {
    return databases.updateDocument(
      DATABASE_ID,
      collectionId,
      documentId,
      { ...data, updatedAt: new Date().toISOString() }
    );
  },
  async deleteDocument(collectionId: string, documentId: string) {
    return databases.deleteDocument(
      DATABASE_ID,
      collectionId,
      documentId
    );
  }
};

export const storageService = {
  async uploadFile(file: File, userId?: string) {
    const filePermissions: string[] = [];
    if (userId) {
      // Grant read, update, and delete permissions to the user who uploaded the file
      filePermissions.push(Permission.read(Role.user(userId)));
      filePermissions.push(Permission.update(Role.user(userId)));
      filePermissions.push(Permission.delete(Role.user(userId)));
    }
    // If you need files to be readable by any authenticated user, you could add:
    // filePermissions.push(Permission.read(Role.users()));

    return storage.createFile(
      STORAGE_BUCKET_ID,
      ID.unique(),
      file,
      filePermissions.length > 0 ? filePermissions : undefined // Pass permissions array
    );
  },
  async deleteFile(fileId: string) {
    return storage.deleteFile(STORAGE_BUCKET_ID, fileId);
  },
  getFilePreview(fileId: string, width?: number, height?: number) { // Make width and height optional
    // If width and height are undefined, the Appwrite SDK's getFilePreview
    // will not append width/height query parameters, avoiding transformation.
    return storage.getFilePreview(STORAGE_BUCKET_ID, fileId, width, height);
  },
  getFileDownload(fileId: string) {
    return storage.getFileDownload(STORAGE_BUCKET_ID, fileId);
  },
  getFileView(fileId: string) {
    return storage.getFileView(STORAGE_BUCKET_ID, fileId);
  }
};

export default client; // Export the main client if needed elsewhere, though services are preferred