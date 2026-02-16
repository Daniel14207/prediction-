import { GoogleGenAI } from "@google/genai";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method Not Allowed" });
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
          throw new Error("Aucune image détectée.");
        }

        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          throw new Error("Clé API manquante.");
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
          throw new Error("L'IA n'a pas retourné de résultat exploitable.");
        }

        return res.status(200).json({
          status: "ok",
          analyse: result,
          source: "image_upload"
        });
      } catch (error) {
        console.error("Backend Analysis Error:", error);
        return res.status(200).json({
          status: "partial",
          analyse: `Analyse impossible: ${error.message}`,
          message: error.message,
          predictions: []
        });
      } finally {
        resolve();
      }
    });

    busboy.on("error", (error) => {
      res.status(200).json({
        status: "partial",
        analyse: "Échec du transfert de données.",
        message: error.message
      });
      resolve();
    });

    req.pipe(busboy);
  });
}