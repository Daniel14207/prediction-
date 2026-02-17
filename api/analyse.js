import { GoogleGenAI } from "@google/genai";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Sécurité absolue : Toujours du JSON
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
  let fileBuffer = null;
  let fileMimeType = null;
  let promptText = "Analyse cette capture de jeu de casino.";

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
          return res.status(200).json({
            status: "partiel",
            analyser: "Erreur : Image non reçue par le serveur.",
            message: "Buffer vide",
            predictions: []
          });
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("Clé API manquante dans l'environnement Vercel.");
        }

        const ai = new GoogleGenAI({ apiKey });
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
          throw new Error("L'IA n'a pas pu générer de texte pour cette image.");
        }

        // FORMAT OBLIGATOIRE – SUCCÈS
        return res.status(200).json({
          status: "ok",
          analyser: result,
          source: "image_upload"
        });

      } catch (error) {
        console.error("Vercel Backend Error:", error.message);
        // FORMAT OBLIGATOIRE – ÉCHEC / PARTIEL (Garantit que le frontend reçoit un JSON)
        return res.status(200).json({
          status: "partiel",
          analyser: "Désolé, l'analyse a échoué. Veuillez réessayer avec une capture plus nette.",
          message: error.message,
          predictions: []
        });
      } finally {
        resolve();
      }
    });

    busboy.on("error", (error) => {
      res.status(200).json({
        status: "partiel",
        analyser: "Erreur lors du transfert de l'image.",
        message: error.message,
        predictions: []
      });
      resolve();
    });

    req.pipe(busboy);
  });
}