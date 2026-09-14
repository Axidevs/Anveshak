const { GoogleGenAI } = require("@google/genai");

console.log(
  "Gemini API key loaded:",
  process.env.GEMINI_API_KEY ? "YES" : "NO"
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const createFallbackAnalysis = (reason = "AI analysis could not be completed") => {
  return {
    classification: "UNKNOWN",
    confidence: 0,
    summary: "AI analysis unavailable",
    severity: "MEDIUM",
    reasoning: reason,
    keywords: [],
    aiAvailable: false,
  };
};

const analyzeFIR = async (fir) => {
  const prompt = `
You are an AI assistant for a legal case management system.

Analyze the following FIR and return ONLY valid JSON.

FIR:
- Description: ${fir.incidentDescription || "Not provided"}
- Category: ${fir.category || "Not provided"}
- Location: ${fir.incidentLocation || "Not provided"}
- Incident Date: ${fir.incidentDate || "Not provided"}

Return exactly this structure:
{
  "classification": "THEFT",
  "confidence": 0,
  "summary": "Short summary of the incident",
  "severity": "LOW",
  "reasoning": "Why this classification and severity were selected",
  "keywords": ["keyword1", "keyword2"]
}

Rules:
- classification should be a concise crime category.
- confidence must be a number between 0 and 1.
- severity must be one of LOW, MEDIUM, HIGH.
- Do not include markdown.
- Return only JSON.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text.trim();

    const cleanedText = text
      .replace(/^```json\s*/, "")
      .replace(/^```\s*/, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsedAnalysis = JSON.parse(cleanedText);

    return {
      classification: parsedAnalysis.classification || "UNKNOWN",
      confidence:
        typeof parsedAnalysis.confidence === "number"
          ? parsedAnalysis.confidence
          : 0,
      summary: parsedAnalysis.summary || "No summary available",
      severity: ["LOW", "MEDIUM", "HIGH"].includes(parsedAnalysis.severity)
        ? parsedAnalysis.severity
        : "MEDIUM",
      reasoning: parsedAnalysis.reasoning || "No reasoning available",
      keywords: Array.isArray(parsedAnalysis.keywords)
        ? parsedAnalysis.keywords
        : [],
      aiAvailable: true,
    };
  } catch (error) {
    const errorMessage = error?.message || "";

    console.error("AI FIR analysis failed:", errorMessage);

    if (
      errorMessage.includes("429") ||
      errorMessage.toLowerCase().includes("quota") ||
      errorMessage.toLowerCase().includes("resource_exhausted")
    ) {
      return createFallbackAnalysis(
        "Gemini API quota has been exhausted. Analysis will be retried after quota becomes available."
      );
    }

    if (
      errorMessage.includes("503") ||
      errorMessage.toLowerCase().includes("unavailable")
    ) {
      return createFallbackAnalysis(
        "Gemini service is temporarily unavailable."
      );
    }

    return createFallbackAnalysis(
      "AI analysis could not be completed due to a temporary error."
    );
  }
};

module.exports = {
  analyzeFIR,
};