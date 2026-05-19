import "dotenv/config";

async function test() {
  console.log("Key starting with:", process.env.GEMINI_API_KEY?.substring(0, 5));
  if (!process.env.GEMINI_API_KEY) {
    console.error("API Key not found in .env");
    process.exit(1);
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log("Available Models:");
    data.models?.forEach(m => {
      if (m.supportedGenerationMethods.includes("generateContent")) {
        console.log("- " + m.name);
      }
    });
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
test();
