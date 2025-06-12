
export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  bank: string;
  paymentApp: string;
  date: string;
  notes?: string;
  billImage?: string;
  paidBy: string;
  splitBetween: string[];
  isRecurring?: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isSettled: boolean;
  groupId?: string;
  currency: string;
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
  balance: number;
  accountNumber?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  totalExpenses: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category?: string;
  isAchieved: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  phoneNumber?: string;
  currency: string;
  parentAccess?: boolean;
}
