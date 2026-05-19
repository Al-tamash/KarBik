import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

async function listModels() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing");
      return;
    }

    // Note: The @google/generative-ai SDK might not have a direct listModels method in all versions
    // but we can try to find the correct model name by checking the docs or trying common ones.
    console.log("Checking available models...");
    
    // Instead of listing (which might not be in the SDK), let's try to verify if gemini-2.0-flash or gemini-1.5-flash exists
    // Actually, let's just search the web for the exact API model strings for May 2026.
  } catch (error) {
    console.error(error);
  }
}

listModels();
