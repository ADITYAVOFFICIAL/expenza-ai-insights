export interface Expense {
  $id?: string; // Optional: Appwrite document ID
  userId: string; // ID of the user who owns the expense
  name: string;
  amount: number;
  category: string; // e.g., "Food", "Transport", "Entertainment"
  date: string; // ISO date string (e.g., "2023-10-26")
  paymentMethod: string; // e.g., "Credit Card", "Cash", "UPI"
  bank?: string; // Optional: Associated bank name or ID
  notes?: string; // Optional: Additional details
  isRecurring?: boolean; // Optional: If the expense is a recurring one
  recurrenceFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'; // Optional
  recurrenceEndDate?: string; // Optional: ISO date string
  groupId?: string; // Optional: If part of a group expense
  receiptImageUrl?: string; // Optional: URL to a scanned receipt
  tags?: string[]; // Optional: User-defined tags
  location?: string; // Optional: Where the expense was made
  currency?: string; // Optional: e.g., "INR", "USD" (default could be app-wide)
  splitWith?: Array<{ userId: string; amount: number; isSettled?: boolean }>; // Optional: For shared expenses
  $createdAt?: string; // Optional: Appwrite timestamp
  $updatedAt?: string; // Optional: Appwrite timestamp
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string; // Icon name (e.g., from lucide-react)
  color: string; // Hex color string
}

export interface PaymentApp {
  id: string;
  name: string;
  icon: string; // Icon name for UI
}

export interface Bank {
  id: string;
  name: string;
  balance?: number;
  accountNumber?: string;
}

export interface Group {
  $id?: string;
  name: string;
  description?: string;
  members: string[]; // User IDs or names
  createdBy: string; // User ID
  $createdAt?: string;
  totalExpenses?: number;
}

export interface Goal {
  $id?: string; // Appwrite document ID
  userId: string; // ID of the user who owns the goal
  name: string; // Name of the goal (e.g., "Emergency Fund", "Vacation to Europe")
  targetAmount: number; // The total amount to be saved for the goal
  currentAmount: number; // The amount currently saved for the goal
  targetDate: string; // ISO date string (e.g., "2024-12-31") for when the goal should be achieved
  category?: string; // Optional: Category of the goal (e.g., "savings", "travel", "education")
  isAchieved?: boolean; // Optional: Flag to mark if the goal has been achieved
  // Optional: Client-side calculated or denormalized for performance, might not be directly in DB model
  // progress?: number; // Percentage of completion (currentAmount / targetAmount) * 100
  // monthlyTarget?: number; // Calculated suggested monthly contribution
  $createdAt?: string; // Appwrite timestamp
  $updatedAt?: string; // Appwrite timestamp
}

// Represents the user profile data, potentially from your USERS collection
export interface UserProfile {
  $id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  preferredCurrency?: string; // e.g., "INR", "USD"
  // Add other relevant user profile fields
  // For example, fields used in gemini.ts for budget suggestions:
  age?: number;
  occupation?: string;
  incomeLevel?: string; // e.g., "low", "medium", "high" or a numeric range
  financialKnowledge?: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance?: 'low' | 'medium' | 'high';
  primaryBank?: string;
  // ... any other fields you collect for user profile
  $createdAt?: string;
  $updatedAt?: string;
}