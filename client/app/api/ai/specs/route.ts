import { apiHandler, requireDealer } from "@/lib/guards";
import { getGeminiModel } from "@/lib/gemini";

// POST /api/ai/specs — auto-populate technical specs & categorized features
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
            "Brand, model, and year are required to fetch specifications.",
        },
        { status: 400 }
      );
    }

    const prompt = `
      You are an expert automotive intelligence system in India. Find the exact technical specifications and features for this car.

      Car Details:
      - Brand: ${String(brand)}
      - Model: ${String(model)}
      - Variant: ${body.variant ? String(body.variant) : "Base"}
      - Year: ${String(year)}
      - Fuel Type: ${body.fuelType ? String(body.fuelType) : "Not specified"}
      - Transmission: ${body.transmission ? String(body.transmission) : "Not specified"}

      Instructions:
      1. Provide authentic Indian automotive specifications and standard features lists for this exact trim.
      2. Return ONLY a valid JSON object. Do not wrap the JSON in markdown code blocks (\`\`\`json). Just the raw JSON.
      3. The JSON must have exactly this structure:
      {
        "engineCC": 1197,
        "power": "88.5 bhp",
        "groundClearance": "163 mm",
        "certifiedMileage": "22 kmpl",
        "features": {
          "comfort": ["Automatic Climate Control", "Rear AC Vents", "Cruise Control", "Keyless Entry"],
          "safety": ["ABS", "EBD", "Dual Airbags", "Reverse Parking Sensors"],
          "interior": ["Fabric Upholstery", "Digital Instrument Cluster", "Adjustable Steering"],
          "exterior": ["LED DRLs", "Body Coloured Bumpers", "Alloy Wheels"]
        }
      }

      Do not include any placeholders, comments, or explanations outside the JSON object. Fill each field with realistic and accurate information based on the variant and year. If the exact value is unknown, use a standard industry estimate for this model.
    `;

    let text: string;
    try {
      const result = await getGeminiModel().generateContent(prompt);
      text = result.response.text();
    } catch (error) {
      console.error("AI Specs Generation Error:", error);
      if ((error as { status?: number }).status === 503) {
        return Response.json(
          {
            message:
              "AI specification service is busy. Please try again in a moment.",
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
      console.error("AI Specs Parse Error:", text);
      throw new Error("AI returned invalid JSON format");
    }
  });
}
