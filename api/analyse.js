
import { GoogleGenAI } from "@google/genai";
import Busboy from "busboy";

// Disable Vercel's default body parser to handle multipart/form-data via Busboy
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", error: "Method Not Allowed" });
  }

  const busboy = Busboy({ headers: req.headers });
  const fields = {};
  let fileBuffer = null;
  let fileMimeType = null;

  return new Promise((resolve) => {
    // Parse text fields (prompt)
    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    // Parse file (image)
    busboy.on("file", (fieldname, file, info) => {
      fileMimeType = info.mimeType;
      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    // On finish, call Gemini
    busboy.on("finish", async () => {
      try {
        if (!fileBuffer) {
          throw new Error("Aucune image détectée.");
        }

        // Must use process.env.API_KEY as per system instructions
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("Configuration API manquante sur le serveur.");
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = fields.prompt || "Analyse cette capture de jeu de casino.";

        // Use gemini-3-flash-preview as per model selection rules (do not use 1.5-flash)
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
          throw new Error("L'IA n'a pas retourné de texte.");
        }

        // Mandatory response format
        res.status(200).json({
          status: "ok",
          analyse: result,
          source: "image_upload"
        });
        resolve();
      } catch (error) {
        console.error("Analysis Error:", error);
        // Fallback mandatory format
        res.status(200).json({
          status: "partial",
          analyse: {
            message: error.message || "Analyse partielle suite à une erreur technique.",
            predictions: []
          },
          source: "image_upload"
        });
        resolve();
      }
    });

    // Handle errors
    busboy.on("error", (error) => {
      console.error("Busboy Error:", error);
      res.status(200).json({
        status: "partial",
        analyse: {
          message: "Échec du transfert de l'image.",
          predictions: []
        },
        source: "image_upload"
      });
      resolve();
    });

    // Pipe the request to busboy
    req.pipe(busboy);
  });
}
