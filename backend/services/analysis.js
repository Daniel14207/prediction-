
import { ai } from '../config/gemini.js';

export const analyzeImage = async (base64Image, mimeType, customPrompt) => {
  try {
    // Nettoyage du base64 si l'en-tête est présent (data:image/...)
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const modelId = 'gemini-1.5-flash'; // Modèle rapide et efficace pour la vision

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          parts: [
            { 
              text: customPrompt || "Analyse cette image de jeu de casino et donne une prédiction." 
            },
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64
              }
            }
          ]
        }
      ]
    });

    // Extraction sécurisée du texte
    const textResult = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResult) {
      throw new Error("Aucun résultat retourné par l'IA.");
    }

    return textResult;

  } catch (error) {
    console.error("Erreur Service Gemini:", error);
    throw error;
  }
};
