// src/lib/gemini.ts

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Import data files to provide rich context to the AI
import paymentAppsData from '@/data/paymentApps.json';
import banksData from '@/data/banks.json';
import categoriesData from '@/data/categories.json';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generationConfig = {
  temperature: 0.1, // Lower temperature for more factual, less creative responses
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: base64EncodedData, mimeType: file.type },
  };
};

/**
 * Scans a bill/receipt image and extracts structured expense data.
 * @param imageFile The bill image file to scan.
 * @returns A structured object with expense details.
 */
export const scanBillWithGemini = async (imageFile: File) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
  const imagePart = await fileToGenerativePart(imageFile);

  // Provide the AI with lists of known apps, banks, and categories to improve accuracy
  const paymentAppNames = paymentAppsData.map(app => app.name).join(', ');
  const bankNames = banksData.map(bank => bank.name).join(', ');
  const categoryNames = categoriesData.map(cat => cat.name).join(', ');

  const prompt = `
    You are an expert AI assistant for a personal finance app. Your task is to analyze the provided Indian UPI payment screenshot or bill and extract key information into a structured JSON object.

    **JSON Output Structure:**
    {
      "name": "string",
      "amount": "number",
      "date": "string", // Format: YYYY-MM-DD
      "category": "string",
      "paymentApp": "string",
      "bankName": "string"
    }

    **Extraction Rules:**
    1.  **name**:
        - First, look for a user-entered note or description (e.g., a field labeled 'For', 'Note', or a small text box with a description like 'haircut+shave').
        - If no such note exists, use the recipient's name (e.g., 'To Green Mens Saloon').
        - Prioritize the user-entered note as it is more descriptive.

    2.  **amount**:
        - Extract the final total amount paid. It must be a number.
        - If not found, the value should be null.

    3.  **date**:
        - Find the date and format it as YYYY-MM-DD.
        - If the year is missing, assume the current year is 2025.

    4.  **category**:
        - Based on the 'name' and recipient, suggest the MOST relevant category.
        - You MUST choose from this exact list: [${categoryNames}].
        - For example, if the name is 'haircut' or 'saloon', the category should be 'Saloon'. If it's 'Zomato', it should be 'Food & Dining'.

    5.  **paymentApp**:
        - Identify the app used to make the payment.
        - Analyze the visual style of the screenshot (colors, layout, icons).
        - **Crucially, check the UPI IDs.** The recipient's ID often contains the app name (e.g., a UPI ID ending in "@paytm" means the payment app is Paytm).
        - You MUST choose the best match from this list: [${paymentAppNames}].

    6.  **bankName**:
        - Identify the sender's bank from which the money was debited.
        - Look for an explicitly written bank name (e.g., "HDFC Bank", "State Bank of India").
        - **Also, check the sender's UPI ID handle.** A handle like "@pthdfc" strongly implies HDFC Bank, "@oksbi" implies State Bank of India, etc.
        - You MUST choose the best match from this list: [${bankNames}].

    **IMPORTANT:** If a field's value cannot be determined from the image, return an empty string "" for that field, except for "amount" which should be null. Your entire output must be only the JSON object, with no extra text or markdown formatting.
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();
    
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    console.log("Gemini Response:", jsonString); // For debugging
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error scanning bill with Gemini:", error);
    throw new Error("AI could not read the bill. Please enter the details manually.");
  }
};