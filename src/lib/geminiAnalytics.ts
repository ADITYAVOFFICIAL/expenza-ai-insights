// src/lib/geminiAnalytics.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Expense, Goal, RecurringExpense, UserProfile } from "@/types/expense";
import { Allowance } from "./allowanceService";
import { format, parseISO } from "date-fns";
import { databaseService, COLLECTIONS } from "./appwrite"; // Import Appwrite services and collections

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

export interface AnalysisPayload {
  userProfile: Partial<UserProfile>;
  allExpenses: Expense[];
  allGoals: Goal[];
  allRecurring: RecurringExpense[];
  allAllowances: Allowance[];
}

/**
 * Fetches all necessary data for a user's financial profile from Appwrite.
 * @param userId The ID of the user.
 * @returns A promise that resolves to the complete AnalysisPayload.
 */
export const fetchFinancialProfileData = async (userId: string): Promise<AnalysisPayload> => {
  try {
    const [
      profileRes,
      expensesRes,
      goalsRes,
      recurringRes,
      allowancesRes,
    ] = await Promise.all([
      databaseService.getDocument(COLLECTIONS.USERS, userId), // CORRECT: Using COLLECTIONS.USERS
      databaseService.getExpenses(userId, 5000),
      databaseService.getGoals(userId),
      databaseService.getRecurringExpenses(userId),
      databaseService.getAllowances(userId),
    ]);

    return {
      userProfile: profileRes as UserProfile,
      allExpenses: expensesRes.documents as Expense[],
      allGoals: goalsRes.documents as Goal[],
      allRecurring: recurringRes.documents as RecurringExpense[],
      allAllowances: allowancesRes.documents as Allowance[],
    };
  } catch (error) {
    console.error("Failed to fetch complete financial profile:", error);
    throw new Error("Could not retrieve all necessary financial data from the database.");
  }
};

// This function processes and summarizes the raw data into a digestible string for the AI
const formatDataForPrompt = (data: AnalysisPayload): string => {
  const { userProfile, allExpenses, allGoals, allRecurring, allAllowances } = data;

  const income = allExpenses.filter(e => e.amount < 0).reduce((sum, e) => sum + Math.abs(e.amount), 0);
  const expenses = allExpenses.filter(e => e.amount >= 0).reduce((sum, e) => sum + e.amount, 0);
  const netSavings = income - expenses;
  
  const spendingByCategory = allExpenses
    .filter(e => e.amount >= 0)
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const recurringCosts = allRecurring.reduce((sum, r) => sum + r.amount, 0);
  const recurringIncome = allAllowances.reduce((sum, a) => sum + a.amount, 0);

  return `
    **User Profile:**
    - Age: ${userProfile.age || 'Not provided'}
    - Occupation: ${userProfile.occupation || 'Not provided'}
    - Country: ${userProfile.country || 'India'}
    - Currency: ${userProfile.currency || 'INR'}

    **Overall Financial Summary (All Time):**
    - Total Income Recorded: ₹${income.toLocaleString()}
    - Total Expenses Recorded: ₹${expenses.toLocaleString()}
    - Net Savings (Income - Expenses): ₹${netSavings.toLocaleString()}
    - Total Transactions: ${allExpenses.length}

    **Spending by Category:**
    ${Object.entries(spendingByCategory).map(([cat, amt]) => `- ${cat}: ₹${amt.toLocaleString()}`).join('\n')}

    **Recurring Monthly Commitments:**
    - Recurring Bills: -₹${recurringCosts.toLocaleString()}
    - Recurring Income (Allowances): +₹${recurringIncome.toLocaleString()}

    **Financial Goals:**
    ${allGoals.map(g => `- Goal: ${g.name}, Target: ₹${g.targetAmount.toLocaleString()}, Saved: ₹${g.currentAmount.toLocaleString()}, Target Date: ${format(parseISO(g.targetDate), 'MMM yyyy')}`).join('\n')}
  `;
};

/**
 * Generates a comprehensive financial analysis for the user.
 * @param data The complete financial data payload for the user.
 * @returns A structured analysis object from the AI.
 */
export const generateComprehensiveAnalysis = async (data: AnalysisPayload) => {
  const formattedData = formatDataForPrompt(data);

  const prompt = `
    You are 'Sam', a world-class, friendly, and insightful financial advisor for the DigiSamahārta app.
    Your goal is to provide a comprehensive, easy-to-understand financial health report for the user based on the data provided.
    The user is from India, and all figures are in INR (₹).

    Analyze the following financial data:
    ${formattedData}

    Based on your analysis, generate a report as a single, valid JSON object. The JSON object MUST have the following structure and nothing else:
    {
      "overallHealthScore": "number",
      "scoreJustification": "string",
      "keyObservations": ["string", "string", "string"],
      "actionableSteps": [
        { "title": "string", "description": "string", "priority": "string" },
        { "title": "string", "description": "string", "priority": "string" },
        { "title": "string", "description": "string", "priority": "string" }
      ],
      "positiveReinforcement": "string",
      "riskAssessment": "string"
    }

    **Instructions for each JSON field:**
    - **overallHealthScore**: A score from 1 to 100 representing the user's financial health. Consider savings rate, goal progress, and spending habits.
    - **scoreJustification**: A single sentence explaining why you gave that score.
    - **keyObservations**: An array of exactly three short, bullet-point style observations. Highlight the most significant spending category, the net savings trend, and goal progress.
    - **actionableSteps**: An array of exactly three concrete, prioritized steps the user can take. Each step should have a 'title', a 'description' of what to do, and a 'priority' ('High', 'Medium', or 'Low').
    - **positiveReinforcement**: A single, encouraging sentence praising something the user is doing well (e.g., consistent saving, low spending in a key area).
    - **riskAssessment**: A single sentence identifying the biggest potential financial risk (e.g., "Your largest risk is the lack of a diversified income stream." or "High discretionary spending could be a risk during emergencies.").

    Now, provide the complete JSON report.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating comprehensive analysis:", error);
    throw new Error("The AI failed to generate your financial overview. Please try again later.");
  }
};