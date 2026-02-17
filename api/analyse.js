import { GoogleGenAI } from "@google/genai";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Toujours renvoyer du JSON, quoi qu'il arrive
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(200).json({ 
      status: "partiel", 
      analyser: "Méthode non autorisée.", 
      message: "Seul POST est supporté.", 
      predictions: [] 
    });
  }

  const busboy = Busboy({ headers: req.headers });
  let fileBuffer = null;
  let fileMimeType = null;
  let promptText = "Analyse cette capture de jeu.";

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
          throw new Error("Le serveur n'a reçu aucune image.");
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("Configuration API Key manquante sur Vercel.");
        }

        const ai = new GoogleGenAI({ apiKey });
        
        // Utilisation de Gemini 3 Flash pour la rapidité sur Vercel
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: promptText },
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

        const result = response.text;

        if (!result) {
          throw new Error("L'IA n'a retourné aucun contenu.");
        }

        // RÉPONSE SUCCÈS - FORMAT OBLIGATOIRE
        return res.status(200).json({
          status: "ok",
          analyser: result,
          source: "image_upload"
        });

      } catch (error) {
        console.error("Critical Backend Error:", error.message);
        // RÉPONSE ÉCHEC - FORMAT OBLIGATOIRE
        return res.status(200).json({
          status: "partiel",
          analyser: "Analyse interrompue : " + (error.message || "Erreur inconnue"),
          message: error.message || "Exception non gérée",
          predictions: []
        });
      } finally {
        resolve();
      }
    });

    busboy.on("error", (err) => {
      res.status(200).json({ 
        status: "partiel", 
        analyser: "Erreur de flux.", 
        message: err.message, 
        predictions: [] 
      });
      resolve();
    });

    req.pipe(busboy);
  });
}