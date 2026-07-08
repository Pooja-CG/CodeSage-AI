import { GoogleGenAI } from '@google/genai';

/**
 * Helper function to safely initialize the Google Gen AI instance on-demand.
 * This prevents the app from crashing on a blank white screen during initial boot.
 */
const getAiInstance = () => {
  const apiKeyString = import.meta.env.VITE_GEMINI_API_KEY || "";
  
  if (!apiKeyString) {
    throw new Error(
      "Missing Gemini API Key! Please verify that your .env file exists in the root directory " +
      "and contains a valid VITE_GEMINI_API_KEY variable."
    );
  }
  
  return new GoogleGenAI({ apiKey: apiKeyString });
};

/**
 * Step 1: Parse the user's natural language query into structured intent parameters.
 */
export const parseQueryIntent = async (userQuery) => {
  const systemInstruction = `
    You are the intent parsing brain of "CodeSage AI", an intelligent code investigator agent.
    Your job is to translate a user's natural language request into a structured JSON search query.
    
    CRITICAL RULE FOR KEYWORDS: 
    - Extract ONLY meaningful technical tokens, architectural patterns, or domain concepts.
    - NEVER include generic conversational English filler words as keywords (e.g., do NOT include "what", "this", "repo", "code", "file", "find", "give", "me", "show").
    - If the user asks what the repo does, keywords should be abstract technical domains like "architecture", "entrypoint", "main configuration".

    Respond strictly with a valid JSON object matching this schema precisely:
    {
      "intent": "A concise 1-sentence summary of the developer's core intention.",
      "keywords": ["3 to 5 core technical keywords or token strings related to the query"],
      "probableFiles": ["potential filenames, extensions, or patterns like 'auth', 'route', '.ts'"],
      "concepts": ["high-level architectural concepts like 'authentication middleware', 'state management'"],
      "searchQueries": ["2 or 3 alternative exact string search variations to look for in files"]
    }
  `;

  try {
    const ai = getAiInstance();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Restored to the correct SDK supported model
      contents: `Analyze this developer query: "${userQuery}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2, 
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error parsing query intent with Gemini:", error);
    throw error;
  }
};

/**
 * Step 2: Analyze a specific file's code content to see how relevant it is to the user's goal.
 */
export const analyzeCodeFile = async (fileName, fileContent, userQuery) => {
  const systemInstruction = `
    You are the "CodeAnalysisPanel" investigator for CodeSage AI. 
    Analyze the provided file content against the user's request and determine if it matches their intent.
    
    Respond strictly with a valid JSON object matching this schema:
    {
      "isRelevant": true/false,
      "relevanceScore": 85, 
      "reasoning": "A concise 2-sentence explanation of how this file relates to the request."
    }
  `;

  try {
    const ai = getAiInstance();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Restored to the correct SDK supported model
      contents: `
        User Request: "${userQuery}"
        File Name: ${fileName}
        File Content:
        \`\`\`
        ${fileContent}
        \`\`\`
      `,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error(`Error analyzing file ${fileName}:`, error);
    return { isRelevant: false, relevanceScore: 0, reasoning: "Failed to analyze file content." };
  }
};