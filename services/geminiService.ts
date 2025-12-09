import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AIResponse } from "../types";
import { SYSTEM_PROMPT } from "../constants";

const getGeminiClient = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY not found in environment variables");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeMeal = async (
    imageFile: File,
    profile: UserProfile
): Promise<AIResponse> => {
    const ai = getGeminiClient();

    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = () => {
            const result = reader.result as string;
            // Remove data url prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });

    const promptText = `
DADOS DO USUÁRIO:
- Fase Atual: ${profile.phase}
- Peso Inicial: ${profile.startWeight}kg
- Peso Atual: ${profile.currentWeight}kg
- Peso Meta: ${profile.goalWeight}kg
- Contexto: ${profile.context || 'Usuário seguindo a dieta com foco.'}

Analise a imagem anexa.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: promptText },
                        {
                            inlineData: {
                                mimeType: imageFile.type,
                                data: base64Data
                            }
                        }
                    ]
                }
            ],
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json",
            }
        });

        if (!response.text) {
            throw new Error("No response text from Gemini");
        }

        return JSON.parse(response.text) as AIResponse;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
};