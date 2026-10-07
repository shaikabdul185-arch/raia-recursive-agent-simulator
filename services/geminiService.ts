import { GoogleGenAI } from "@google/genai";
import { AgentState, LayerType } from "../types";

// Helper to determine if we can use Gemini
export const canUseGemini = (): boolean => {
  return !!process.env.API_KEY;
};

export const generateAgentThought = async (
  layer: LayerType,
  context: string,
  state: AgentState
): Promise<string> => {
  if (!process.env.API_KEY) {
    return ""; // Fallback will be handled by UI using constants
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemPrompt = `
      You are an Advanced Recursive AI Agent (RAIA) specialized in Software Reliability Engineering.
      You are currently processing at: ${layer}.
      
      Your internal World Model is:
      ${JSON.stringify(state.worldModel, null, 2)}
      
      Your current Policies are:
      ${JSON.stringify(state.policies.map(p => `${p.trigger} -> ${p.action}`))}

      The current scenario context is: "${context}"

      Task: Generate a short, highly technical, "cyberpunk" style internal monologue (2-3 sentences) representing your thought process at this specific layer.
      Use terminology like "Evaluating vectors", "Optimizing heuristics", "Constraint violation detected", "Re-writing neural pathways".
      Do NOT include preambles. Just the raw thought stream.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ""; // Fallback
  }
};