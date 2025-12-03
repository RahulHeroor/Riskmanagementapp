// This service now communicates with the Backend API to protect the API Key
// It no longer imports @google/genai directly in the browser

const API_BASE = `http://${window.location.hostname}:3001/api/ai`;

export const generateRiskSuggestions = async (assetName: string, context: string): Promise<{ threats: string[], vulnerabilities: string[] }> => {
  try {
    const response = await fetch(`${API_BASE}/suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asset: assetName, context })
    });

    if (!response.ok) throw new Error('Backend API Error');
    return await response.json();
  } catch (error) {
    console.error("AI Service Error:", error);
    return { threats: [], vulnerabilities: [] };
  }
};

export const generateTreatmentPlan = async (riskTitle: string, threat: string, vulnerability: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/treatment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: riskTitle, threat, vulnerability })
    });

    if (!response.ok) throw new Error('Backend API Error');
    const data = await response.json();
    return data.plan || "Could not generate plan.";
  } catch (error) {
    console.error("AI Service Error:", error);
    return "Error generating plan.";
  }
};