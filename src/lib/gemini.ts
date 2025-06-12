
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!API_KEY) {
  console.warn('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your environment variables.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Get the model
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

export const geminiService = {
  // Analyze expenses and provide insights
  async analyzeExpenses(expenses: any[]) {
    try {
      const prompt = `
        Analyze the following expense data and provide financial insights:
        ${JSON.stringify(expenses, null, 2)}
        
        Please provide:
        1. Spending patterns and trends
        2. Budget recommendations
        3. Areas where money can be saved
        4. Monthly savings potential
        5. Category-wise analysis
        
        Format the response as JSON with clear sections.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing expenses:', error);
      throw error;
    }
  },

  // Extract data from bill images using OCR
  async extractBillData(imageFile: File) {
    try {
      const imageBase64 = await this.fileToBase64(imageFile);
      
      const prompt = `
        Extract the following information from this bill/receipt image:
        - Vendor/Store name
        - Total amount
        - Date
        - Items purchased (if visible)
        - Category (food, transport, shopping, etc.)
        
        Return the data as JSON format:
        {
          "vendor": "store name",
          "amount": "numerical amount only",
          "date": "YYYY-MM-DD format",
          "items": ["item1", "item2"],
          "category": "category name"
        }
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64.split(',')[1], // Remove data:image/jpeg;base64, prefix
            mimeType: imageFile.type
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      try {
        return JSON.parse(text);
      } catch {
        // If JSON parsing fails, return a structured response
        return {
          vendor: '',
          amount: '',
          date: new Date().toISOString().split('T')[0],
          items: [],
          category: 'other'
        };
      }
    } catch (error) {
      console.error('Error extracting bill data:', error);
      throw error;
    }
  },

  // Generate budget suggestions
  async generateBudgetSuggestions(userProfile: any, expenses: any[]) {
    try {
      const prompt = `
        Based on this user profile and expense history, suggest a personalized budget:
        
        User Profile: ${JSON.stringify(userProfile, null, 2)}
        Recent Expenses: ${JSON.stringify(expenses, null, 2)}
        
        Provide:
        1. Monthly budget breakdown by category
        2. Savings goals
        3. Spending optimization tips
        4. Emergency fund recommendations
        
        Format as JSON with actionable advice.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating budget suggestions:', error);
      throw error;
    }
  },

  // Helper function to convert file to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
};

export default geminiService;
