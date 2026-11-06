import { apiHandler, requireDealer } from "@/lib/guards";
import { getGeminiModel } from "@/lib/gemini";

// POST /api/ai/description — AI writes a sales description
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
            "Brand, model, and year are required to generate a description.",
        },
        { status: 400 }
      );
    }

    const prompt = `
      Write a highly persuasive, professional, and SEO-optimized sales description for a used car listing.

      Car Details:
      - Brand: ${String(brand)}
      - Model: ${String(model)}
      - Year: ${String(year)}
      - Mileage: ${body.mileage ? String(body.mileage) : "Not specified"} km
      - Condition: ${body.condition ? String(body.condition) : "Good"}
      - Fuel Type: ${body.fuelType ? String(body.fuelType) : "Not specified"}
      - Transmission: ${body.transmission ? String(body.transmission) : "Not specified"}

      Instructions:
      1. Write 2-3 engaging paragraphs focusing on reliability, performance, and value.
      2. Keep the tone professional, trustworthy, and exciting.
      3. Highlight the condition if it's "Excellent" or "Like New".
      4. DO NOT use markdown formatting like asterisks (**) or hashes (#). Return plain text with paragraph breaks.
      5. Keep it under 150 words.
    `;

    try {
      const result = await getGeminiModel().generateContent(prompt);
      const text = result.response.text();
      return Response.json({ description: text });
    } catch (error) {
      console.error("AI Description Error:", error);
      if ((error as { status?: number }).status === 503) {
        return Response.json(
          {
            message:
              "AI is currently very busy in your region. Please wait 10 seconds and try again.",
          },
          { status: 503 }
        );
      }
      throw error;
    }
  });
}
