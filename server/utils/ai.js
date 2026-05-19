import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// Ensure the server fails fast if the API key is missing
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY is missing in the environment variables!");
}

// Initialize the Gemini client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Select the latest flash model (May 2026 standards)
export const getGeminiModel = () => {
  if (!genAI) throw new Error("Gemini API key is missing");
  
  /**
   * As of May 2026, the '3' series models often require the '-preview' suffix 
   * for the latest Flash version.
   */
  return genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
};
