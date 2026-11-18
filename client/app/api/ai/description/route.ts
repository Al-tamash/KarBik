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

    // The model writes only from the details the dealer entered. The earlier prompt asked for a
    // "highly persuasive, SEO-optimized" text with a default condition of "Good", which is where
    // invented condition claims and workshop or area names came from.
    const prompt = `
      Write a short, plain description for a used car listing in India.

      Use ONLY these details:
      - Brand: ${String(brand)}
      - Model: ${String(model)}
      - Year: ${String(year)}
      - Mileage: ${body.mileage ? String(body.mileage) + " km" : "not given"}
      - Fuel type: ${body.fuelType ? String(body.fuelType) : "not given"}
      - Transmission: ${body.transmission ? String(body.transmission) : "not given"}

      Rules:
      1. Two short paragraphs, under 80 words in total. Plain text only: no markdown, no emojis.
      2. State only the details above. Do not claim anything else: no condition, accident or service history, number of owners, insurance, warranty or price.
      3. No sales words or superlatives (best, excellent, perfect, flagship, premium, certified, unbeatable, reliable).
      4. Do not mention a dealer, showroom, workshop, service centre, area, city, phone number, email or link.
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
