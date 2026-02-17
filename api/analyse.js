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
          throw new Error("L'image n'a pas pu être traitée par le serveur.");
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("Clé API manquante dans l'environnement de production.");
        }

        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview", // Version la plus stable et rapide
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
          throw new Error("L'IA n'a pas pu extraire de données de cette image.");
        }

        return res.status(200).json({
          status: "ok",
          analyser: result,
          source: "server_side_vision"
        });

      } catch (error) {
        console.error("Vercel API Error:", error.message);
        return res.status(200).json({
          status: "partiel",
          analyser: "ERREUR D'ANALYSE. VÉRIFIEZ LA NETTETÉ DES IMAGES.",
          message: error.message,
          predictions: []
        });
      } finally {
        resolve();
      }
    });

    busboy.on("error", (err) => {
      res.status(200).json({ 
        status: "partiel", 
        analyser: "ERREUR DE CONNEXION AU SERVEUR.", 
        message: err.message 
      });
      resolve();
    });

    req.pipe(busboy);
  });
}