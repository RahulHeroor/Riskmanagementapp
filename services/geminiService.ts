import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRiskSuggestions = async (assetName: string, context: string): Promise<{ threats: string[], vulnerabilities: string[] }> => {
  if (!apiKey) {
    console.warn("No API Key provided for Gemini");
    return { threats: [], vulnerabilities: [] };
  }

  try {
    const prompt = `Identify top 5 information security threats and 5 vulnerabilities associated with the asset: "${assetName}". Context: ${context}. Return the result in JSON.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            threats: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of potential threats"
            },
            vulnerabilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of potential vulnerabilities"
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return { threats: [], vulnerabilities: [] };
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini AI Error:", error);
    return { threats: [], vulnerabilities: [] };
  }
};

export const generateTreatmentPlan = async (riskTitle: string, threat: string, vulnerability: string): Promise<string> => {
  if (!apiKey) return "API Key missing. Please configure your API key.";

  try {
    const prompt = `Propose a concise, actionable risk treatment plan (mitigation controls) for the following risk in an ISMS context:
    Risk: ${riskTitle}
    Threat: ${threat}
    Vulnerability: ${vulnerability}
    
    Keep it professional and focused on ISO 27001 controls. Max 3 sentences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate plan.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Error generating plan.";
  }
};
