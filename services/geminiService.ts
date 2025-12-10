import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, AIResponse } from "../types";
import { SYSTEM_PROMPT } from "../constants";

const getGeminiClient = () => {
    // Safety check for process.env to avoid crashing in environments where it's not defined
    const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : null;
    
    if (!apiKey) {
        throw new Error("API_KEY não configurada. Verifique as Variáveis de Ambiente no Vercel.");
    }
    return new GoogleGenAI({ apiKey });
};

// Utility to resize and compress image before sending to AI
// Mobile photos are often 5MB+, this reduces them to ~200KB for speed and reliability
const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1024; // Limit width to 1024px
                const scaleSize = MAX_WIDTH / img.width;
                
                // Only resize if image is larger than limit
                if (scaleSize < 1) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Compress to JPEG with 0.7 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                // Remove prefix "data:image/jpeg;base64,"
                const base64 = dataUrl.split(',')[1];
                resolve(base64);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const analyzeMeal = async (
    imageFile: File,
    profile: UserProfile
): Promise<AIResponse> => {
    try {
        const ai = getGeminiClient();
        
        // Use compression
        const base64Data = await compressImage(imageFile);

        const promptText = `
DADOS DO USUÁRIO:
- Fase Atual: ${profile.phase}
- Peso Inicial: ${profile.startWeight}kg
- Peso Atual: ${profile.currentWeight}kg
- Peso Meta: ${profile.goalWeight}kg
- Contexto: ${profile.context || 'Usuário seguindo a dieta com foco.'}

Analise a imagem anexa.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: promptText },
                        {
                            inlineData: {
                                mimeType: "image/jpeg", // Always jpeg after compression
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
            throw new Error("O Gemini não retornou texto. Tente novamente.");
        }

        return JSON.parse(response.text) as AIResponse;
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        // Rethrow with a user-friendly message if it's an API key issue
        if (error.message?.includes("API_KEY")) {
             throw error;
        }
        throw new Error(`Erro na análise: ${error.message || "Tente novamente mais tarde."}`);
    }
};