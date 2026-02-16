import { GoogleGenAI } from "@google/genai";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Always set header to application/json
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== "POST") {
    return res.status(200).json({ 
      status: "partiel", 
      analyser: "Méthode non autorisée", 
      message: "Seul le POST est accepté", 
      predictions: [] 
    });
  }

  const busboy = Busboy({ headers: req.headers });
  const fields = {};
  let fileBuffer = null;
  let fileMimeType = null;

  return new Promise((resolve) => {
    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val;
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
        if (!fileBuffer) {
          throw new Error("Aucune image détectée dans le flux.");
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("Configuration API absente sur le serveur.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = fields.prompt || "Analyse cette capture de jeu de casino.";

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: prompt },
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
          throw new Error("L'IA a retourné une réponse vide.");
        }

        // FORMAT OBLIGATOIRE – SUCCÈS
        return res.status(200).json({
          status: "ok",
          analyser: result,
          source: "image_upload"
        });
      } catch (error) {
        console.error("Critical Backend Error:", error.message);
        // FORMAT OBLIGATOIRE – ÉCHEC / PARTIEL
        return res.status(200).json({
          status: "partiel",
          analyser: "Analyse partielle - " + (error.message || "Erreur inconnue"),
          message: error.message || "Une erreur est survenue lors de l'analyse IA",
          predictions: []
        });
      } finally {
        resolve();
      }
    });

    busboy.on("error", (error) => {
      console.error("Busboy stream error:", error);
      res.status(200).json({
        status: "partiel",
        analyser: "Échec du transfert d'image",
        message: error.message,
        predictions: []
      });
      resolve();
    });

    req.pipe(busboy);
  });
}