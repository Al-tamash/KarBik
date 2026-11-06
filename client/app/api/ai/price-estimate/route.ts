import { apiHandler, requireDealer } from "@/lib/guards";
import { getGeminiModel } from "@/lib/gemini";

// POST /api/ai/price-estimate — AI suggests a fair market price range
export async function POST(request: Request) {
  return apiHandler(async () => {
    await requireDealer();
    const body = (await request.json()) as Record<string, unknown>;
    const brand = body.brand;
    const model = body.model;
    const year = body.year;

    if (!brand || !model || !year) {
      return Response.json(
        {
          message:
            "Brand, model, and year are required for price suggestion.",
        },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert car appraiser in India. Estimate the current fair market price range in Indian Rupees (INR) for the following used car.

      Car Details:
      - Brand: ${String(brand)}
      - Model: ${String(model)}
      - Year: ${String(year)}
      - Mileage: ${body.mileage ? String(body.mileage) : "Average"} km
      - Condition: ${body.condition ? String(body.condition) : "Good"}

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

    let text: string;
    try {
      const result = await getGeminiModel().generateContent(prompt);
      text = result.response.text();
    } catch (error) {
      console.error("AI Price Suggestion Error:", error);
      if ((error as { status?: number }).status === 503) {
        return Response.json(
          {
            message:
              "AI appraiser is currently busy. Please try again in a moment.",
          },
          { status: 503 }
        );
      }
      throw error;
    }

    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const parsedJSON: unknown = JSON.parse(text);
      return Response.json(parsedJSON);
    } catch {
      console.error("AI Price Parse Error:", text);
      throw new Error("AI returned invalid JSON format");
    }
  });
}
