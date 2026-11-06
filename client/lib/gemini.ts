import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export function getGeminiModel() {
  if (!genAI) throw new Error("Gemini API key is missing");
  return genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
}
