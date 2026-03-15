/**
 * Gemini AI API Service
 * Handles communication with Google's Neural Core AI for advanced circuit analysis
 */

const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

export interface AIAnalysisRequest {
  sceneData: any;
  currentAnalysis: any;
}

export interface AIAnalysisResult {
  insights: string[];
  optimizations: string[];
  extraordinaryFeatures: string[];
  wiringSuggestions: Array<{
    from: string;
    to: string;
    reason: string;
  }>;
}

/**
 * Sends circuit data to Gemini for advanced AI analysis
 */
export async function analyzeWithGemini(request: AIAnalysisRequest): Promise<AIAnalysisResult> {
  if (!API_KEY) {
    console.warn('Neural Core AI Service key not found. Skipping AI analysis.');
    return {
      insights: ['AI analysis is disabled. Please provide an AI service key in the .env file.'],
      optimizations: [],
      extraordinaryFeatures: [],
      wiringSuggestions: []
    };
  }

  const prompt = `
    You are the NEURAL CORE AI, an ultra-advanced Electrical Engineering expert.
    Analyze the following circuit architecture and local telemetry.
    
    CIRCUIT ARCHITECTURE:
    ${JSON.stringify(request.sceneData, null, 2)}
    
    SIMULATION TELEMETRY:
    ${JSON.stringify(request.currentAnalysis, null, 2)}
    
    Please provide:
    1. "insights": High-level engineering insights (EMI/EMC risks, signal integrity, component choices).
    2. "optimizations": Specific DFM (Design for Manufacturability) or performance improvements.
    3. "extraordinaryFeatures": Suggestions to push this design into the "pro" tier (e.g. specialized MCU features, specific filter topologies).
    4. "wiringSuggestions": CRITICAL: Provide suggested point-to-point connections to make the circuit functional or improved. 
       - Use EXACT node labels from the provided data.
       - Each suggestion MUST be technically sound.
    
    Format your response as a JSON object with these exact keys: "insights", "optimizations", "extraordinaryFeatures", "wiringSuggestions".
    Each "wiringSuggestion" should be an object with "from" (EXACT node label), "to" (EXACT node label), and "reason".
    Respond ONLY with the raw JSON object. Do not include markdown formatting or extra text.
  `;

  const maxRetries = 5;
  let retryCount = 0;

  async function attemptFetch(): Promise<AIAnalysisResult> {
    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            response_mime_type: "application/json",
          }
        })
      });

      if (response.status === 429 && retryCount < maxRetries) {
        retryCount++;
        // More aggressive exponential backoff: 3s, 6s, 12s, 24s, 48s
        const backoffTime = Math.pow(2, retryCount - 1) * 3000;
        console.warn(`Gemini API rate limited (429). Retrying in ${backoffTime}ms... (Attempt ${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return attemptFetch();
      }

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Gemini API returned no candidates. This might be due to safety filters.');
      }
      
      const resultText = data.candidates[0].content.parts[0].text;
      return JSON.parse(resultText) as AIAnalysisResult;
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        const backoffTime = Math.pow(2, retryCount - 1) * 3000;
        console.warn(`Gemini API connection error. Retrying in ${backoffTime}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return attemptFetch();
      }
      throw error;
    }
  }

  try {
    return await attemptFetch();
  } catch (error) {
    console.error('Error during Gemini API analysis after retries:', error);
    return {
      insights: ['Failed to reach Neural Core AI: ' + (error as Error).message],
      optimizations: [],
      extraordinaryFeatures: [],
      wiringSuggestions: []
    };
  }
}
