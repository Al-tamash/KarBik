import { getGeminiModel } from "../utils/ai.js";

/**
 * generateDescription — AI writes a professional car listing description
 *
 * What you just learned:
 * - We build a "prompt" using template literals (backticks) to give the AI specific instructions.
 * - We ask the AI to format the response nicely, avoid markdown symbols if possible, and keep it sales-oriented.
 */
export async function generateDescription(req, res) {
  try {
    const { brand, model, year, mileage, condition, fuelType, transmission } = req.body;

    // Validate minimum required fields
    if (!brand || !model || !year) {
      return res.status(400).json({ message: "Brand, model, and year are required to generate a description." });
    }

    const gemini = getGeminiModel();
    
    const prompt = `
      Write a highly persuasive, professional, and SEO-optimized sales description for a used car listing.
      
      Car Details:
      - Brand: ${brand}
      - Model: ${model}
      - Year: ${year}
      - Mileage: ${mileage || "Not specified"} km
      - Condition: ${condition || "Good"}
      - Fuel Type: ${fuelType || "Not specified"}
      - Transmission: ${transmission || "Not specified"}
      
      Instructions:
      1. Write 2-3 engaging paragraphs focusing on reliability, performance, and value.
      2. Keep the tone professional, trustworthy, and exciting.
      3. Highlight the condition if it's "Excellent" or "Like New".
      4. DO NOT use markdown formatting like asterisks (**) or hashes (#). Return plain text with paragraph breaks.
      5. Keep it under 150 words.
    `;

    const result = await gemini.generateContent(prompt);
    const text = result.response.text();

    res.status(200).json({ description: text });
  } catch (error) {
    console.error("AI Description Error:", error);
    
    // Check if it's a 503 Service Unavailable error (high demand)
    if (error.status === 503) {
      return res.status(503).json({ 
        message: "AI is currently very busy in your region. Please wait 10 seconds and try again." 
      });
    }

    res.status(500).json({ message: "Failed to generate AI description", error: error.message });
  }
}

/**
 * suggestPrice — AI estimates the fair market value of the car
 *
 * What you just learned:
 * - We can force the AI to return data in a specific structure (like JSON) by explicitly telling it to in the prompt.
 * - This allows the frontend to easily parse the minimum and maximum price values.
 */
export async function suggestPrice(req, res) {
  try {
    const { brand, model, year, mileage, condition } = req.body;

    if (!brand || !model || !year) {
      return res.status(400).json({ message: "Brand, model, and year are required for price suggestion." });
    }

    const gemini = getGeminiModel();
    
    const prompt = `
      You are an expert car appraiser in India. Estimate the current fair market price range in Indian Rupees (INR) for the following used car.
      
      Car Details:
      - Brand: ${brand}
      - Model: ${model}
      - Year: ${year}
      - Mileage: ${mileage || "Average"} km
      - Condition: ${condition || "Good"}
      
      Instructions:
      1. Analyze the car's depreciation based on standard Indian used car market trends.
      2. Return ONLY a valid JSON object. Do not wrap the JSON in markdown code blocks (\`\`\`json). Just the raw JSON.
      3. The JSON must have exactly this structure:
      {
        "min": 450000,
        "max": 520000,
        "reason": "A brief 1-sentence explanation of why this price is suggested based on the year and brand."
      }
    `;

    const result = await gemini.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up potential markdown formatting the AI might still include despite instructions
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const parsedJSON = JSON.parse(text);
      res.status(200).json(parsedJSON);
    } catch (parseError) {
      console.error("AI Price Parse Error:", text);
      throw new Error("AI returned invalid JSON format");
    }

  } catch (error) {
    console.error("AI Price Suggestion Error:", error);

    // Check for 503 high demand error
    if (error.status === 503) {
      return res.status(503).json({ 
        message: "AI appraiser is currently busy. Please try again in a moment." 
      });
    }

    res.status(500).json({ message: "Failed to suggest price", error: error.message });
  }
}
