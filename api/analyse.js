
import { GoogleGenAI } from "@google/genai";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(200).json({
      status: "partial",
      analyser: {
        type: "unknown",
        resultats: [],
        message: "Méthode non autorisée. Utilisez POST."
      },
      source: "ai_studio"
    });
  }

  const busboy = Busboy({ headers: req.headers });
  let fileBuffer = null;
  let fileMimeType = null;
  let promptText = "";

  return new Promise((resolve) => {
    busboy.on("field", (fieldname, val) => {
      if (fieldname === 'prompt') promptText = val;
    });

    busboy.on("file", (fieldname, file, info) => {
      fileMimeType = info.mimeType;
      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("finish", async () => {
      try {
        if (!fileBuffer || fileBuffer.length === 0) {
          throw new Error("Aucune image reçue.");
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("Clé API manquante.");
        }

        const ai = new GoogleGenAI({ apiKey: apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: promptText || "Analyse cette capture d'écran de casino." },
                {
                  inlineData: {
                    mimeType: fileMimeType || "image/jpeg",
                    data: fileBuffer.toString("base64"),
                  },
                },
              ],
            },
          ],
        });

        const resultText = response.text || "";
        let parsedResults = [];
        let type = "unknown";
        
        // Determiner le type d'analyse
        if (promptText.toLowerCase().includes("aviator")) type = "aviator";
        else if (promptText.toLowerCase().includes("football") || promptText.toLowerCase().includes("foot")) type = "virtuel";
        else if (promptText.toLowerCase().includes("roulette")) type = "roulette";

        // Tentative d'extraction de JSON de la réponse texte
        try {
          const jsonMatch = resultText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
          if (jsonMatch) {
            const potentialJson = JSON.parse(jsonMatch[0].replace(/```json/g, '').replace(/```/g, '').trim());
            parsedResults = potentialJson.predictions || potentialJson.simpleResults || potentialJson.resultats || [potentialJson];
          } else {
            parsedResults = [resultText];
          }
        } catch (e) {
          parsedResults = [resultText];
        }

        res.status(200).json({
          status: "ok",
          analyser: {
            type: type,
            resultats: parsedResults,
            confidence: "high",
            raw_text: resultText // Garder pour compatibilité
          },
          source: "ai_studio"
        });
      } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(200).json({
          status: "partial",
          analyser: {
            type: "unknown",
            resultats: [],
            message: "Analyse partielle – données insuffisantes mais système actif"
          },
          source: "ai_studio"
        });
      } finally {
        resolve();
      }
    });

    busboy.on("error", (err) => {
      res.status(200).json({
        status: "partial",
        analyser: {
          type: "unknown",
          resultats: [],
          message: "Erreur de flux de données."
        },
        source: "ai_studio"
      });
      resolve();
    });

    req.pipe(busboy);
  });
}
