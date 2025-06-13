export interface Expense {
  $id?: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  date: string; // ISO string
  paymentMethod?: string;
  bank?: string;
  notes?: string;
  receiptUrl?: string;
  groupId?: string;
  splitWith?: string[]; // User IDs
  isRecurring?: boolean; // For marking an expense as a template for recurring ones
  isRecurringInstance?: boolean; // Add this line
  currency?: string;
  $createdAt?: string; // ISO string
  $updatedAt?: string; // ISO string
  // Add any other properties that might exist
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PaymentApp {
  id: string;
  name: string;
  icon: string;
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
  members: string[];
  createdBy: string;
  $createdAt?: string;
  totalExpenses?: number;
}

export interface Goal {
  $id?: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category?: string;
  isAchieved?: boolean;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface RecurringExpense {
  $id?: string;
  userId: string;
  name: string;
  amount: number;
  category: string; // e.g., 'utilities', 'subscription', 'loan'
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string; // ISO date string (e.g., "2024-03-15")
  isActive: boolean;
  bank?: string; // Optional: Associated bank name
  paymentMethod?: string; // Optional: e.g., 'Credit Card', 'Auto Debit'
  notes?: string; // Optional
  lastPaidDate?: string; // Optional: ISO date string of the last payment
  $createdAt?: string;
  $updatedAt?: string;
}

// ...existing code...
export interface UserProfile {
  $id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  preferredCurrency?: string;
  age?: number;
  occupation?: string;
  incomeLevel?: string;
  financialKnowledge?: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance?: 'low' | 'medium' | 'high';
  primaryBank?: string;
  phoneNumber?: string; // Added from Profile.tsx
  avatarUrl?: string; // Added from Profile.tsx (consistent with profilePictureUrl)
  currency?: string; // Added from Profile.tsx (consistent with preferredCurrency)
  idealRetirementAge?: number;
  country?: string;
  themePreference?: 'light' | 'dark' | 'system';
  themeColorsPrimary?: string; // e.g., "150 60% 45%"
  themeColorsAccent?: string;  // e.g., "210 70% 55%"
  $createdAt?: string;
  $updatedAt?: string;
}
interface UserProfileUpdateData {
  name?: string;
  phoneNumber?: string;
  currency?: string;
  avatarUrl?: string;
  age?: number;
  occupation?: string;
  incomeLevel?: string; // e.g., "low", "medium", "high" or a numeric range string
  financialKnowledge?: 'beginner' | 'intermediate' | 'advanced';
  riskTolerance?: 'low' | 'medium' | 'high';
  primaryBank?: string;
  idealRetirementAge?: number;
  country?: string;
  themePreference?: 'light' | 'dark' | 'system';
  themeColorsPrimary?: string;
  themeColorsAccent?: string;
}